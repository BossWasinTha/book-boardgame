"use client";
import type { Item, RentalHistoryEntry } from "@/lib/types";
import { daysBetween, fmtShort, fromIsoDate, today } from "@/lib/customer/date";
import { Chip } from "@/components/ui/Chip";

const TABS: ("กำลังยืม" | "ที่ผ่านมา")[] = ["กำลังยืม", "ที่ผ่านมา"];

export function Rentals({
  rentals,
  itemsById,
  tab,
  onTab,
  onOpen,
  onStartReturn,
  onGoHome,
}: {
  rentals: RentalHistoryEntry[];
  itemsById: Map<string, Item>;
  tab: "กำลังยืม" | "ที่ผ่านมา";
  onTab: (t: "กำลังยืม" | "ที่ผ่านมา") => void;
  onOpen: (itemId: string) => void;
  onStartReturn: (rentalId: string) => void;
  onGoHome: () => void;
}) {
  const list = rentals.filter((r) => (tab === "กำลังยืม" ? !r.returnedOn : r.returnedOn));

  return (
    <div className="px-5 pb-[108px] flex flex-col gap-4">
      <div className="font-display text-[29px] text-ink -tracking-[0.01em]">รายการที่ยืม</div>
      <div className="flex gap-2">
        {TABS.map((t) => (
          <Chip key={t} label={t} active={tab === t} onClick={() => onTab(t)} />
        ))}
      </div>

      {list.length > 0 ? (
        <div className="flex flex-col gap-3">
          {list.map((r) => (
            <RentalCard key={r.id} rental={r} item={itemsById.get(r.itemId)} onOpen={onOpen} onStartReturn={onStartReturn} />
          ))}
        </div>
      ) : (
        <div className="mt-[50px] flex flex-col items-center gap-[10px] text-center">
          <div className="w-16 h-16 rounded-full bg-surface-alt border border-dashed border-border-input" />
          <div className="font-display text-[19px] text-ink">{tab === "กำลังยืม" ? "ยังไม่ได้ยืมอะไรเลย" : "ยังไม่มีประวัติ"}</div>
          <div className="text-[13px] text-ink-3 max-w-[250px] leading-[1.7]">
            {tab === "กำลังยืม"
              ? "เมื่อคุณจองหนังสือหรือบอร์ดเกม รายการจะมาแสดงที่นี่พร้อมวันคืน"
              : "รายการที่คืนแล้วจะถูกเก็บไว้ที่นี่ เผื่อคุณอยากย้อนดูว่าเคยชอบเล่มไหน"}
          </div>
          <button type="button" onClick={onGoHome} className="mt-[6px] px-5 py-3 rounded-[12px] bg-ink text-canvas text-[13.5px] font-semibold cursor-pointer">
            ไปดูชั้นวาง
          </button>
        </div>
      )}
    </div>
  );
}

function RentalCard({
  rental,
  item,
  onOpen,
  onStartReturn,
}: {
  rental: RentalHistoryEntry;
  item: Item | undefined;
  onOpen: (itemId: string) => void;
  onStartReturn: (rentalId: string) => void;
}) {
  const due = fromIsoDate(rental.dueOn);
  const days = daysBetween(today(), due);
  const past = Boolean(rental.returnedOn);
  const over = !past && days < 0;
  const soon = !past && days >= 0 && days <= 2;

  const left = past
    ? "คืนตรงเวลา"
    : over
      ? `เกินกำหนด ${Math.abs(days)} วัน`
      : days === 0
        ? "ครบกำหนดวันนี้"
        : `เหลืออีก ${days} วัน`;
  const leftInk = past ? "#8A7A66" : over ? "#B03A2E" : soon ? "#C08A2E" : "#3F7D52";
  const badge = past ? "คืนแล้ว" : over ? "เกินกำหนด" : soon ? "ใกล้ครบกำหนด" : "กำลังยืม";
  const badgeBg = past ? "#F0EBE2" : over ? "#F7E2DE" : soon ? "#F7EEDA" : "#E4EFE5";
  const badgeInk = past ? "#8A7A66" : over ? "#B03A2E" : soon ? "#9A6A18" : "#3F7D52";

  return (
    <div className="bg-surface border border-border rounded-[18px] overflow-hidden">
      <div className="p-[14px] flex gap-[14px]">
        <button
          type="button"
          onClick={() => item && onOpen(item.id)}
          className="w-[70px] h-[92px] flex-none rounded-[12px] cursor-pointer"
          style={{ background: item?.coverColor ?? "#DCCDB6" }}
        />
        <div className="flex-1 flex flex-col gap-[5px] min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="text-[15.5px] font-semibold text-ink leading-[1.25]">{item?.title ?? "รายการ"}</div>
            <div
              className="flex-none px-[9px] py-1 rounded-full text-[10.5px] font-bold whitespace-nowrap"
              style={{ background: badgeBg, color: badgeInk }}
            >
              {badge}
            </div>
          </div>
          <div className="text-[11px] text-ink-5 font-semibold">{item?.itemType}</div>
          <div className="text-[12px] text-ink-3">ยืมเมื่อ {fmtShort(fromIsoDate(rental.rentedOn))}</div>
          <div className="mt-[2px] text-[13px] text-ink-2">
            คืนภายใน <strong className="text-ink">{fmtShort(due)}</strong>
          </div>
          <div className="text-[12.5px] font-semibold" style={{ color: leftInk }}>
            {left}
          </div>
        </div>
      </div>
      {!past && (
        <div className="flex gap-px bg-border border-t border-border">
          <button
            type="button"
            onClick={() => item && onOpen(item.id)}
            className="flex-1 h-[46px] bg-surface flex items-center justify-center text-[13.5px] font-semibold text-ink-2 cursor-pointer"
          >
            ดูรายละเอียด
          </button>
          <button
            type="button"
            onClick={() => onStartReturn(rental.id)}
            className="flex-1 h-[46px] bg-surface flex items-center justify-center text-[13.5px] font-bold text-accent cursor-pointer"
          >
            คืนของ
          </button>
        </div>
      )}
    </div>
  );
}
