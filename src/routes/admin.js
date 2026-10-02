import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAdmin } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();
router.use(requireAdmin);

const STATUSES = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

// GET /api/admin/stats -> revenue and profit (sell price - supplier cost) of paid orders
router.get("/stats", async (req, res) => {
  const [orders, items, byStatus, lowStock] = await Promise.all([
    prisma.order.aggregate({
      where: { paymentStatus: "PAID", status: { not: "CANCELLED" } },
      _sum: { totalCents: true, subtotalCents: true },
      _count: { _all: true },
    }),
    prisma.orderItem.findMany({
      where: { order: { paymentStatus: "PAID", status: { not: "CANCELLED" } } },
      select: { unitCents: true, unitCostCents: true, quantity: true },
    }),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.product.findMany({
      where: { stock: { lte: 5 } },
      select: { id: true, name: true, stock: true },
      orderBy: { stock: "asc" },
    }),
  ]);
  const profitCents = items.reduce((sum, i) => sum + (i.unitCents - i.unitCostCents) * i.quantity, 0);
  res.json({
    orderCount: orders._count._all,
    revenueCents: orders._sum.totalCents ?? 0,
    profitCents,
    byStatus: Object.fromEntries(byStatus.map((s) => [s.status, s._count._all])),
    lowStock,
  });
});

// GET /api/admin/orders?status=PENDING -> includes supplier info, needed to forward the order
router.get(
  "/orders",
  validate({ query: z.object({ status: z.enum(STATUSES).optional() }) }),
  async (req, res) => {
    const orders = await prisma.order.findMany({
      where: { status: req.valid.query.status },
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
    res.json(orders);
  },
);

// PATCH /api/admin/orders/:id  { status: "SHIPPED", trackingNumber: "1Z999..." }
router.patch(
  "/orders/:id",
  validate({
    body: z.object({
      status: z.enum(STATUSES).optional(),
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
