// All money values are integer tetri (1 ₾ = 100 tetri).

// Georgian prices already include 18% VAT, so nothing is added on top at checkout.
export const TAX_RATE = 0;

export const SHIPPING_OPTIONS = {
  STANDARD: { label: "Regular shipment", cents: 0, description: "Free, ships from supplier" },
  EXPRESS: { label: "Express", cents: 1500, description: "Get your delivery as soon as possible" },
  SCHEDULED: { label: "Schedule", cents: 2500, description: "Pick a date when you want to get your delivery" },
};

export function calculateTotals(subtotalCents, shippingMethod = "STANDARD") {
  const shippingCents = SHIPPING_OPTIONS[shippingMethod].cents;
  const taxCents = Math.round(subtotalCents * TAX_RATE);
  return { subtotalCents, shippingCents, taxCents, totalCents: subtotalCents + shippingCents + taxCents };
}

export const bundlePrice = (priceCents, discountPercent) => Math.round((priceCents * (100 - discountPercent)) / 100);

// "Cheaper together": an accessory is discounted when a product it's bundled with is in the same cart,
// for at most as many units as there are of those main products (2 phones -> 2 discounted glasses).
// `items` are cart lines { productId, quantity }, `productsById` holds { priceCents }, `links` are
// BundleItem rows { productId, itemId, discountPercent }. Returns the lines with prices filled in.
export function priceLines(items, productsById, links) {
  const qty = new Map();
  for (const i of items) qty.set(i.productId, (qty.get(i.productId) ?? 0) + i.quantity);

  // itemId -> { percent, units }: best discount among mains in the cart, units covered by all of them.
  const offers = new Map();
  for (const l of links) {
    const mainQty = qty.get(l.productId);
    if (!mainQty || l.productId === l.itemId) continue;
    const o = offers.get(l.itemId) ?? { percent: 0, units: 0 };
    offers.set(l.itemId, { percent: Math.max(o.percent, l.discountPercent), units: o.units + mainQty });
  }

  return items.map((i) => {
    const unitCents = productsById.get(i.productId).priceCents;
    const offer = offers.get(i.productId);
    // Lines of the same product (different colors) share the covered units, first come first served.
    const discountedUnits = offer ? Math.min(i.quantity, offer.units) : 0;
    if (offer) offer.units -= discountedUnits;
    const discountCents = discountedUnits * (unitCents - bundlePrice(unitCents, offer?.percent ?? 0));
    return {
      ...i,
      unitCents,
      discountCents,
      discountPercent: discountedUnits ? offer.percent : 0,
      lineCents: unitCents * i.quantity - discountCents,
    };
  });
}
