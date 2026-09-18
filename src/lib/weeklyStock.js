// Shared helper for every place that needs to nudge a cookie's weekly batch
// `sold` counter outside of the checkout flow (send-order does its own
// row-locked version inline since it must reject the whole order atomically):
// admin manual adjustments, POS best-effort sync, and restoring stock when a
// sale is deleted/canceled.
//
// Must be called inside a prisma.$transaction((tx) => ...) — takes the `tx`
// client so callers can bundle it with their own writes (e.g. deleting the
// sale) atomically.
//
// `delta` > 0 records additional units sold (shrinks remaining); `delta` < 0
// restores units (grows remaining). Always clamped to [0, batchLimit] so a
// bad delta can never show a negative sold count or a remaining above the
// batch limit. Returns the updated row, or null if that cookie has no
// WeeklyMenuItem for the given week (nothing to adjust).
export async function adjustWeeklySold(tx, cookieId, weekStart, delta) {
  const existing = await tx.weeklyMenuItem.findUnique({
    where: { cookieId_weekStart: { cookieId, weekStart } },
  });
  if (!existing) return null;

  const sold = Math.min(Math.max(existing.sold + delta, 0), existing.batchLimit);
  return tx.weeklyMenuItem.update({ where: { id: existing.id }, data: { sold } });
}
