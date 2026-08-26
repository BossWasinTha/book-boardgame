"use client";
import type { ReactNode } from "react";

export function BottomSheet({
  open,
  onClose,
  children,
  maxHeightPct,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  maxHeightPct?: number;
}) {
  if (!open) return null;
  return (
    <>
      <div onClick={onClose} className="absolute inset-0 bg-[rgba(40,32,24,.4)] z-[8] anim-fade" />
      <div
        className="absolute left-0 right-0 bottom-0 bg-canvas rounded-t-[26px] px-5 pt-[18px] pb-[26px] z-[9] anim-up overflow-y-auto"
        style={maxHeightPct ? { maxHeight: `${maxHeightPct}%` } : undefined}
      >
        <div className="w-10 h-1 rounded-full bg-border-input mx-auto mb-4" />
        {children}
      </div>
    </>
  );
}
