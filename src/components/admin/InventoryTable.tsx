"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import type { Item } from "@/lib/types";
import { useAdminUi } from "./AdminUiContext";
import { useRealtimeRefetch } from "./useRealtimeRefetch";
import { badgeFor, formatShortDate } from "./adminFormat";

const FILTERS = ["All", "On shelf", "Rented", "Overdue", "Repair"] as const;
type Filter = (typeof FILTERS)[number];

const GRID_COLS =
  "grid-cols-[minmax(150px,2fr)_minmax(72px,.8fr)_82px_82px_minmax(88px,.9fr)_minmax(110px,1.1fr)_minmax(84px,.9fr)_minmax(96px,.9fr)] max-[1180px]:grid-cols-2";

export default function InventoryTable({ initialItems }: { initialItems: Item[] }) {
  const { flash } = useAdminUi();
  const searchParams = useSearchParams();
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();
  const [items, setItems] = useState(initialItems);
  const [filter, setFilter] = useState<Filter>("All");
  const [drafts, setDrafts] = useState<Record<string, { deposit: string; rate: string }>>(() =>
    Object.fromEntries(initialItems.map((i) => [i.id, { deposit: String(i.deposit), rate: String(i.ratePerDay) }])),
  );

  const refetch = useMemo(
    () => async () => {
      try {
        const res = await fetch("/api/items");
        const data = await res.json();
        const next: Item[] = data.items ?? [];
        setItems(next);
        setDrafts((prev) => {
          const merged = { ...prev };
          for (const item of next) {
            if (!merged[item.id]) {
              merged[item.id] = { deposit: String(item.deposit), rate: String(item.ratePerDay) };
            }
          }
          for (const id of Object.keys(merged)) {
            if (!next.some((i) => i.id === id)) delete merged[id];
          }
          return merged;
        });
      } catch {
        // best-effort
      }
    },
    [],
  );

  useRealtimeRefetch(["items", "rentals"], refetch);

  const matches = (i: Item) =>
    !q || `${i.title} ${i.activeRental?.renterName ?? ""} ${i.subtitle}`.toLowerCase().includes(q);

  const byFilter = (i: Item) => {
    if (filter === "All") return true;
    if (filter === "On shelf") return i.status === "shelf";
    if (filter === "Rented") return i.status === "out";
    if (filter === "Overdue") return i.status === "overdue";
    return i.status === "repair";
  };

  const filtered = items.filter((i) => matches(i) && byFilter(i));

  const savePrice = async (item: Item) => {
    const draft = drafts[item.id];
    if (!draft) return;
    const deposit = Math.max(0, parseInt(draft.deposit.replace(/[^0-9]/g, ""), 10) || 0);
    const ratePerDay = Math.max(0, parseInt(draft.rate.replace(/[^0-9]/g, ""), 10) || 0);
    setDrafts((prev) => ({ ...prev, [item.id]: { deposit: String(deposit), rate: String(ratePerDay) } }));
    try {
      const res = await fetch(`/api/items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deposit, ratePerDay }),
      });
      if (!res.ok) throw new Error("failed");
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, deposit, ratePerDay } : i)));
      flash(`บันทึกราคา ${item.title} แล้ว`);
    } catch {
      flash(`Could not save the price for ${item.title}.`);
    }
  };

  const toggle = async (item: Item) => {
    const isOut = item.status === "out" || item.status === "overdue";
    try {
      const res = await fetch(`/api/items/${item.id}/toggle`, { method: "POST" });
      if (!res.ok) throw new Error("failed");
      flash(isOut ? `${item.title} is back on the shelf.` : `${item.title} marked rented.`);
      refetch();
    } catch {
      flash(`Could not update ${item.title}.`);
    }
  };

  const remove = async (item: Item) => {
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    try {
      const res = await fetch(`/api/items/${item.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("failed");
      flash(`${item.title} removed from the collection.`);
    } catch {
      flash(`Could not remove ${item.title}.`);
      refetch();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => {
          const on = filter === f;
          return (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-[15px] py-2 rounded-full border text-[12.5px] font-medium cursor-pointer ${
                on ? "bg-ink text-canvas border-ink" : "bg-surface text-ink-2 border-border"
              }`}
            >
              {f}
            </button>
          );
        })}
      </div>

      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <div
          className={`grid ${GRID_COLS} gap-3 p-[12px_20px] bg-[#FBF7F0] border-b border-border-light max-[1180px]:hidden`}
        >
          {["Item", "Type", "Deposit", "Rate / day", "Status", "Current renter", "Return date", "Actions"].map(
            (c) => (
              <div key={c} className="text-[10.5px] font-bold tracking-[0.07em] text-ink-4">
                {c}
              </div>
            ),
          )}
        </div>

        {filtered.map((item) => {
          const badge = badgeFor(item);
          const isOut = item.status === "out" || item.status === "overdue";
          const draft = drafts[item.id] ?? { deposit: String(item.deposit), rate: String(item.ratePerDay) };
          return (
            <div
              key={item.id}
              className={`grid ${GRID_COLS} gap-3 p-[12px_20px] items-center border-b border-[#F6F0E5] max-[1180px]:gap-2 max-[1180px]:p-[14px_16px]`}
            >
              <div className="flex items-center gap-3 min-w-0 max-[1180px]:col-span-full">
                <div className="w-[30px] h-[40px] rounded-[5px] flex-none" style={{ background: item.coverColor }} />
                <div className="flex flex-col gap-[2px] min-w-0">
                  <div className="text-[13.5px] font-semibold text-ink truncate">{item.title}</div>
                  <div className="text-[11.5px] text-ink-4 truncate">{item.subtitle}</div>
                </div>
              </div>
              <Cell label="Type">
                <span className="text-[12.5px] text-ink-2">{item.itemType}</span>
              </Cell>
              <Cell label="Deposit ฿">
                <input
                  value={draft.deposit}
                  onChange={(e) =>
                    setDrafts((prev) => ({ ...prev, [item.id]: { ...draft, deposit: e.target.value } }))
                  }
                  onBlur={() => savePrice(item)}
                  className="h-8 w-full px-[9px] border border-border rounded-lg bg-[#FFFDF9] outline-none text-[12.5px] text-ink font-body"
                />
              </Cell>
              <Cell label="Rate / day ฿">
                <input
                  value={draft.rate}
                  onChange={(e) => setDrafts((prev) => ({ ...prev, [item.id]: { ...draft, rate: e.target.value } }))}
                  onBlur={() => savePrice(item)}
                  className="h-8 w-full px-[9px] border border-border rounded-lg bg-[#FFFDF9] outline-none text-[12.5px] text-ink font-body"
                />
              </Cell>
              <div>
                <span
                  className={`px-[9px] py-1 rounded-[6px] text-[10px] font-bold tracking-[0.06em] ${badge.bg} ${badge.ink}`}
                >
                  {badge.label}
                </span>
              </div>
              <Cell label="Renter">
                <span className="text-[12.5px] text-ink-2 truncate block">{item.activeRental?.renterName ?? "—"}</span>
              </Cell>
              <Cell label="Return date">
                <span className="text-[12.5px] text-ink-2">
                  {item.activeRental ? formatShortDate(item.activeRental.dueOn) : "—"}
                </span>
              </Cell>
              <div className="flex items-center gap-[10px]">
                <button
                  type="button"
                  onClick={() => toggle(item)}
                  className="text-[12.5px] font-semibold text-accent cursor-pointer whitespace-nowrap"
                >
                  {isOut ? "Mark available" : "Mark rented"}
                </button>
                <button
                  type="button"
                  onClick={() => remove(item)}
                  title="Remove item"
                  className="flex-none w-[26px] h-[26px] rounded-lg border border-border bg-surface flex items-center justify-center text-[14px] leading-none text-red cursor-pointer hover:bg-[#FBEDEA] hover:border-[#E5C3BC]"
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="p-[50px] text-center flex flex-col gap-[6px] items-center">
            <div className="font-display text-[19px] text-ink">Nothing here</div>
            <div className="text-[13px] text-ink-3">Try another filter or a different search.</div>
          </div>
        )}
      </div>
    </div>
  );
}

function Cell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-[2px] min-w-0">
      <span className="hidden max-[1180px]:block text-[10px] font-bold tracking-[0.06em] text-ink-5">{label}</span>
      {children}
    </div>
  );
}
