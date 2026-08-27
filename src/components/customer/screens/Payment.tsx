"use client";
import type { Item } from "@/lib/types";
import { baht, fmtLong } from "@/lib/customer/date";

export function Payment({
  item,
  dueDate,
  days,
  deposit,
  ratePerDay,
  rentFee,
  total,
  onBack,
  onConfirm,
}: {
  item: Item;
  dueDate: Date | null;
  days: number;
  deposit: number;
  ratePerDay: number;
  rentFee: number;
  total: number;
  onBack: () => void;
  onConfirm: () => void;
}) {
  const chosen = dueDate ? fmtLong(dueDate) : "ยังไม่ได้เลือกวัน";
  return (
    <div className="px-5 pb-10 flex flex-col gap-5 anim-fade-slow">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="w-[34px] h-[34px] rounded-full bg-surface-alt flex items-center justify-center cursor-pointer text-[16px] text-ink"
        >
          ‹
        </button>
        <div className="font-display text-[22px] text-ink">ยืนยันค่าใช้จ่าย</div>
      </div>

      <div className="flex items-center gap-[14px] p-3 bg-surface border border-border rounded-[16px]">
        <div className="w-14 h-14 flex-none rounded-[12px]" style={{ background: item.coverColor }} />
        <div className="flex flex-col gap-[3px] min-w-0">
          <div className="text-[15px] font-semibold text-ink">{item.title}</div>
          <div className="text-[11.5px] text-ink-3">
            {item.itemType} · คืนภายใน {chosen}
          </div>
        </div>
      </div>

      <div className="border border-border rounded-[16px] bg-surface overflow-hidden">
        <div className="p-[14px_16px] border-b border-border-light flex justify-between items-start gap-3">
          <div className="flex flex-col gap-[2px]">
            <div className="text-[13.5px] font-semibold text-ink">ค่ามัดจำ</div>
            <div className="text-[11.5px] text-ink-4 leading-[1.6]">เท่ากับราคาสินค้า · คืนเงินเต็มจำนวนเมื่อคืนของ</div>
          </div>
          <div className="text-[14px] font-bold text-ink whitespace-nowrap">{baht(deposit)} ฿</div>
        </div>
        <div className="p-[14px_16px] border-b border-border-light flex justify-between items-start gap-3">
          <div className="flex flex-col gap-[2px]">
            <div className="text-[13.5px] font-semibold text-ink">ค่าเช่า</div>
            <div className="text-[11.5px] text-ink-4 leading-[1.6]">
              {baht(ratePerDay)} ฿ × {days} วัน
            </div>
          </div>
          <div className="text-[14px] font-bold text-ink whitespace-nowrap">{baht(rentFee)} ฿</div>
        </div>
        <div className="p-4 bg-surface-warm flex justify-between items-center gap-3">
          <div className="text-[13.5px] font-bold text-ink">ยอดชำระวันรับของ</div>
          <div className="font-display text-[24px] text-ink whitespace-nowrap">{baht(total)} ฿</div>
        </div>
      </div>

      <div className="p-[14px_16px] rounded-[14px] bg-surface-alt border border-dashed border-border-input text-[12px] text-ink-3 leading-[1.7]">
        คืนของช้ากว่ากำหนดจะหักค่าเช่าเพิ่มตามจำนวนวันจากเงินมัดจำ
      </div>

      <div className="flex flex-col gap-[10px]">
        <button
          type="button"
          onClick={onConfirm}
          className="h-[52px] rounded-[14px] bg-accent flex items-center justify-center text-[15px] font-semibold text-white cursor-pointer"
        >
          ยอมรับค่าใช้จ่าย · {baht(total)} ฿
        </button>
        <button type="button" onClick={onBack} className="h-12 flex items-center justify-center text-[14px] font-semibold text-ink-3 cursor-pointer">
          กลับไปแก้ไขวัน
        </button>
      </div>
    </div>
  );
}
