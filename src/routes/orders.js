import crypto from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { HttpError, badRequest, conflict, notFound, unauthorized } from "../lib/http-error.js";
import { SHIPPING_OPTIONS, calculateTotals, priceLines } from "../lib/pricing.js";
import * as serialize from "../lib/serializers.js";
import { productCard, productCardInclude } from "../lib/serializers.js";
import { optionalAuth, requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

const cartItems = z
  .array(
    z.object({
      productId: z.string().min(1),
      quantity: z.number().int().min(1).max(10),
      color: z.string().max(40).optional(),
    }),
  )
  .min(1, "Your cart is empty")
  .max(50);

const shippingMethod = z.enum(Object.keys(SHIPPING_OPTIONS)).default("STANDARD");

// Same product + color added twice -> one line with the summed quantity.
function mergeItems(items) {
  const map = new Map();
  for (const item of items) {
    const key = `${item.productId}:${item.color ?? ""}`;
    const prev = map.get(key);
    map.set(key, prev ? { ...prev, quantity: prev.quantity + item.quantity } : { ...item });
  }
  return [...map.values()];
}

// Bundle links between products that are both in the cart ("cheaper together" discounts).
const bundleLinks = (db, ids) => db.bundleItem.findMany({ where: { productId: { in: ids }, itemId: { in: ids } } });

// POST /api/orders/quote
// The cart lives in the browser; this re-prices it with current DB prices and stock,
// so the cart page never shows a stale price and checkout totals match the server.
router.post(
  "/quote",
  validate({ body: z.object({ items: cartItems, shippingMethod }) }),
  async (req, res) => {
    const items = mergeItems(req.valid.body.items);
    const products = await prisma.product.findMany({
      where: { id: { in: items.map((i) => i.productId) }, archived: false },
      include: productCardInclude,
    });
    const byId = new Map(products.map((p) => [p.id, p]));

    // Price only what can actually be bought (quantities capped to stock), bundle discounts included.
    const available = items
      .filter((i) => byId.has(i.productId))
      .map((i) => ({ ...i, quantity: Math.min(i.quantity, byId.get(i.productId).stock) }));
    const priced = priceLines(available, byId, await bundleLinks(prisma, [...byId.keys()]));

    const lines = items.map((item) => {
      const p = byId.get(item.productId);
      if (!p) return { ...item, product: null, problem: "This product is no longer available" };
      const line = priced.find((l) => l.productId === item.productId && l.color === item.color);
      return {
        ...item,
        quantity: line.quantity,
        product: productCard(p),
        stock: p.stock,
        unitCents: line.unitCents,
        discountCents: line.discountCents,
        discountPercent: line.discountPercent,
        lineCents: line.lineCents,
        problem:
          p.stock === 0 ? "Out of stock" : line.quantity < item.quantity ? `Only ${p.stock} left in stock` : null,
      };
    });
    const subtotal = lines.reduce((sum, l) => sum + (l.lineCents ?? 0), 0);
    const discountCents = lines.reduce((sum, l) => sum + (l.discountCents ?? 0), 0);
    res.json({
      lines,
      totals: { ...calculateTotals(subtotal, req.valid.body.shippingMethod), discountCents },
      shippingOptions: Object.entries(SHIPPING_OPTIONS).map(([method, o]) => ({ method, ...o })),
    });
  },
);

const orderBody = z
  .object({
    email: z.email("Enter a valid email").trim().toLowerCase(),
    items: cartItems,
    shippingMethod,
    scheduledFor: z.coerce.date().optional(),
    address: z.object({
      fullName: z.string().trim().min(2, "Enter your full name").max(100),
      phone: z.string().trim().regex(/^[+\d][\d\s()-]{6,20}$/, "Enter a valid phone number"),
      addressLine: z.string().trim().min(4, "Enter your street address").max(200),
      city: z.string().trim().min(2, "Enter your city").max(80),
      // Checkout no longer asks for these; the store ships within Georgia.
      postalCode: z.string().trim().max(12).optional(),
      country: z.string().trim().min(2).max(60).default("Georgia"),
    }),
    // Demo card payment, switched off in the storefront for now: orders arrive unpaid and the shop
    // arranges payment. When sent, the full card number never leaves the browser, only brand + last 4.
    payment: z
      .object({
        cardBrand: z.string().max(20),
        cardLast4: z.string().regex(/^\d{4}$/, "Invalid card"),
      })
      .optional(),
  })
  .refine((o) => o.shippingMethod !== "SCHEDULED" || (o.scheduledFor && o.scheduledFor > new Date()), {
    path: ["scheduledFor"],
    message: "Pick a delivery date in the future",
  });

const newOrderNumber = () => `CY-${crypto.randomBytes(4).toString("hex").toUpperCase().slice(0, 7)}`;

// POST /api/orders -> places an order (guest or signed in)
router.post("/", optionalAuth, validate({ body: orderBody }), async (req, res) => {
  const body = req.valid.body;

  // Mirrors Stripe's test card 4000 0000 0000 0002 so the "card declined" UI can be demoed.
  if (body.payment?.cardLast4 === "0002") {
    throw new HttpError(402, "Your card was declined. Try a different card.", { payment: "declined" });
  }

  const items = mergeItems(body.items);

  const order = await prisma.$transaction(async (tx) => {
    const products = await tx.product.findMany({
      where: { id: { in: items.map((i) => i.productId) }, archived: false },
      include: { images: { orderBy: { position: "asc" }, take: 1 } },
    });
    const byId = new Map(products.map((p) => [p.id, p]));

    for (const item of items) {
      const p = byId.get(item.productId);
      if (!p) throw badRequest("A product in your cart is no longer available");
      // Only decrements if enough stock is left; two buyers can't both get the last unit.
      const { count } = await tx.product.updateMany({
        where: { id: p.id, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });
      if (count === 0) throw conflict(`Sorry, "${p.name}" only has ${p.stock} left in stock`);
    }

    const priced = priceLines(items, byId, await bundleLinks(tx, [...byId.keys()]));
    const subtotal = priced.reduce((sum, l) => sum + l.lineCents, 0);
    return tx.order.create({
      data: {
        orderNumber: newOrderNumber(),
        userId: req.user?.id,
        email: body.email,
        shippingMethod: body.shippingMethod,
        scheduledFor: body.shippingMethod === "SCHEDULED" ? body.scheduledFor : null,
        ...calculateTotals(subtotal, body.shippingMethod),
        ...body.address,
        cardBrand: body.payment?.cardBrand ?? null,
        cardLast4: body.payment?.cardLast4 ?? null,
        paymentStatus: body.payment ? "PAID" : "UNPAID",
        items: {
          create: priced.map((i) => {
            const p = byId.get(i.productId);
            return {
              productId: p.id,
              productName: p.name,
              imageUrl: p.images[0]?.url,
              color: i.color,
              unitCents: p.priceCents,
              unitCostCents: p.costCents,
              quantity: i.quantity,
              discountCents: i.discountCents,
            };
          }),
        },
      },
      include: { items: true },
    });
  });

  res.status(201).json({ order: serialize.order(order) });
});

// GET /api/orders -> the signed-in user's orders
router.get("/", requireAuth, async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(orders.map(serialize.order));
});

// GET /api/orders/CY-1A2B3C4?email=guest@mail.com
// Owners (signed in) can always see it; guests must supply the email used at checkout.
router.get("/:orderNumber", optionalAuth, async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { orderNumber: req.params.orderNumber.toUpperCase() },
    include: { items: true },
  });
  if (!order) throw notFound("We couldn't find that order");

  const isOwner = req.user && (req.user.id === order.userId || req.user.role === "ADMIN");
  const emailMatches = String(req.query.email ?? "").trim().toLowerCase() === order.email;
  if (!isOwner && !emailMatches) {
    throw req.user ? notFound("We couldn't find that order") : unauthorized("Enter the email used for this order");
  }
  res.json({ order: serialize.order(order) });
});

export default router;
