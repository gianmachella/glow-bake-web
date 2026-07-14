// startDate/endDate on promotions, announcements, and discounts are entered via
// a date-only <input type="date">, which browsers submit as "YYYY-MM-DD" and
// Date parses as UTC midnight of that day. Comparing endDate directly against
// the current instant (`endDate >= now`) makes the item disappear the moment
// its end date begins, instead of staying visible through the end of that day.
// Truncating `now` down to the start of today fixes that: the item stays
// visible as long as its end date's calendar day hasn't passed yet.
export function startOfDay(date) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export function isWithinDateWindow(startDate, endDate, now = new Date()) {
  if (startDate && new Date(startDate) > now) return false;
  if (endDate && new Date(endDate) < startOfDay(now)) return false;
  return true;
}
