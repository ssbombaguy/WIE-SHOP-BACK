// All money values are integer cents.

export const TAX_RATE = 0.08;

export const SHIPPING_OPTIONS = {
  STANDARD: { label: "Regular shipment", cents: 0, description: "Free, ships from supplier" },
  EXPRESS: { label: "Express", cents: 850, description: "Get your delivery as soon as possible" },
  SCHEDULED: { label: "Schedule", cents: 1500, description: "Pick a date when you want to get your delivery" },
};

export function calculateTotals(subtotalCents, shippingMethod = "STANDARD") {
  const shippingCents = SHIPPING_OPTIONS[shippingMethod].cents;
  const taxCents = Math.round(subtotalCents * TAX_RATE);
  return { subtotalCents, shippingCents, taxCents, totalCents: subtotalCents + shippingCents + taxCents };
}
