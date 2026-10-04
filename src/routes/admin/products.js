import { Router } from "express";
import { z } from "zod";
import { config } from "../../config.js";
import { prisma } from "../../db.js";
import { badRequest, conflict, notFound } from "../../lib/http-error.js";
import { adminProduct } from "../../lib/serializers.js";
import { SLUG_PATTERN, slugify, slugSchemaMessage } from "../../lib/slug.js";
import { validate } from "../../middleware/validate.js";

const router = Router();

export const CONDITIONS = ["NEW", "REFURBISHED", "USED"];

const include = {
  images: { orderBy: { position: "asc" } },
  category: { select: { id: true, name: true, slug: true } },
  supplier: { select: { id: true, name: true } },
  bundleItems: {
    orderBy: { position: "asc" },
    include: { item: { select: { id: true, name: true, priceCents: true, images: { orderBy: { position: "asc" }, take: 1 } } } },
  },
  _count: { select: { orderItems: true } },
};

const listQuery = z.object({
  q: z.string().trim().max(100).optional(),
  categoryId: z.string().optional(),
  condition: z.enum(CONDITIONS).optional(),
  status: z.enum(["active", "archived", "all"]).default("active"),
  stock: z.enum(["all", "low", "out"]).default("all"),
});

// GET /api/admin/products?q=iphone&status=all&stock=low -> every field, including cost and supplier
router.get("/", validate({ query: listQuery }), async (req, res) => {
  const q = req.valid.query;
  const where = { AND: [] };
  if (q.status !== "all") where.AND.push({ archived: q.status === "archived" });
  if (q.categoryId) where.AND.push({ categoryId: q.categoryId });
  if (q.condition) where.AND.push({ condition: q.condition });
  if (q.stock === "low") where.AND.push({ stock: { gt: 0, lte: 5 } });
  if (q.stock === "out") where.AND.push({ stock: 0 });
  if (q.q) {
    where.AND.push({
      OR: [
        { name: { contains: q.q, mode: "insensitive" } },
        { brand: { contains: q.q, mode: "insensitive" } },
        { supplierSku: { contains: q.q, mode: "insensitive" } },
      ],
    });
  }
  const products = await prisma.product.findMany({ where, include, orderBy: [{ updatedAt: "desc" }, { id: "asc" }] });
  res.json(products.map(adminProduct));
});

router.get("/:id", async (req, res) => {
  const product = await prisma.product.findUnique({ where: { id: req.params.id }, include });
  if (!product) throw notFound("Product not found");
  res.json(adminProduct(product));
});

// The admin sends back the absolute URLs it was given; repo images are stored as "/static/..." paths.
const toStoredUrl = (url) =>
  url.startsWith(`${config.publicUrl}/static/`) ? url.slice(config.publicUrl.length) : url;

const imageInput = z.object({
  url: z.string().trim().min(1, "Image URL is required"),
  alt: z.string().trim().max(200).optional(),
  publicId: z.string().nullish(),
  sourceUrl: z.string().nullish(),
});

const productBody = z
  .object({
    name: z.string().trim().min(2, "Name is too short").max(120),
    slug: z.string().trim().max(140).regex(SLUG_PATTERN, slugSchemaMessage).optional().or(z.literal("")),
    brand: z.string().trim().min(1, "Brand is required").max(60),
    description: z.string().trim().min(1, "Description is required").max(5000),
    descriptionKa: z.string().trim().max(5000).default(""),
    priceCents: z.number().int().min(0),
    compareAtCents: z.number().int().min(0).nullable().default(null),
    costCents: z.number().int().min(0),
    stock: z.number().int().min(0),
    supplierSku: z.string().trim().max(60).default(""),
    rating: z.number().min(0).max(5).default(0),
    reviewCount: z.number().int().min(0).default(0),
    colors: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
    specs: z.record(z.string(), z.string().max(200)).default({}),
    isFeatured: z.boolean().default(false),
    isBestseller: z.boolean().default(false),
    condition: z.enum(CONDITIONS).default("NEW"),
    archived: z.boolean().default(false),
    categoryId: z.string().min(1, "Pick a category"),
    supplierId: z.string().min(1, "Pick a supplier"),
    images: z.array(imageInput).max(12).default([]),
    // "Cheaper together" accessories shown on this product's page.
    bundle: z
      .array(z.object({ itemId: z.string().min(1), discountPercent: z.number().int().min(1, "At least 1%").max(90, "At most 90%") }))
      .max(10)
      .default([]),
  })
  .refine((b) => b.compareAtCents == null || b.compareAtCents > b.priceCents, {
    message: "The old price must be higher than the price",
    path: ["compareAtCents"],
  });

function productData(body) {
  const { images, bundle, slug, categoryId, supplierId, descriptionKa, ...rest } = body;
  return {
    data: {
      ...rest,
      descriptionKa: descriptionKa || null,
      slug: slug || slugify(body.name),
      category: { connect: { id: categoryId } },
      supplier: { connect: { id: supplierId } },
    },
    images: images.map((img, position) => ({
      url: toStoredUrl(img.url),
      alt: img.alt || `${body.name}${images.length > 1 ? ` - view ${position + 1}` : ""}`,
      publicId: img.publicId ?? null,
      sourceUrl: img.sourceUrl ?? null,
      position,
    })),
    // Duplicates collapse to the last entry; a product can't be bundled with itself.
    bundle: [...new Map(bundle.map((b) => [b.itemId, b])).values()].map((b, position) => ({ ...b, position })),
  };
}

async function assertBundle(bundle, selfId) {
  if (bundle.some((b) => b.itemId === selfId)) throw badRequest("A product can't be bundled with itself", { bundle: "Remove this product from its own bundle" });
  const found = await prisma.product.count({ where: { id: { in: bundle.map((b) => b.itemId) } } });
  if (found !== bundle.length) throw badRequest("One of the bundle products no longer exists", { bundle: "Pick the accessories again" });
}

async function assertSlugFree(slug, exceptId) {
  const taken = await prisma.product.findUnique({ where: { slug }, select: { id: true } });
  if (taken && taken.id !== exceptId) {
    throw conflict("Another product already uses this URL slug", { slug: "Already in use" });
  }
}

router.post("/", validate({ body: productBody }), async (req, res) => {
  const { data, images, bundle } = productData(req.valid.body);
  await assertSlugFree(data.slug);
  await assertBundle(bundle);
  const product = await prisma.product.create({
    data: { ...data, images: { create: images }, bundleItems: { create: bundle } },
    include,
  });
  res.status(201).json(adminProduct(product));
});

// PUT replaces the whole product, images included (the edit form always sends everything).
router.put("/:id", validate({ body: productBody }), async (req, res) => {
  const { data, images, bundle } = productData(req.valid.body);
  await assertSlugFree(data.slug, req.params.id);
  await assertBundle(bundle, req.params.id);
  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: { ...data, images: { deleteMany: {}, create: images }, bundleItems: { deleteMany: {}, create: bundle } },
    include,
  });
  res.json(adminProduct(product));
});

// PATCH for quick actions from the list: archive/restore, restock, toggle featured.
const quickBody = z
  .object({
    archived: z.boolean(),
    stock: z.number().int().min(0),
    isFeatured: z.boolean(),
    isBestseller: z.boolean(),
  })
  .partial();

router.patch("/:id", validate({ body: quickBody }), async (req, res) => {
  const product = await prisma.product.update({ where: { id: req.params.id }, data: req.valid.body, include });
  // An archived product can't be favorited, same as the seed's cleanup.
  if (req.valid.body.archived) await prisma.favorite.deleteMany({ where: { productId: product.id } });
  res.json(adminProduct(product));
});

// Products that appear in orders can't be deleted (order history points at them); archive those.
router.delete("/:id", async (req, res) => {
  const product = await prisma.product.findUnique({ where: { id: req.params.id }, include: { _count: { select: { orderItems: true } } } });
  if (!product) throw notFound("Product not found");
  if (product._count.orderItems > 0) throw conflict("This product is in past orders. Archive it instead of deleting.");
  await prisma.product.delete({ where: { id: product.id } });
  res.status(204).end();
});

export default router;
