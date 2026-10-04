import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../db.js";
import { conflict, notFound } from "../../lib/http-error.js";
import { SLUG_PATTERN, slugify, slugSchemaMessage } from "../../lib/slug.js";
import { validate } from "../../middleware/validate.js";

const router = Router();

// Icon keys the storefront knows how to draw (see CategoryIcon.jsx in the shop).
export const CATEGORY_ICONS = ["phone", "charger", "shield", "headphones"];

const serialize = ({ _count, ...c }) => ({ ...c, productCount: _count.products });
const include = { _count: { select: { products: { where: { archived: false } } } } };

router.get("/", async (req, res) => {
  const categories = await prisma.category.findMany({ include, orderBy: { sortOrder: "asc" } });
  res.json(categories.map(serialize));
});

router.get("/:id", async (req, res) => {
  const category = await prisma.category.findUnique({ where: { id: req.params.id }, include });
  if (!category) throw notFound("Category not found");
  res.json(serialize(category));
});

const body = z.object({
  name: z.string().trim().min(2, "Name is too short").max(60),
  slug: z.string().trim().max(60).regex(SLUG_PATTERN, slugSchemaMessage).optional().or(z.literal("")),
  icon: z.enum(CATEGORY_ICONS),
  sortOrder: z.number().int().min(0).default(0),
});

const data = (b) => ({ ...b, slug: b.slug || slugify(b.name) });

router.post("/", validate({ body }), async (req, res) => {
  const category = await prisma.category.create({ data: data(req.valid.body), include });
  res.status(201).json(serialize(category));
});

router.put("/:id", validate({ body }), async (req, res) => {
  const category = await prisma.category.update({ where: { id: req.params.id }, data: data(req.valid.body), include });
  res.json(serialize(category));
});

router.delete("/:id", async (req, res) => {
  const count = await prisma.product.count({ where: { categoryId: req.params.id } });
  if (count > 0) throw conflict(`Move or delete its ${count} products first (archived ones count too).`);
  await prisma.category.delete({ where: { id: req.params.id } });
  res.status(204).end();
});

export default router;
