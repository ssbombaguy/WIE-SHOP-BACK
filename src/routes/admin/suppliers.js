import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../db.js";
import { conflict, notFound } from "../../lib/http-error.js";
import { validate } from "../../middleware/validate.js";

const router = Router();

const serialize = ({ _count, ...s }) => ({ ...s, productCount: _count.products });
const include = { _count: { select: { products: true } } };

router.get("/", async (req, res) => {
  const suppliers = await prisma.supplier.findMany({ include, orderBy: { name: "asc" } });
  res.json(suppliers.map(serialize));
});

router.get("/:id", async (req, res) => {
  const supplier = await prisma.supplier.findUnique({ where: { id: req.params.id }, include });
  if (!supplier) throw notFound("Supplier not found");
  res.json(serialize(supplier));
});

const body = z.object({
  name: z.string().trim().min(2, "Name is too short").max(100),
  country: z.string().trim().min(2, "Country is required").max(60),
  contactEmail: z.email("Enter a valid email").trim(),
  website: z.url("Enter a full URL, e.g. https://…").trim().nullish().or(z.literal("").transform(() => null)),
  shippingDays: z.number().int().min(1).max(90),
});

router.post("/", validate({ body }), async (req, res) => {
  const supplier = await prisma.supplier.create({ data: req.valid.body, include });
  res.status(201).json(serialize(supplier));
});

router.put("/:id", validate({ body }), async (req, res) => {
  const supplier = await prisma.supplier.update({ where: { id: req.params.id }, data: req.valid.body, include });
  res.json(serialize(supplier));
});

router.delete("/:id", async (req, res) => {
  const count = await prisma.product.count({ where: { supplierId: req.params.id } });
  if (count > 0) throw conflict(`This supplier still has ${count} products. Move them to another supplier first.`);
  await prisma.supplier.delete({ where: { id: req.params.id } });
  res.status(204).end();
});

export default router;
