"use client";
import type { ChangeEvent } from "react";
import type { Member } from "@/lib/types";
import type { SignupFormState } from "./AppShell";

const FEATURES = [
  { icon: "📚", title: "ค่าเช่าเริ่มต้น 8 ฿ / วัน", sub: "หนังสือ 8–12 ฿ · บอร์ดเกม 15–35 ฿" },
  { icon: "💰", title: "มัดจำเท่าราคาของจริง คืนครบ 100%", sub: "คืนของตรงเวลา รับเงินมัดจำคืนเต็มจำนวนทันที" },
  { icon: "🎲", title: "รับ–คืนสะดวก เลือกเวลาเองได้", sub: "ทุกวัน 07:00–08:00 น. หรือ 19:00–20:00 น." },
];

export function IntroSheet({
  open,
  member,
  signupMode,
  form,
  error,
  saving,
  onChange,
  onSubmit,
  onClose,
  onStartOver,
}: {
  open: boolean;
  member: Member | null;
  signupMode: boolean;
  form: SignupFormState;
  error: string | null;
  saving: boolean;
  onChange: (f: SignupFormState) => void;
  onSubmit: () => void;
  onClose: () => void;
  onStartOver: () => void;
}) {
  if (!open) return null;

  function onPhoto(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => onChange({ ...form, photoDataUrl: String(reader.result) });
    reader.readAsDataURL(f);
  }

  return (
    <>
      <div className="absolute inset-0 bg-[rgba(40,32,24,.45)] z-[14] anim-fade" />
      <div className="absolute left-[18px] right-[18px] top-1/2 -translate-y-1/2 max-h-[calc(100%-36px)] overflow-auto bg-canvas border border-border rounded-[24px] p-[24px_22px] z-[15] anim-pop shadow-[0_26px_50px_-18px_rgba(40,30,20,.5)]">
        <div className="font-display text-[25px] leading-[1.35] text-ink mb-2">เล่นก่อน จ่ายทีหลังวันละไม่ถึงค่ากาแฟ</div>
        <div className="text-[13.5px] leading-[1.7] text-ink-3 mb-[18px]">
          หนังสือและบอร์ดเกมกว่าร้อยรายการ รอคุณอยู่ที่ล็อบบี้ตึก A
        </div>

        <div className="flex flex-col gap-[10px] mb-[18px]">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex gap-3 items-center p-[13px_14px] rounded-[14px] bg-surface-alt border border-border">
              <div className="text-[18px]">{f.icon}</div>
              <div>
                <div className="text-[13.5px] font-bold text-ink">{f.title}</div>
                <div className="text-[12.5px] text-ink-3">{f.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {signupMode ? (
          <div className="flex flex-col gap-[10px] mb-[14px]">
            <div className="text-[11.5px] text-ink-5 font-bold">
              {member ? "แก้ไขโปรไฟล์ของคุณ" : "สมัครสมาชิกฟรี · ใช้เวลา 10 วินาที"}
            </div>
            <label className="flex items-center gap-[13px] cursor-pointer">
              <div
                className="relative w-[58px] h-[58px] rounded-full bg-surface-alt border border-dashed border-border-input flex-none overflow-hidden flex items-center justify-center bg-cover bg-center"
                style={form.photoDataUrl ? { backgroundImage: `url("${form.photoDataUrl}")` } : undefined}
              >
                {!form.photoDataUrl && <span className="text-[20px]">🙂</span>}
              </div>
              <div className="flex flex-col gap-[2px]">
                <span className="text-[13px] font-bold text-ink">{form.photoDataUrl ? "เปลี่ยนรูปโปรไฟล์" : "เพิ่มรูปโปรไฟล์ (ไม่บังคับ)"}</span>
                <span className="text-[11.5px] text-ink-5">ช่วยให้ผู้ดูแลจำคุณได้ตอนรับของ</span>
              </div>
              <input type="file" accept="image/*" onChange={onPhoto} className="hidden" />
            </label>
            <input
              value={form.name}
              onChange={(e) => onChange({ ...form, name: e.target.value })}
              placeholder="ชื่อ–นามสกุล"
              className="h-[46px] px-[14px] rounded-[12px] border border-border-input bg-surface font-body text-[14px] text-ink outline-none"
            />
            <input
              value={form.phone}
              onChange={(e) => onChange({ ...form, phone: e.target.value })}
              placeholder="เบอร์โทร"
              className="h-[46px] px-[14px] rounded-[12px] border border-border-input bg-surface font-body text-[14px] text-ink outline-none"
            />
            <input
              value={form.unit}
              onChange={(e) => onChange({ ...form, unit: e.target.value })}
              placeholder="ห้อง (เช่น ตึก B · 12-04)"
              className="h-[46px] px-[14px] rounded-[12px] border border-border-input bg-surface font-body text-[14px] text-ink outline-none"
            />
            <div className={`text-[11.5px] leading-[1.6] ${error ? "text-red" : "text-ink-5"}`}>
              {error || "ใช้ยืนยันตัวตนและติดต่อตอนรับของเท่านั้น"}
            </div>
            <button
              type="button"
              disabled={saving}
              onClick={onSubmit}
              className="h-[52px] rounded-[14px] bg-accent flex items-center justify-center text-[15px] font-semibold text-white cursor-pointer disabled:opacity-60"
            >
              {saving ? "กำลังบันทึก…" : member ? "บันทึกโปรไฟล์" : "สมัครสมาชิก แล้วเริ่มเลือกเลย"}
            </button>
            <button type="button" onClick={onClose} className="h-10 flex items-center justify-center text-[13px] font-semibold text-ink-5 cursor-pointer">
              ดูรายการก่อน
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-[10px] mb-[14px]">
            <button
              type="button"
              onClick={onClose}
              className="h-[52px] rounded-[14px] bg-accent flex items-center justify-center text-[15px] font-semibold text-white cursor-pointer"
            >
              เริ่มเลือกเลย
            </button>
            <button type="button" onClick={onStartOver} className="h-10 flex items-center justify-center text-[13px] font-semibold text-ink-5 cursor-pointer">
              สมัครสมาชิกใหม่ / แก้ไขข้อมูล
            </button>
          </div>
        )}
      </div>
    </>
  );
}
