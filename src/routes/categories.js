import { Router } from "express";
import { prisma } from "../db.js";

const router = Router();

// GET /api/categories -> [{ id, name, slug, icon, productCount }]
// Categories left with only archived products (kept for old orders) are hidden.
router.get("/", async (req, res) => {
  const categories = await prisma.category.findMany({
    where: { products: { some: { archived: false } } },
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: { where: { archived: false } } } } },
  });
  res.json(
    categories.map(({ _count, sortOrder, ...c }) => ({ ...c, productCount: _count.products })),
  );
});

export default router;
