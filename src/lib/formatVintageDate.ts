const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

/**
 * Parses a `YYYY-MM-DD`-prefixed date string into vintage-postcard style: `"MON D, YYYY"`.
 * Returns `null` when `raw` is empty, not a string, or doesn't parse — callers choose their
 * own fallback display for that case.
 */
export function formatVintageDate(raw: unknown): string | null {
  if (!raw || typeof raw !== 'string') {
    return null;
  }
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw.trim());
  if (!m) {
    return null;
  }
  const [, y, mo, d] = m;
  const mi = Number(mo) - 1;
  if (mi < 0 || mi > 11) {
    return null;
  }
  return `${MONTHS[mi]} ${Number(d)}, ${y}`;
}
