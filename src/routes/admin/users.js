import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../db.js";
import { badRequest } from "../../lib/http-error.js";
import { user as serializeUser } from "../../lib/serializers.js";
import { validate } from "../../middleware/validate.js";

const router = Router();

const withCounts = (u) => ({ ...serializeUser(u), orderCount: u._count.orders });

// GET /api/admin/users?q=gmail -> newest first, with how many orders each placed
router.get("/", validate({ query: z.object({ q: z.string().trim().max(100).optional() }) }), async (req, res) => {
  const { q } = req.valid.query;
  const users = await prisma.user.findMany({
    where: q
      ? { OR: [{ email: { contains: q, mode: "insensitive" } }, { name: { contains: q, mode: "insensitive" } }] }
      : undefined,
    include: { _count: { select: { orders: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json(users.map(withCounts));
});

// PATCH /api/admin/users/:id { role: "ADMIN" }
router.patch("/:id", validate({ body: z.object({ role: z.enum(["CUSTOMER", "ADMIN"]) }) }), async (req, res) => {
  // Otherwise the last admin could lock everyone out by demoting themselves.
  if (req.params.id === req.user.id) throw badRequest("You can't change your own role");
  const updated = await prisma.user.update({
    where: { id: req.params.id },
    data: { role: req.valid.body.role },
    include: { _count: { select: { orders: true } } },
  });
  res.json(withCounts(updated));
});

export default router;
