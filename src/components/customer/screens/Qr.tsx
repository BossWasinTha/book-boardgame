"use client";
import Image from "next/image";
import { baht } from "@/lib/customer/date";

export function Qr({
  total,
  onBack,
  onDownload,
  onConfirmSlip,
  saving,
}: {
  total: number;
  onBack: () => void;
  onDownload: () => void;
  onConfirmSlip: () => void;
  saving: boolean;
}) {
  return (
    <div className="px-5 pb-10 flex flex-col gap-[18px] anim-fade-slow">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="w-[34px] h-[34px] rounded-full bg-surface-alt flex items-center justify-center cursor-pointer text-[16px] text-ink"
        >
          ‹
        </button>
        <div className="font-display text-[22px] text-ink">โอนเงิน {baht(total)} ฿</div>
      </div>

      <div className="bg-surface border border-border rounded-[18px] p-4 flex flex-col gap-3 items-center">
        <div className="text-[11.5px] text-ink-5 font-bold self-start">ขั้นที่ 1 · สแกนหรือบันทึก QR</div>
        <Image
          src="/promptpay-qr.jpg"
          alt="PromptPay QR"
          width={250}
          height={340}
          className="w-full max-w-[250px] h-auto rounded-[14px] border border-border"
        />
        <button
          type="button"
          onClick={onDownload}
          className="w-full h-12 rounded-[13px] bg-ink flex items-center justify-center gap-2 text-[14px] font-semibold text-canvas cursor-pointer"
        >
          ดาวน์โหลด QR
        </button>
      </div>

      <div className="bg-surface border border-border rounded-[18px] p-4 flex flex-col gap-3">
        <div className="text-[11.5px] text-ink-5 font-bold">ขั้นที่ 2 · เพิ่มเพื่อน LINE OA แล้วส่งสลิป</div>
        <div className="text-[13.5px] leading-[1.7] text-ink-2">
          เพิ่มเพื่อน LINE OA <strong className="text-ink">@147itqlv</strong> แล้วส่งสลิปการโอนเข้ามา ทีมงานจะยืนยันการจองให้ภายในไม่กี่นาที
        </div>
        <div className="flex items-center gap-3 p-[12px_14px] rounded-[14px] bg-surface-alt border border-border">
          <div className="w-[42px] h-[42px] flex-none rounded-[12px] bg-line flex items-center justify-center text-[15px] font-bold text-white">
            LINE
          </div>
          <div className="flex flex-col gap-[2px] min-w-0">
            <div className="text-[14px] font-bold text-ink">@147itqlv</div>
            <div className="text-[11.5px] text-ink-3">LINE OA ทางการ · ส่งสลิปและรับใบเสร็จที่นี่</div>
          </div>
        </div>
        <a
          href="https://line.me/R/ti/p/~@147itqlv"
          target="_blank"
          rel="noreferrer"
          className="h-12 rounded-[13px] bg-line flex items-center justify-center text-[14px] font-semibold text-white"
        >
          เพิ่มเพื่อน LINE OA
        </a>
      </div>

      <button
        type="button"
        disabled={saving}
        onClick={onConfirmSlip}
        className="h-[52px] rounded-[14px] bg-accent flex items-center justify-center text-[15px] font-semibold text-white cursor-pointer disabled:opacity-60"
      >
        {saving ? "กำลังบันทึก…" : "ส่งสลิปแล้ว · ยืนยันการจอง"}
      </button>
    </div>
  );
}
