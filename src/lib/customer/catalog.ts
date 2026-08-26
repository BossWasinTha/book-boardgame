import type { Item } from "@/lib/types";
import { fmtShort, fromIsoDate } from "@/lib/customer/date";

export const GENRES = ["นิยาย", "สารคดี", "ไซไฟ"];

export const FILTER_GROUPS: { name: string; opts: { id: string; label: string }[] }[] = [
  {
    name: "ทั่วไป",
    opts: [
      { id: "avail", label: "ว่างตอนนี้" },
      { id: "new", label: "เพิ่มใหม่" },
      { id: "popular", label: "ยอดนิยม" },
    ],
  },
  {
    name: "บอร์ดเกม",
    opts: [
      { id: "two", label: "เล่น 2 คน" },
      { id: "under30", label: "ไม่เกิน 30 นาที" },
      { id: "easy", label: "เรียนรู้ง่าย" },
    ],
  },
  {
    name: "หนังสือ",
    opts: [
      { id: "นิยาย", label: "นิยาย" },
      { id: "สารคดี", label: "สารคดี" },
      { id: "ไซไฟ", label: "ไซไฟ" },
    ],
  },
];

/** Items in repair aren't a real rentable choice — hide them from the customer catalog entirely. */
export function customerVisible(items: Item[]): Item[] {
  return items.filter((i) => i.status !== "repair");
}

export interface CatalogQuery {
  cat: "ทั้งหมด" | "หนังสือ" | "บอร์ดเกม";
  query: string;
  filters: string[];
}

export function matchesItem(item: Item, q: CatalogQuery): boolean {
  if (q.cat !== "ทั้งหมด" && item.itemType !== q.cat) return false;
  const query = q.query.trim().toLowerCase();
  if (query) {
    const hay = [item.title, item.author, item.genre, item.itemType]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    if (!hay.includes(query)) return false;
  }
  for (const f of q.filters) {
    if (f === "avail") {
      if (item.status !== "shelf") return false;
    } else if (GENRES.includes(f)) {
      if (item.genre !== f) return false;
    } else if (!item.tags.includes(f)) {
      return false;
    }
  }
  return true;
}

export interface ItemDeco {
  isAvailable: boolean;
  dot: string;
  statusInk: string;
  pillBg: string;
  statusLabel: string;
  statusShort: string;
  statusLong: string;
  backLabel: string;
}

export function decorate(item: Item): ItemDeco {
  const av = item.status === "shelf";
  const back = item.activeRental ? fmtShort(fromIsoDate(item.activeRental.dueOn)) : "เร็ว ๆ นี้";
  return {
    isAvailable: av,
    dot: av ? "#3F7D52" : "#B85C38",
    statusInk: av ? "#3F7D52" : "#B85C38",
    pillBg: av ? "#E4EFE5" : "#F6EAE3",
    statusLabel: av ? "ว่างให้ยืม" : "ถูกยืมอยู่",
    statusShort: av ? "ว่าง" : "ถูกยืม",
    statusLong: av ? "ว่างให้ยืมตอนนี้" : `ถูกยืมอยู่ · กลับมา ${back}`,
    backLabel: back,
  };
}
