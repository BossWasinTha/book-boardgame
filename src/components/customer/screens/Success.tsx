"use client";
import type { Item, Slot } from "@/lib/types";
import { baht, fmtLong } from "@/lib/customer/date";

const SLOT_TIME: Record<Slot, string> = { เช้า: "07:00–08:00 น.", เย็น: "19:00–20:00 น." };

export function Success({
  item,
  pickupDate,
  pickupSlot,
  dueDate,
  returnSlot,
  deposit,
  rentFee,
  total,
  onGoRentals,
  onGoHome,
}: {
  item: Item;
  pickupDate: Date;
  pickupSlot: Slot;
  dueDate: Date | null;
  returnSlot: Slot;
  deposit: number;
  rentFee: number;
  total: number;
  onGoRentals: () => void;
  onGoHome: () => void;
}) {
  return (
    <div className="min-h-full px-[26px] pt-[60px] pb-10 flex flex-col items-center text-center gap-4 anim-fade-slow">
      <div className="w-24 h-24 rounded-full bg-green-bg flex items-center justify-center text-[38px]">🎲</div>
      <div className="font-display text-[30px] leading-[1.3] text-ink">จองเรียบร้อยแล้ว!</div>
      <div className="text-[15px] leading-[1.75] text-ink-2 max-w-[290px]">
        เราเก็บ <strong>{item.title}</strong> ไว้ให้คุณแล้ว รับของได้ที่ชั้นวางล็อบบี้ตึก B
      </div>
      <div className="mt-[6px] w-full flex flex-col gap-px bg-border border border-border rounded-[14px] overflow-hidden">
        <div className="bg-surface-alt p-[14px_18px] text-left">
          <div className="text-[11.5px] text-ink-5 font-bold mb-1">วันรับของ</div>
          <div className="font-display text-[18px] text-ink">
            {fmtLong(pickupDate)} · {SLOT_TIME[pickupSlot]}
          </div>
        </div>
        <div className="bg-surface-alt p-[14px_18px] text-left">
          <div className="text-[11.5px] text-ink-5 font-bold mb-1">คืนภายใน</div>
          <div className="font-display text-[18px] text-ink">
            {dueDate ? `${fmtLong(dueDate)} · ${SLOT_TIME[returnSlot]}` : "—"}
          </div>
        </div>
        <div className="bg-surface-alt p-[14px_18px] text-left">
          <div className="text-[11.5px] text-ink-5 font-bold mb-1">ชำระวันรับของ</div>
          <div className="font-display text-[18px] text-ink">
            {baht(total)} ฿ (มัดจำ {baht(deposit)} + ค่าเช่า {baht(rentFee)})
          </div>
        </div>
      </div>
      <div className="mt-[14px] w-full flex flex-col gap-[10px]">
        <button
          type="button"
          onClick={onGoRentals}
          className="h-[52px] rounded-[14px] bg-accent flex items-center justify-center text-[15px] font-semibold text-white cursor-pointer"
        >
          ดูรายการที่ยืม
        </button>
        <button
          type="button"
          onClick={onGoHome}
          className="h-[52px] rounded-[14px] border-[1.5px] border-border-input flex items-center justify-center text-[15px] font-semibold text-ink cursor-pointer"
        >
          เลือกดูต่อ
        </button>
      </div>
    </div>
  );
}
