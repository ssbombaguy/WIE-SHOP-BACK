import { Router } from "express";
import { prisma } from "../db.js";
import { notFound } from "../lib/http-error.js";
import { productCard, productCardInclude } from "../lib/serializers.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

// GET /api/favorites -> product cards the user saved, newest first
router.get("/", async (req, res) => {
  const favorites = await prisma.favorite.findMany({
    where: { userId: req.user.id, product: { archived: false } },
    include: { product: { include: productCardInclude } },
    orderBy: { createdAt: "desc" },
  });
  res.json(favorites.map((f) => productCard(f.product)));
});

// PUT is idempotent: saving twice is fine.
router.put("/:productId", async (req, res) => {
  const { productId } = req.params;
  const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true, archived: true } });
  if (!product || product.archived) throw notFound("Product not found");
  await prisma.favorite.upsert({
    where: { userId_productId: { userId: req.user.id, productId } },
    create: { userId: req.user.id, productId },
    update: {},
  });
  res.status(204).end();
});

router.delete("/:productId", async (req, res) => {
  await prisma.favorite.deleteMany({ where: { userId: req.user.id, productId: req.params.productId } });
  res.status(204).end();
});

export default router;
