// Weekly menu windows run Monday 00:00 UTC through Sunday 23:59:59.999 UTC.
// All WeeklyMenuItem.weekStart values are normalized through getWeekStart so
// admin assignments and storefront lookups for "the current week" always
// agree on the same instant, regardless of what day/time the request lands on.
export function getWeekStart(date = new Date()) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  const day = d.getUTCDay(); // 0 = Sunday .. 6 = Saturday
  const diffToMonday = (day + 6) % 7;
  d.setUTCDate(d.getUTCDate() - diffToMonday);
  return d;
}

// Accepts a "YYYY-MM-DD" (or any Date-parseable) target and normalizes it to
// that week's Monday; falls back to the current week when omitted/invalid.
export function parseWeekStart(value) {
  if (!value) return getWeekStart();
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return getWeekStart();
  return getWeekStart(parsed);
}

// The menu is weekly, but a saved week stays published until the admin saves
// a newer one: if nothing was set up for the week containing `date`, the most
// recent earlier week with WeeklyMenuItem rows carries over (same cookies and
// same remaining stock) instead of the storefront going empty every Monday.
// Every read/write of "this week's" menu rows must resolve the week through
// here so the storefront, checkout, POS and admin adjustments agree on it.
// Takes a prisma client or a transaction `tx`. Falls back to the plain week
// start when no menu has ever been saved.
export async function getEffectiveWeekStart(client, date = new Date()) {
  const weekStart = getWeekStart(date);
  const latest = await client.weeklyMenuItem.findFirst({
    where: { weekStart: { lte: weekStart } },
    orderBy: { weekStart: "desc" },
    select: { weekStart: true },
  });
  return latest?.weekStart ?? weekStart;
}
