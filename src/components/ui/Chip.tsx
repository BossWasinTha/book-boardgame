"use client";

export function Chip({
  label,
  active,
  onClick,
  suffix,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  suffix?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-[14px] py-[8px] rounded-full text-[13px] font-semibold whitespace-nowrap border cursor-pointer transition-colors ${
        active ? "bg-ink text-canvas border-ink" : "bg-surface text-ink-2 border-border"
      }`}
    >
      {label}
      {suffix ? ` ${suffix}` : ""}
    </button>
  );
}
