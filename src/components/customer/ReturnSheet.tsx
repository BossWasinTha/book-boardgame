"use client";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { fmtLong, fromIsoDate } from "@/lib/customer/date";
import type { Item, RentalHistoryEntry } from "@/lib/types";

export function ReturnSheet({
  rental,
  item,
  onClose,
  onConfirm,
}: {
  rental: RentalHistoryEntry | undefined;
  item: Item | undefined;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const open = Boolean(rental);
  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="font-display text-[23px] leading-[1.35] text-ink mb-[6px]">
        พร้อมคืน {item?.title ?? ""} แล้วใช่ไหม?
      </div>
      <div className="text-[13.5px] text-ink-3 leading-[1.7] mb-4">
        นำไปวางที่ชั้นล็อบบี้ตึก B ในช่วง 07:00–08:00 น. หรือ 19:00–20:00 น. แล้วเราจะปรับสถานะให้ว่างสำหรับเพื่อนบ้านคนต่อไป
      </div>
      {rental && (
        <div className="p-[14px_16px] rounded-[14px] bg-surface-alt border border-border flex justify-between mb-[18px]">
          <span className="text-[13px] text-ink-3">กำหนดคืน</span>
          <span className="text-[13.5px] font-semibold text-ink">{fmtLong(fromIsoDate(rental.dueOn))}</span>
        </div>
      )}
      <div className="flex flex-col gap-[10px]">
        <button
          type="button"
          onClick={onConfirm}
          className="h-[52px] rounded-[14px] bg-accent flex items-center justify-center text-[15px] font-semibold text-white cursor-pointer"
        >
          ยืนยันการคืน
        </button>
        <button type="button" onClick={onClose} className="h-12 flex items-center justify-center text-[14px] font-semibold text-ink-3 cursor-pointer">
          ยังก่อน
        </button>
      </div>
    </BottomSheet>
  );
}
