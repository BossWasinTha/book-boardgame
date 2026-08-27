"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import type { AdminRentalRow } from "@/lib/db/rentals";
import { useAdminUi } from "./AdminUiContext";
import { useRealtimeRefetch } from "./useRealtimeRefetch";
import { badgeForDueDate, formatShortDate } from "./adminFormat";

const GRID_COLS = "grid-cols-[1.2fr_1.6fr_.8fr_1fr_.9fr_.9fr] max-[1180px]:grid-cols-2";

export default function RentalsTable({ initialRentals }: { initialRentals: AdminRentalRow[] }) {
  const { flash } = useAdminUi();
  const searchParams = useSearchParams();
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();
  const [rentals, setRentals] = useState(initialRentals);

  const refetch = useMemo(
    () => async () => {
      try {
        const res = await fetch("/api/admin/rentals");
        const data = await res.json();
        setRentals(data.rentals ?? []);
      } catch {
        // best-effort
      }
    },
    [],
  );

  useRealtimeRefetch(["rentals"], refetch);

  const filtered = rentals.filter(
    (r) => !q || `${r.renterName} ${r.renterUnit ?? ""} ${r.itemTitle}`.toLowerCase().includes(q),
  );

  const markReturned = async (rental: AdminRentalRow) => {
    setRentals((prev) => prev.filter((r) => r.id !== rental.id));
    try {
      const res = await fetch(`/api/rentals/${rental.id}/return`, { method: "POST" });
      if (!res.ok) throw new Error("failed");
      flash(`${rental.itemTitle} is back on the shelf.`);
    } catch {
      flash(`Could not mark ${rental.itemTitle} as returned.`);
      refetch();
    }
  };

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      <div
        className={`grid ${GRID_COLS} gap-3 p-[13px_20px] bg-[#FBF7F0] border-b border-border-light max-[1180px]:hidden`}
      >
        {["Renter", "Item", "Rented", "Return date", "Status", "Action"].map((c) => (
          <div key={c} className="text-[10.5px] font-bold tracking-[0.07em] text-ink-4">
            {c}
          </div>
        ))}
      </div>

      {filtered.map((rental) => {
        const badge = badgeForDueDate(rental.dueOn);
        return (
          <div
            key={rental.id}
            className={`grid ${GRID_COLS} gap-3 p-[13px_20px] items-center border-b border-[#F6F0E5] max-[1180px]:gap-2 max-[1180px]:p-[14px_16px]`}
          >
            <div className="flex flex-col gap-[2px] min-w-0">
              <div className="text-[13.5px] font-semibold text-ink truncate">{rental.renterName}</div>
              <div className="text-[11.5px] text-ink-4">{rental.renterUnit ?? "—"}</div>
            </div>
            <div className="flex items-center gap-[11px] min-w-0 max-[1180px]:col-span-full">
              <div className="w-[26px] h-[34px] rounded flex-none" style={{ background: rental.coverColor }} />
              <div className="text-[13px] text-ink truncate">{rental.itemTitle}</div>
            </div>
            <Cell label="Rented">
              <span className="text-[12.5px] text-ink-2">{formatShortDate(rental.rentedOn)}</span>
            </Cell>
            <Cell label="Return date">
              <span className="text-[12.5px] text-ink-2">{formatShortDate(rental.dueOn)}</span>
            </Cell>
            <div>
              <span
                className={`px-[9px] py-1 rounded-[6px] text-[10px] font-bold tracking-[0.06em] ${badge.bg} ${badge.ink}`}
              >
                {badge.label}
              </span>
            </div>
            <button
              type="button"
              onClick={() => markReturned(rental)}
              className="text-[12.5px] font-semibold text-accent cursor-pointer whitespace-nowrap text-left"
            >
              Mark returned
            </button>
          </div>
        );
      })}

      {filtered.length === 0 && (
        <div className="p-[50px] text-center flex flex-col gap-[6px] items-center">
          <div className="font-display text-[19px] text-ink">Nothing here</div>
          <div className="text-[13px] text-ink-3">No open rentals match your search.</div>
        </div>
      )}
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
