"use client";
import Link from "next/link";
import type { Member } from "@/lib/types";

const MON = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

export function Profile({
  member,
  currentCount,
  pastCount,
  onGoRentals,
  onEditProfile,
  onLogout,
}: {
  member: Member | null;
  currentCount: number;
  pastCount: number;
  onGoRentals: () => void;
  onEditProfile: () => void;
  onLogout: () => void;
}) {
  const joined = member ? new Date(member.createdAt) : null;
  const initials = (member?.name ?? "").trim().charAt(0) || "?";

  return (
    <div className="px-5 pb-[108px] flex flex-col gap-5">
      <div className="font-display text-[29px] text-ink -tracking-[0.01em]">โปรไฟล์</div>

      {member ? (
        <>
          <div className="flex items-center gap-[14px]">
            <div
              className="w-16 h-16 rounded-full bg-avatar overflow-hidden flex-none flex items-center justify-center text-[22px] font-bold text-ink-2 bg-cover bg-center"
              style={member.photoUrl ? { backgroundImage: `url("${member.photoUrl}")` } : undefined}
            >
              {!member.photoUrl && <span>{initials}</span>}
            </div>
            <div className="flex flex-col gap-[3px]">
              <div className="font-display text-[21px] text-ink">{member.name}</div>
              <div className="text-[13px] text-ink-3">
                {joined ? `เป็นเพื่อนบ้านตั้งแต่ ${MON[joined.getMonth()]} ${joined.getFullYear()}` : ""}
              </div>
            </div>
          </div>

          <div className="flex gap-[10px]">
            <div className="flex-1 p-[14px] rounded-[14px] bg-surface-alt border border-border flex flex-col gap-[2px]">
              <div className="font-display text-[24px] text-ink">{currentCount}</div>
              <div className="text-[11.5px] text-ink-3">กำลังยืมอยู่</div>
            </div>
            <div className="flex-1 p-[14px] rounded-[14px] bg-surface-alt border border-border flex flex-col gap-[2px]">
              <div className="font-display text-[24px] text-ink">{pastCount}</div>
              <div className="text-[11.5px] text-ink-3">คืนแล้วทั้งหมด</div>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-[16px] overflow-hidden">
            <div className="p-[14px_16px] flex justify-between border-b border-border-light">
              <span className="text-[13px] text-ink-3">โทรศัพท์</span>
              <span className="text-[13.5px] font-semibold text-ink">{member.phone}</span>
            </div>
            <div className="p-[14px_16px] flex justify-between">
              <span className="text-[13px] text-ink-3">ห้อง</span>
              <span className="text-[13.5px] font-semibold text-ink">{member.unit ?? "—"}</span>
            </div>
          </div>
        </>
      ) : (
        <div className="p-4 rounded-[16px] bg-surface-alt border border-dashed border-border-input flex flex-col gap-2">
          <div className="text-[14px] font-semibold text-ink">ยังไม่ได้สมัครสมาชิก</div>
          <div className="text-[12.5px] text-ink-3 leading-[1.6]">สมัครสมาชิกเพื่อยืมของและดูประวัติการยืมของคุณ</div>
          <button
            type="button"
            onClick={onEditProfile}
            className="mt-1 h-11 rounded-[12px] bg-accent flex items-center justify-center text-[13.5px] font-semibold text-white cursor-pointer"
          >
            สมัครสมาชิก
          </button>
        </div>
      )}

      <div className="flex flex-col gap-[10px]">
        <button
          type="button"
          onClick={onGoRentals}
          className="h-[50px] rounded-[14px] bg-ink flex items-center justify-center text-[14.5px] font-semibold text-canvas cursor-pointer"
        >
          ประวัติการยืม
        </button>
        {member && (
          <button
            type="button"
            onClick={onEditProfile}
            className="h-[50px] rounded-[14px] border-[1.5px] border-border-input flex items-center justify-center text-[14.5px] font-semibold text-ink cursor-pointer"
          >
            แก้ไขโปรไฟล์
          </button>
        )}
        <Link
          href="/admin"
          className="p-[14px_16px] rounded-[14px] border-[1.5px] border-border-input bg-surface-warm flex items-center gap-3 cursor-pointer"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8A6A3B" strokeWidth={1.7} strokeLinecap="round">
            <path d="M6 11V8a6 6 0 0 1 12 0v3"></path>
            <path d="M5 11h14v9H5z"></path>
          </svg>
          <div className="flex flex-col gap-[2px] flex-1">
            <div className="text-[14px] font-semibold text-ink">แดชบอร์ดผู้ดูแล</div>
            <div className="text-[11.5px] text-ink-4">สำหรับผู้ดูแลคลังของตึก · ต้องใส่รหัส PIN</div>
          </div>
          <div className="text-[16px] text-ink-5">›</div>
        </Link>
        {member && (
          <button
            type="button"
            onClick={onLogout}
            className="h-[50px] rounded-[14px] flex items-center justify-center text-[14.5px] font-semibold text-red cursor-pointer"
          >
            ออกจากระบบ
          </button>
        )}
      </div>
      <div className="text-[11.5px] text-ink-5 text-center leading-[1.7]">ชื่อและเบอร์โทรใช้ยืนยันตัวตนตอนรับ–คืนของเท่านั้น</div>
    </div>
  );
}
