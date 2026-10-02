import { config } from "../config.js";

// Images stored in /public are saved as "/static/..." paths; the browser needs a full URL.
export const assetUrl = (url) => (url?.startsWith("/") ? config.publicUrl + url : url);

// Shape database rows for the storefront. Anything internal (cost price, supplier SKU,
// supplier contact) is deliberately left out so it never reaches the browser.

export const productCardInclude = {
  images: { orderBy: { position: "asc" }, take: 1 },
  category: { select: { name: true, slug: true } },
};

export const productDetailInclude = {
  images: { orderBy: { position: "asc" } },
  category: { select: { name: true, slug: true } },
  supplier: { select: { shippingDays: true, country: true } },
};

export function productCard(p) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    brand: p.brand,
    priceCents: p.priceCents,
    compareAtCents: p.compareAtCents,
    rating: p.rating,
    reviewCount: p.reviewCount,
    inStock: p.stock > 0,
    isFeatured: p.isFeatured,
    isBestseller: p.isBestseller,
    image: p.images[0] ? { url: assetUrl(p.images[0].url), alt: p.images[0].alt } : null,
    category: p.category,
  };
}

export function productDetail(p) {
  return {
    ...productCard(p),
    description: p.description,
    stock: p.stock,
    colors: p.colors,
    specs: p.specs,
    images: p.images.map(({ url, alt, sourceUrl }) => ({ url: assetUrl(url), alt, sourceUrl })),
    shipping: { days: p.supplier.shippingDays, from: p.supplier.country },
  };
}

export function user(u) {
  return { id: u.id, email: u.email, name: u.name, role: u.role, createdAt: u.createdAt };
}

export function order(o) {
  // eslint-disable-next-line no-unused-vars
  const { userId, items, ...rest } = o;
  return {
    ...rest,
    items: items?.map(({ unitCostCents, orderId, ...item }) => ({ ...item, imageUrl: assetUrl(item.imageUrl) })),
  };
}
