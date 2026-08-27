import "server-only";

/**
 * Server-side "today" as a YYYY-MM-DD string in Asia/Bangkok time, not the
 * host's local/UTC day. Vercel functions (and Postgres' `current_date`
 * default) run in UTC, which is behind Bangkok — using naive UTC "today"
 * would mislabel the first ~7 hours of each Bangkok day as still
 * "yesterday" (e.g. overdue items wouldn't flip to overdue until 7am).
 */
export function todayBangkokIso(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function addDaysIso(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
}
