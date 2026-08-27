"use client";
import type { Item } from "@/lib/types";
import { baht } from "@/lib/customer/date";
import { decorate } from "@/lib/customer/catalog";

const GAME_FACTS = (item: Item) => [
  { k: "ประเภท", v: item.itemType },
  { k: "รายละเอียด", v: item.subtitle },
];

export function Detail({
  item,
  onBack,
  onRent,
  onNotify,
}: {
  item: Item;
  onBack: () => void;
  onRent: () => void;
  onNotify: () => void;
}) {
  const d = decorate(item);
  const facts = item.facts.length > 0 ? item.facts : GAME_FACTS(item);

  return (
    <div className="pb-[120px] flex flex-col">
      <div className="relative h-[280px] flex items-end p-[22px]" style={{ background: item.coverColor }}>
        <button
          type="button"
          onClick={onBack}
          className="absolute top-[14px] left-4 w-[34px] h-[34px] rounded-full bg-[rgba(250,246,239,.9)] flex items-center justify-center cursor-pointer text-[16px] text-ink"
        >
          ‹
        </button>
        <div className="font-display text-[32px] leading-[1.1] -tracking-[0.01em]" style={{ color: item.coverInk }}>
          {item.title}
        </div>
      </div>
      <div className="p-5 flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <div className="text-[11.5px] text-ink-5 font-bold">{item.itemType}</div>
          <div className="font-display text-[26px] text-ink leading-[1.2]">{item.title}</div>
          <div
            className="flex items-center gap-[7px] px-3 py-[7px] rounded-full self-start"
            style={{ background: d.pillBg }}
          >
            <div className="w-[7px] h-[7px] rounded-full" style={{ background: d.dot }} />
            <div className="text-[12.5px] font-semibold" style={{ color: d.statusInk }}>
              {d.statusLong}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-[1px] bg-border border border-border rounded-[14px] overflow-hidden">
          {facts.map((f) => (
            <div key={f.k} className="bg-surface p-[13px_14px] flex flex-col gap-[3px]">
              <div className="text-[11.5px] text-ink-5 font-semibold">{f.k}</div>
              <div className="text-[14px] font-semibold text-ink">{f.v}</div>
            </div>
          ))}
        </div>

        {item.description && (
          <div className="flex flex-col gap-[7px]">
            <div className="font-display text-[18px] text-ink">เรื่องย่อ</div>
            <div className="text-[14px] leading-[1.8] text-ink-2">{item.description}</div>
          </div>
        )}

        {d.isAvailable ? (
          <div className="p-4 rounded-[16px] bg-surface-alt border border-border flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="text-[13px] font-bold text-ink">ค่ามัดจำ {baht(item.deposit)} ฿</div>
              <div className="text-[12px] text-ink-3">ค่าเช่า {baht(item.ratePerDay)} ฿ / วัน</div>
            </div>
            <button
              type="button"
              onClick={onRent}
              className="flex items-center justify-between h-[46px] px-[14px] bg-surface border border-border-input rounded-[12px] cursor-pointer"
            >
              <span className="text-[13.5px] text-ink-3">เลือกวันคืน</span>
              <span className="text-[13.5px] font-semibold text-accent">เลือก</span>
            </button>
            <div className="text-[12px] text-ink-4 leading-[1.7]">รับของที่จุดรับส่วนกลาง ล็อบบี้ตึก B</div>
          </div>
        ) : (
          <div className="p-4 rounded-[16px] bg-[#F6EEE6] border border-[#E8D6C4] flex flex-col gap-[10px]">
            <div className="text-[14px] font-bold text-ink">ถูกยืมอยู่</div>
            <div className="text-[13px] text-ink-3 leading-[1.7]">
              จะกลับมาอยู่บนชั้น <strong className="text-ink">{d.backLabel}</strong> เราจะแจ้งคุณทันทีที่ของถูกคืน
            </div>
            <button
              type="button"
              onClick={onNotify}
              className="h-11 rounded-[12px] border-[1.5px] border-ink flex items-center justify-center text-[14px] font-semibold text-ink cursor-pointer"
            >
              แจ้งเตือนฉัน
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
