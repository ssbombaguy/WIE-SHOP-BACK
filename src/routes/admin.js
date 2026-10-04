import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { assetUrl } from "../lib/serializers.js";
import { requireAdmin } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import categoryRoutes from "./admin/categories.js";
import productRoutes from "./admin/products.js";
import supplierRoutes from "./admin/suppliers.js";
import uploadRoutes from "./admin/uploads.js";
import userRoutes from "./admin/users.js";

const router = Router();
router.use(requireAdmin);
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/suppliers", supplierRoutes);
router.use("/users", userRoutes);
router.use("/uploads", uploadRoutes);

const STATUSES = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
// Online payment is off for now, so orders arrive UNPAID and count once placed (unless cancelled).
const COUNTED = { status: { not: "CANCELLED" } };

const DAY_MS = 24 * 60 * 60 * 1000;
const CHART_DAYS = 30;

// GET /api/admin/stats -> revenue and profit (sell price - bundle discount - supplier cost) of orders,
// plus daily revenue for the last 30 days and catalog counts for the dashboard.
router.get("/stats", async (req, res) => {
  const since = new Date(Date.now() - (CHART_DAYS - 1) * DAY_MS);
  since.setUTCHours(0, 0, 0, 0);
  const [orders, items, byStatus, lowStock, recent, productCount, customerCount] = await Promise.all([
    prisma.order.aggregate({
      where: COUNTED,
      _sum: { totalCents: true, subtotalCents: true },
      _count: { _all: true },
    }),
    prisma.orderItem.findMany({
      where: { order: COUNTED },
      select: { unitCents: true, unitCostCents: true, quantity: true, discountCents: true },
    }),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.product.findMany({
      where: { stock: { lte: 5 }, archived: false },
      select: { id: true, name: true, stock: true },
      orderBy: { stock: "asc" },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: since }, ...COUNTED },
      select: { createdAt: true, totalCents: true },
    }),
    prisma.product.count({ where: { archived: false } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
  ]);
  // One bucket per UTC day, oldest first, so days without sales still show as 0.
  const salesByDay = Array.from({ length: CHART_DAYS }, (_, i) => ({
    date: new Date(since.getTime() + i * DAY_MS).toISOString().slice(0, 10),
    revenueCents: 0,
    orders: 0,
  }));
  for (const o of recent) {
    const day = salesByDay[Math.floor((o.createdAt - since) / DAY_MS)];
    if (day) {
      day.revenueCents += o.totalCents;
      day.orders += 1;
    }
  }
  const profitCents = items.reduce((sum, i) => sum + (i.unitCents - i.unitCostCents) * i.quantity - i.discountCents, 0);
  const unpaidCount = await prisma.order.count({ where: { ...COUNTED, paymentStatus: "UNPAID" } });
  res.json({
    orderCount: orders._count._all,
    revenueCents: orders._sum.totalCents ?? 0,
    profitCents,
    unpaidCount,
    byStatus: Object.fromEntries(byStatus.map((s) => [s.status, s._count._all])),
    lowStock,
    salesByDay,
    productCount,
    customerCount,
  });
});

// GET /api/admin/orders?status=PENDING -> includes supplier info, needed to forward the order
router.get(
  "/orders",
  validate({ query: z.object({ status: z.enum(STATUSES).optional(), q: z.string().trim().max(100).optional() }) }),
  async (req, res) => {
    const { status, q } = req.valid.query;
    const orders = await prisma.order.findMany({
      where: {
        status,
        ...(q && {
          OR: [
            { orderNumber: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { fullName: { contains: q, mode: "insensitive" } },
          ],
        }),
      },
      include: {
        items: {
          include: {
            product: {
              select: { supplierSku: true, supplier: { select: { name: true, contactEmail: true } } },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(orders.map((o) => ({ ...o, items: o.items.map((i) => ({ ...i, imageUrl: assetUrl(i.imageUrl) })) })));
  },
);

// PATCH /api/admin/orders/:id  { status: "SHIPPED", trackingNumber: "1Z999..." }
router.patch(
  "/orders/:id",
  validate({
    body: z.object({
      status: z.enum(STATUSES).optional(),
      paymentStatus: z.enum(["UNPAID", "PAID", "REFUNDED"]).optional(),
      trackingNumber: z.string().trim().max(60).optional(),
    }),
  }),
  async (req, res) => {
    const order = await prisma.$transaction(async (tx) => {
      const current = await tx.order.findUniqueOrThrow({ where: { id: req.params.id }, include: { items: true } });
      // Cancelling puts the units back in stock.
      if (req.valid.body.status === "CANCELLED" && current.status !== "CANCELLED") {
        for (const item of current.items) {
          await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
        }
      }
      return tx.order.update({ where: { id: current.id }, data: req.valid.body });
    });
    res.json(order);
  },
);

export default router;
