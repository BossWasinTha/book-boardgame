import Link from "next/link";
import { listItems } from "@/lib/db/items";
import { listTodayHandover } from "@/lib/db/rentals";
import { supabaseAdmin } from "@/lib/supabase/server";
import { badgeFor, daysUntil, formatShortDate } from "@/components/admin/adminFormat";

async function getReturnedOnTimeStats(): Promise<{ total: number; onTime: number }> {
  const db = supabaseAdmin();
  const { data, error } = await db.from("rentals").select("due_on, returned_on").not("returned_on", "is", null);
  if (error) throw error;
  const rows = (data ?? []) as { due_on: string; returned_on: string }[];
  const total = rows.length;
  const onTime = rows.filter((r) => r.returned_on <= r.due_on).length;
  return { total, onTime };
}

export default async function AdminDashboardPage() {
  const [items, handover, { total: returnedTotal, onTime }] = await Promise.all([
    listItems(),
    listTodayHandover(),
    getReturnedOnTimeStats(),
  ]);

  const out = items.filter((i) => i.status === "out" || i.status === "overdue");
  const shelf = items.filter((i) => i.status === "shelf");
  const overdue = items.filter((i) => i.status === "overdue");
  const repair = items.filter((i) => i.status === "repair");
  const dueSoon = items.filter(
    (i) => i.status === "out" && i.activeRental && daysUntil(i.activeRental.dueOn) <= 2,
  );

  const comingBack = items
    .filter(
      (i) =>
        (i.status === "out" && i.activeRental && daysUntil(i.activeRental.dueOn) <= 4) || i.status === "overdue",
    )
    .sort((a, b) => (a.activeRental?.dueOn ?? "").localeCompare(b.activeRental?.dueOn ?? ""));

  const pct = (n: number) => (items.length > 0 ? Math.round((n / items.length) * 100) : 0);
  const boardTotal = items.filter((i) => i.itemType === "บอร์ดเกม").length;
  const boardOut = out.filter((i) => i.itemType === "บอร์ดเกม").length;
  const bookTotal = items.filter((i) => i.itemType === "หนังสือ").length;
  const bookOut = out.filter((i) => i.itemType === "หนังสือ").length;

  const stats = [
    { label: "Out now", value: out.length, note: "across the building", bg: "bg-surface", bd: "border-border", ink: "text-ink" },
    { label: "On shelf", value: shelf.length, note: "ready to rent", bg: "bg-[#E9F1E9]", bd: "border-[#D3E3D5]", ink: "text-green" },
    { label: "Due soon", value: dueSoon.length, note: "next 3 days", bg: "bg-[#F7EFDD]", bd: "border-[#EADCBE]", ink: "text-amber" },
    { label: "Overdue", value: overdue.length, note: "reminder sent", bg: "bg-[#F8E5E1]", bd: "border-[#EDCDC5]", ink: "text-red" },
    { label: "Total items", value: items.length, note: `${repair.length} in repair`, bg: "bg-surface", bd: "border-border", ink: "text-ink" },
  ];

  const health = [
    { label: "Board games out", value: `${boardOut} of ${boardTotal}`, ink: "text-accent", bar: "bg-accent", pct: pct(boardOut) },
    { label: "Books out", value: `${bookOut} of ${bookTotal}`, ink: "text-green", bar: "bg-green", pct: pct(bookOut) },
    {
      label: "Returned on time",
      value: returnedTotal > 0 ? `${onTime} of ${returnedTotal}` : "No returns yet",
      ink: "text-[#8A6A3B]",
      bar: "bg-[#8A6A3B]",
      pct: returnedTotal > 0 ? Math.round((onTime / returnedTotal) * 100) : 0,
    },
  ];

  return (
    <div className="flex flex-col gap-[22px]">
      <div className="grid grid-cols-5 max-[1180px]:grid-cols-2 gap-[14px]">
        {stats.map((s) => (
          <div key={s.label} className={`p-[16px_18px] rounded-[14px] ${s.bg} border ${s.bd} flex flex-col gap-[5px]`}>
            <div className="text-[11px] tracking-[0.07em] font-bold text-ink-4">{s.label}</div>
            <div className={`font-display text-[32px] leading-none ${s.ink}`}>{s.value}</div>
            <div className="text-[11.5px] text-ink-4">{s.note}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[1.45fr_1fr] max-[1180px]:grid-cols-1 gap-[18px] items-start">
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          <div className="p-[16px_20px] border-b border-border-light flex items-center justify-between">
            <div className="font-display text-[19px] text-ink">Coming back in the next 3 days</div>
            <Link href="/admin/rentals" className="text-[12.5px] font-semibold text-accent">
              All rentals ›
            </Link>
          </div>
          {comingBack.length === 0 && <div className="p-[20px] text-[13px] text-ink-3">Nothing due back soon.</div>}
          {comingBack.map((item) => {
            const badge = badgeFor(item);
            const rental = item.activeRental!;
            return (
              <div key={item.id} className="p-[13px_20px] border-b border-[#F6F0E5] flex items-center gap-[14px]">
                <div className="w-[34px] h-[44px] rounded-[5px] flex-none" style={{ background: item.coverColor }} />
                <div className="flex-1 flex flex-col gap-[2px] min-w-0">
                  <div className="text-[14px] font-semibold text-ink truncate">{item.title}</div>
                  <div className="text-[12px] text-ink-3 truncate">
                    {rental.renterName} · {rental.renterUnit ?? "—"}
                  </div>
                </div>
                <div className="text-[12.5px] text-ink-2 w-[110px] flex-none">{formatShortDate(rental.dueOn)}</div>
                <div
                  className={`px-[9px] py-[4px] rounded-[6px] text-[10px] font-bold tracking-[0.06em] ${badge.bg} ${badge.ink}`}
                >
                  {badge.label}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-[18px]">
          <div className="bg-surface border border-border rounded-2xl overflow-hidden">
            <div className="p-[16px_20px] border-b border-border-light font-display text-[19px] text-ink">
              Tonight · 7–8 pm
            </div>
            {handover.length === 0 && (
              <div className="p-[20px] text-[13px] text-ink-3">Nothing scheduled tonight.</div>
            )}
            {handover.map((h, idx) => {
              const dot = h.kind === "return" ? "bg-green" : h.kind === "chase" ? "bg-red" : "bg-accent";
              const who =
                h.kind === "return"
                  ? `${h.renterName} returning · ${h.renterUnit ?? "—"}`
                  : h.kind === "pickup"
                    ? `${h.renterName} collecting · ${h.renterUnit ?? "—"}`
                    : `${h.renterName} — chase overdue`;
              return (
                <div key={idx} className="p-[13px_20px] border-b border-[#F6F0E5] flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full flex-none ${dot}`} />
                  <div className="flex-1 flex flex-col gap-[2px] min-w-0">
                    <div className="text-[13.5px] font-semibold text-ink truncate">{h.itemTitle}</div>
                    <div className="text-[12px] text-ink-3 truncate">{who}</div>
                  </div>
                  <div className="text-[10px] font-bold tracking-[0.07em] text-ink-4 uppercase">{h.kind}</div>
                </div>
              );
            })}
          </div>

          <div className="bg-surface border border-border rounded-2xl p-[18px_20px] flex flex-col gap-[15px]">
            <div className="font-display text-[19px] text-ink">Collection health</div>
            {health.map((h) => (
              <div key={h.label} className="flex flex-col gap-[7px]">
                <div className="flex justify-between text-[12.5px]">
                  <span className="text-ink-2">{h.label}</span>
                  <span className={`font-semibold ${h.ink}`}>{h.value}</span>
                </div>
                <div className="h-[6px] rounded-[3px] bg-border-light overflow-hidden">
                  <div className={`h-[6px] rounded-[3px] ${h.bar}`} style={{ width: `${h.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
