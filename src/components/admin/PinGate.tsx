"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "ล้าง", "0", "⌫"];

interface PinResponse {
  ok: boolean;
  lockedForMs?: number;
  attemptsLeft?: number;
}

export default function PinGate() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [pinErr, setPinErr] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);
  const [lockUntil, setLockUntil] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!lockUntil) return;
    const t = setInterval(() => {
      const left = Math.max(0, Math.ceil((lockUntil - Date.now()) / 1000));
      if (left <= 0) {
        setLockUntil(null);
        setPinErr(false);
        setAttemptsLeft(null);
        clearInterval(t);
      } else {
        setNow(Date.now());
      }
    }, 1000);
    return () => clearInterval(t);
  }, [lockUntil]);

  const lockLeft = lockUntil ? Math.max(0, Math.ceil((lockUntil - now) / 1000)) : 0;

  const submit = useCallback(
    async (fullPin: string) => {
      setChecking(true);
      try {
        const res = await fetch("/api/admin/pin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pin: fullPin }),
        });
        const data = (await res.json()) as PinResponse;
        if (data.ok) {
          setPin("");
          router.refresh();
          return;
        }
        setPinErr(true);
        if (typeof data.lockedForMs === "number") {
          setLockUntil(Date.now() + data.lockedForMs);
          setNow(Date.now());
        } else if (typeof data.attemptsLeft === "number") {
          setAttemptsLeft(data.attemptsLeft);
        }
        setTimeout(() => setPin(""), 500);
      } catch {
        setPinErr(true);
        setTimeout(() => setPin(""), 500);
      } finally {
        setChecking(false);
      }
    },
    [router],
  );

  const press = (label: string) => {
    if (lockLeft > 0 || checking) return;
    if (label === "ล้าง") {
      setPin("");
      setPinErr(false);
      return;
    }
    if (label === "⌫") {
      setPin((p) => p.slice(0, -1));
      setPinErr(false);
      return;
    }
    setPin((p) => {
      if (p.length >= 6) return p;
      const next = p + label;
      if (next.length === 6) setTimeout(() => submit(next), 120);
      return next;
    });
    setPinErr(false);
  };

  const hint =
    lockLeft > 0
      ? `ใส่ PIN ผิด 3 ครั้ง · ลองใหม่ได้ในอีก ${Math.floor(lockLeft / 60)}:${String(lockLeft % 60).padStart(2, "0")} นาที`
      : pinErr
        ? attemptsLeft != null
          ? `PIN ไม่ถูกต้อง เหลืออีก ${attemptsLeft} ครั้ง`
          : "PIN ไม่ถูกต้อง"
        : "ใส่รหัส 6 หลักที่ได้รับจากนิติบุคคล";
  const hintInk = pinErr || lockLeft > 0 ? "text-red" : "text-ink-3";

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-canvas-admin px-5">
      <div className="w-full max-w-[360px] bg-canvas border border-border rounded-[26px] p-[22px_22px_26px] flex flex-col items-center anim-pop shadow-[0_26px_50px_-18px_rgba(40,30,20,.5)]">
        <div className="font-display text-[19px] text-ink">Books &amp; Boardgame</div>
        <div className="text-[11px] tracking-[0.08em] font-semibold text-ink-4 mb-5">BUILDING LIBRARY ADMIN</div>
        <div className="font-display text-[23px] text-ink mb-[6px] self-start">ใส่รหัส PIN ผู้ดูแล</div>
        <div className={`text-[13px] leading-[1.6] mb-[18px] self-start ${hintInk}`}>{hint}</div>

        <div className="flex gap-[10px] justify-center mb-[22px]">
          {Array.from({ length: 6 }).map((_, n) => {
            const filled = pin.length > n;
            const active = pin.length === n;
            return (
              <div
                key={n}
                className={`w-[42px] h-[52px] rounded-xl border-[1.5px] flex items-center justify-center text-xl font-bold text-ink ${
                  pinErr ? "border-[#E0B4AC]" : active ? "border-ink" : "border-border"
                } ${filled ? "bg-[#F2EBDF]" : "bg-surface"}`}
              >
                {filled ? "•" : ""}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-3 gap-[10px] w-full">
          {KEYS.map((label) => {
            const isNum = /^[0-9]$/.test(label);
            const off = lockLeft > 0;
            return (
              <button
                key={label}
                type="button"
                onClick={() => press(label)}
                disabled={off}
                className={`h-14 rounded-[14px] flex items-center justify-center font-semibold cursor-pointer disabled:cursor-not-allowed ${
                  isNum ? (off ? "bg-[#F2EBDF]" : "bg-surface") : "bg-transparent"
                } ${isNum && !off ? "border border-border" : "border border-transparent"} ${
                  off ? "text-[#C4B49E]" : isNum ? "text-ink" : "text-ink-4"
                } ${isNum ? "text-[21px]" : "text-[13px]"}`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
