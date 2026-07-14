// Shared discount math for automatic per-cookie checkout discounts.
// Used by both the cart page (client display) and send-order (server, authoritative).

function isDiscountActive(discount, now) {
  if (!discount.active) return false;
  if (discount.startDate && new Date(discount.startDate) > now) return false;
  if (discount.endDate && new Date(discount.endDate) < now) return false;
  return true;
}

// Given a cookie's price and a list of { discount, quantity } entries — each
// discount checked against its OWN relevant quantity (a cookie-specific
// discount's minQuantity is measured against that cookie's quantity in the
// cart; a cart-wide discount's minQuantity is measured against the total
// quantity of every cookie combined) — returns the best (largest) per-unit
// discount that applies.
export function computeDiscountedUnitPrice(price, discountEntries, now = new Date()) {
  let unitOff = 0;
  for (const { discount: d, quantity } of discountEntries || []) {
    if (!isDiscountActive(d, now)) continue;
    if (quantity < (d.minQuantity ?? 1)) continue;
    const off =
      d.discountType === "PERCENTAGE" ? price * (d.discountValue / 100) : d.discountValue;
    if (off > unitOff) unitOff = off;
  }

  const unitPrice = Math.max(0, price - unitOff);
  return { unitPrice, unitOff };
}

// items: [{ id, quantity, price, ... }]
// discountsByCookieId: { [cookieId]: AutoDiscount[] } — discounts scoped to one cookie;
//   their minQuantity is measured against that cookie's own quantity in the cart.
// globalDiscounts: AutoDiscount[] — discounts with no cookieId ("all cookies"); their
//   minQuantity is measured against the TOTAL quantity of every cookie combined, so a
//   "buy 3+" cart-wide promo unlocks with 1 Chocolate Chip + 1 Oatmeal + 1 Sugar too.
// Returns items enriched with unitPrice/unitOff/lineTotal/lineSavings, plus subtotal totals.
export function computeLineItems(items, discountsByCookieId = {}, globalDiscounts = [], now = new Date()) {
  const cartTotalQuantity = (items || []).reduce((sum, item) => sum + item.quantity, 0);

  const lineItems = (items || []).map((item) => {
    const entries = [
      ...(discountsByCookieId[item.id] || []).map((discount) => ({ discount, quantity: item.quantity })),
      ...globalDiscounts.map((discount) => ({ discount, quantity: cartTotalQuantity })),
    ];
    const { unitPrice, unitOff } = computeDiscountedUnitPrice(item.price, entries, now);
    return {
      ...item,
      unitPrice,
      unitOff,
      lineTotal: unitPrice * item.quantity,
      lineSavings: unitOff * item.quantity,
    };
  });

  const subtotal = lineItems.reduce((sum, i) => sum + i.lineTotal, 0);
  const savings = lineItems.reduce((sum, i) => sum + i.lineSavings, 0);

  return { items: lineItems, subtotal, savings };
}
