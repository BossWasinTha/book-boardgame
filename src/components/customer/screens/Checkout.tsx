"use client";
import type { Item, Member, Slot } from "@/lib/types";
import { addDays, baht, dowShort, fmtLong, sameDay, today } from "@/lib/customer/date";

const SLOT_TIME: Record<Slot, string> = { เช้า: "07:00–08:00 น.", เย็น: "19:00–20:00 น." };

export function Checkout({
  item,
  pickupDate,
  pickupSlot,
  dueDate,
  returnSlot,
  days,
  deposit,
  ratePerDay,
  rentFee,
  total,
  member,
  onBack,
  onPickPickup,
  onPickupSlot,
  onPickDue,
  onReturnSlot,
  onGoProfile,
}: {
  item: Item;
  pickupDate: Date;
  pickupSlot: Slot;
  dueDate: Date | null;
  returnSlot: Slot;
  days: number;
  deposit: number;
  ratePerDay: number;
  rentFee: number;
  total: number;
  member: Member | null;
  onBack: () => void;
  onPickPickup: (d: Date) => void;
  onPickupSlot: (s: Slot) => void;
  onPickDue: (d: Date) => void;
  onReturnSlot: (s: Slot) => void;
  onGoProfile: () => void;
}) {
  const pickupOptions = Array.from({ length: 5 }, (_, n) => addDays(today(), n));
  const dueOptions = Array.from({ length: 12 }, (_, n) => addDays(pickupDate, n + 1));

  return (
    <div className="px-5 pb-[130px] flex flex-col gap-[22px]">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="w-[34px] h-[34px] rounded-full bg-surface-alt flex items-center justify-center cursor-pointer text-[16px] text-ink"
        >
          ‹
        </button>
        <div className="font-display text-[22px] text-ink">จองรายการนี้</div>
      </div>

      <div className="flex items-center gap-[14px] p-3 bg-surface border border-border rounded-[16px]">
        <div className="w-[62px] h-[62px] flex-none rounded-[12px]" style={{ background: item.coverColor }} />
        <div className="flex flex-col gap-[3px]">
          <div className="text-[15px] font-semibold text-ink">{item.title}</div>
          <div className="text-[11.5px] text-ink-3">
            {item.itemType} · {item.subtitle}
          </div>
          <div className="text-[11.5px] font-semibold text-green">ว่างให้ยืม</div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="font-display text-[22px] text-ink">จะรับของวันไหน?</div>
        <div className="grid grid-cols-5 gap-2">
          {pickupOptions.map((d, n) => {
            const on = sameDay(d, pickupDate);
            return (
              <button
                key={d.toISOString()}
                type="button"
                onClick={() => onPickPickup(d)}
                className="h-16 rounded-[13px] flex flex-col items-center justify-center gap-[2px] cursor-pointer border-[1.5px]"
                style={{
                  background: on ? "#2A241E" : "#FFFFFF",
                  borderColor: on ? "#2A241E" : "var(--color-border)",
                }}
              >
                <div className="text-[11px] font-semibold" style={{ color: on ? "#BCAE9B" : "var(--color-ink-5)" }}>
                  {n === 0 ? "วันนี้" : dowShort(d)}
                </div>
                <div className="text-[17px] font-bold" style={{ color: on ? "#FAF6EF" : "var(--color-ink)" }}>
                  {d.getDate()}
                </div>
              </button>
            );
          })}
        </div>
        <div className="text-[12px] text-ink-4 leading-[1.6]">เลือกช่วงเวลารับของที่ล็อบบี้ตึก B</div>
        <div className="flex gap-2 mt-[2px]">
          {(["เช้า", "เย็น"] as Slot[]).map((s) => {
            const on = pickupSlot === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => onPickupSlot(s)}
                className="flex-1 p-[13px_14px] rounded-[13px] cursor-pointer flex flex-col gap-[2px] border-[1.5px] text-left"
                style={{ background: on ? "#2A241E" : "#FFFFFF", borderColor: on ? "#2A241E" : "var(--color-border)" }}
              >
                <div className="text-[13.5px] font-bold" style={{ color: on ? "#FAF6EF" : "var(--color-ink)" }}>
                  {s}
                </div>
                <div className="text-[12px]" style={{ color: on ? "#BCAE9B" : "var(--color-ink-3)" }}>
                  {SLOT_TIME[s]}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="font-display text-[22px] text-ink">จะคืนวันไหนดี?</div>
        <div className="grid grid-cols-4 gap-2">
          {dueOptions.map((d) => {
            const on = sameDay(d, dueDate);
            return (
              <button
                key={d.toISOString()}
                type="button"
                onClick={() => onPickDue(d)}
                className="h-16 rounded-[13px] flex flex-col items-center justify-center gap-[2px] cursor-pointer border-[1.5px]"
                style={{ background: on ? "#2A241E" : "#FFFFFF", borderColor: on ? "#2A241E" : "var(--color-border)" }}
              >
                <div className="text-[11px] font-semibold" style={{ color: on ? "#BCAE9B" : "var(--color-ink-5)" }}>
                  {dowShort(d)}
                </div>
                <div className="text-[17px] font-bold" style={{ color: on ? "#FAF6EF" : "var(--color-ink)" }}>
                  {d.getDate()}
                </div>
              </button>
            );
          })}
        </div>
        <div className="text-[12px] text-ink-4 leading-[1.6]">
          {dueDate ? `คืน ${fmtLong(dueDate)} · เลือกช่วงเวลาส่งมอบด้านล่าง` : "ส่วนใหญ่เพื่อนบ้านยืมกันประมาณ 3–4 วัน"}
        </div>
        <div className="flex gap-2 mt-[2px]">
          {(["เช้า", "เย็น"] as Slot[]).map((s) => {
            const on = returnSlot === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => onReturnSlot(s)}
                className="flex-1 p-[13px_14px] rounded-[13px] cursor-pointer flex flex-col gap-[2px] border-[1.5px] text-left"
                style={{ background: on ? "#2A241E" : "#FFFFFF", borderColor: on ? "#2A241E" : "var(--color-border)" }}
              >
                <div className="text-[13.5px] font-bold" style={{ color: on ? "#FAF6EF" : "var(--color-ink)" }}>
                  {s}
                </div>
                <div className="text-[12px]" style={{ color: on ? "#BCAE9B" : "var(--color-ink-3)" }}>
                  {SLOT_TIME[s]}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-[10px]">
        <div className="text-[11.5px] text-ink-5 font-bold">ข้อมูลของคุณ</div>
        <div className="p-[14px_16px] bg-surface border border-border rounded-[16px] flex items-center justify-between">
          <div className="flex flex-col gap-[3px]">
            <div className="text-[14.5px] font-semibold text-ink">{member?.name ?? "ยังไม่ได้สมัครสมาชิก"}</div>
            <div className="text-[12.5px] text-ink-3">{member?.unit ?? "—"}</div>
          </div>
          <button type="button" onClick={onGoProfile} className="text-[12.5px] font-semibold text-accent cursor-pointer">
            แก้ไข
          </button>
        </div>
      </div>

      <div className="p-4 rounded-[16px] bg-surface-alt border border-border flex flex-col gap-[10px]">
        <div className="text-[11.5px] text-ink-5 font-bold">สรุปการยืม</div>
        <SummaryRow label="รายการ" value={item.title} />
        <SummaryRow label="จุดรับ" value="ชั้นวางล็อบบี้ตึก B" />
        <SummaryRow label="วันรับของ" value={`${fmtLong(pickupDate)} · ${SLOT_TIME[pickupSlot]}`} />
        <SummaryRow label="คืนภายใน" value={dueDate ? `${fmtLong(dueDate)} · ${SLOT_TIME[returnSlot]}` : "ยังไม่ได้เลือกวัน"} />
        <div className="h-px bg-border my-[2px]" />
        <SummaryRow label="ค่ามัดจำ" value={`${baht(deposit)} ฿`} nowrap />
        <SummaryRow label="ค่าเช่า" value={`${baht(ratePerDay)} ฿ × ${days} วัน = ${baht(rentFee)} ฿`} nowrap />
        <div className="flex justify-between items-center gap-3 pt-2 border-t border-border">
          <span className="text-[13.5px] font-bold text-ink flex-none">รวมชำระวันรับของ</span>
          <span className="font-display text-[20px] text-ink whitespace-nowrap">{baht(total)} ฿</span>
        </div>
        <div className="text-[11.5px] text-ink-4 leading-[1.6]">มัดจำเท่ากับราคาสินค้า · คืนเงินเต็มจำนวนเมื่อคืนของตรงเวลา</div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, nowrap }: { label: string; value: string; nowrap?: boolean }) {
  return (
    <div className="flex justify-between gap-3 text-[13.5px]">
      <span className="text-ink-3 flex-none">{label}</span>
      <span className={`text-ink font-semibold text-right ${nowrap ? "whitespace-nowrap" : ""}`}>{value}</span>
    </div>
  );
}
