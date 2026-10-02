import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { notFound } from "../lib/http-error.js";
import { productCard, productCardInclude, productDetail, productDetailInclude } from "../lib/serializers.js";
import { validate } from "../middleware/validate.js";

const router = Router();

const SORTS = {
  newest: [{ createdAt: "desc" }],
  "price-asc": [{ priceCents: "asc" }],
  "price-desc": [{ priceCents: "desc" }],
  rating: [{ rating: "desc" }, { reviewCount: "desc" }],
  popular: [{ reviewCount: "desc" }],
};

const csv = z
  .string()
  .optional()
  .transform((v) => (v ? v.split(",").map((s) => s.trim()).filter(Boolean) : []));
const flag = z.enum(["true", "false"]).optional().transform((v) => v === "true");

const listQuery = z.object({
  category: z.string().optional(),
  q: z.string().trim().max(100).optional(),
  brands: csv,
  minPrice: z.coerce.number().min(0).optional(), // dollars
  maxPrice: z.coerce.number().min(0).optional(),
  featured: flag,
  bestseller: flag,
  onSale: flag,
  sort: z.enum(Object.keys(SORTS)).default("newest"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(12),
});

// Filters shared by the list and facets endpoints.
function buildWhere(q, { ignoreBrands = false, ignorePrice = false } = {}) {
  const where = { AND: [] };
  if (q.category) where.AND.push({ category: { slug: q.category } });
  if (q.q) {
    where.AND.push({
      OR: [
        { name: { contains: q.q, mode: "insensitive" } },
        { brand: { contains: q.q, mode: "insensitive" } },
        { category: { name: { contains: q.q, mode: "insensitive" } } },
      ],
    });
  }
  if (!ignoreBrands && q.brands?.length) where.AND.push({ brand: { in: q.brands } });
  if (!ignorePrice && q.minPrice != null) where.AND.push({ priceCents: { gte: Math.round(q.minPrice * 100) } });
  if (!ignorePrice && q.maxPrice != null) where.AND.push({ priceCents: { lte: Math.round(q.maxPrice * 100) } });
  if (q.featured) where.AND.push({ isFeatured: true });
  if (q.bestseller) where.AND.push({ isBestseller: true });
  if (q.onSale) where.AND.push({ compareAtCents: { not: null } });
  return where;
}

// GET /api/products?category=phones&brands=Apple,Samsung&minPrice=100&sort=price-asc&page=2
router.get("/", validate({ query: listQuery }), async (req, res) => {
  const q = req.valid.query;
  const where = buildWhere(q);
  // Run the page query and the count in one round trip.
  const [rows, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      include: productCardInclude,
      orderBy: [...SORTS[q.sort], { id: "asc" }],
      skip: (q.page - 1) * q.limit,
      take: q.limit,
    }),
    prisma.product.count({ where }),
  ]);
  res.json({
    items: rows.map(productCard),
    page: q.page,
    limit: q.limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / q.limit)),
  });
});

// GET /api/products/facets?category=phones -> brands with counts + price range, for the filter sidebar.
router.get("/facets", validate({ query: listQuery }), async (req, res) => {
  const q = req.valid.query;
  const [brands, price] = await Promise.all([
    prisma.product.groupBy({
      by: ["brand"],
      where: buildWhere(q, { ignoreBrands: true }),
      _count: { _all: true },
      orderBy: { brand: "asc" },
    }),
    prisma.product.aggregate({
      where: buildWhere(q, { ignorePrice: true }),
      _min: { priceCents: true },
      _max: { priceCents: true },
    }),
  ]);
  res.json({
    brands: brands.map((b) => ({ name: b.brand, count: b._count._all })),
    price: { minCents: price._min.priceCents ?? 0, maxCents: price._max.priceCents ?? 0 },
  });
});

// GET /api/products/iphone-13-pro -> full product + related products from the same category
router.get("/:slug", async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { slug: req.params.slug },
    include: productDetailInclude,
  });
  if (!product) throw notFound("This product doesn't exist or was removed");

  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id } },
    include: productCardInclude,
    orderBy: { rating: "desc" },
    take: 4,
  });
  res.json({ product: productDetail(product), related: related.map(productCard) });
});

export default router;
