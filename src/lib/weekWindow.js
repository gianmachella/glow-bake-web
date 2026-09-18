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
