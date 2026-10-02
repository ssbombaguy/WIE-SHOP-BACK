import { Router } from "express";
import { prisma } from "../db.js";

const router = Router();

// GET /api/categories -> [{ id, name, slug, icon, productCount }]
router.get("/", async (req, res) => {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });
  res.json(
    categories.map(({ _count, sortOrder, ...c }) => ({ ...c, productCount: _count.products })),
  );
});

export default router;
