"use client";

export function RentBar({
  caption,
  value,
  label,
  bg,
  onAction,
}: {
  caption: string;
  value: string;
  label: string;
  bg: string;
  onAction: () => void;
}) {
  return (
    <div
      className="absolute left-0 right-0 bottom-0 px-5 pt-[14px] pb-[22px] flex items-center gap-3 z-[6]"
      style={{ background: "linear-gradient(to top, #FAF6EF 62%, rgba(250,246,239,0))" }}
    >
      <div className="flex flex-col gap-[1px] flex-none">
        <div className="text-[11px] text-ink-4">{caption}</div>
        <div className="text-[13px] font-bold text-ink whitespace-nowrap">{value}</div>
      </div>
      <button
        type="button"
        onClick={onAction}
        className="flex-1 h-[52px] rounded-[14px] flex items-center justify-center text-[15px] font-semibold text-white cursor-pointer"
        style={{ background: bg }}
      >
        {label}
      </button>
    </div>
  );
}
