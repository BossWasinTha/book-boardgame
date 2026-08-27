import type { Item, ItemStatus } from "@/lib/types";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Whole days from today to the given ISO date (negative when the date is in the past). */
export function daysUntil(iso: string): number {
  const today = new Date();
  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const [y, m, d] = iso.split("-").map(Number);
  const targetUtc = Date.UTC(y, m - 1, d);
  return Math.round((targetUtc - todayUtc) / MS_PER_DAY);
}

/** "Sun, Aug 16" style short date used across the admin tables. */
export function formatShortDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/** "13 August 2026" style long date, used for a member's join date. */
export function formatLongDate(iso: string): string {
  const date = new Date(iso);
  return new Intl.DateTimeFormat("en-US", { day: "numeric", month: "long", year: "numeric" }).format(date);
}

export interface Badge {
  label: string;
  bg: string;
  ink: string;
}

const BADGE: Record<ItemStatus | "soon", Badge> = {
  shelf: { label: "ON SHELF", bg: "bg-green-bg", ink: "text-green" },
  out: { label: "RENTED", bg: "bg-[#F0EBE2]", ink: "text-ink-3" },
  soon: { label: "DUE SOON", bg: "bg-amber-bg", ink: "text-amber" },
  overdue: { label: "OVERDUE", bg: "bg-red-bg", ink: "text-red" },
  repair: { label: "REPAIR", bg: "bg-[#EDE7F0]", ink: "text-[#6B5A80]" },
};

/** Badge for a catalog item — upgrades an "out" item to "DUE SOON" when it's due within 2 days. */
export function badgeFor(item: Item): Badge {
  if (item.status === "out" && item.activeRental && daysUntil(item.activeRental.dueOn) <= 2) {
    return BADGE.soon;
  }
  return BADGE[item.status];
}

/** Badge for an open rental row, based on its due date alone. */
export function badgeForDueDate(dueOn: string): Badge {
  const left = daysUntil(dueOn);
  if (left < 0) return BADGE.overdue;
  if (left <= 2) return BADGE.soon;
  return BADGE.out;
}
