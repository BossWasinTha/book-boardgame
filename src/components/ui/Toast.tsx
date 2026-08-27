"use client";

export function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="absolute left-5 right-5 bottom-24 z-[12] px-4 py-[14px] rounded-[14px] bg-ink text-canvas text-[13.5px] font-medium flex items-center gap-[10px] anim-pop shadow-[0_14px_30px_-12px_rgba(40,30,20,.6)]">
      <div className="w-[7px] h-[7px] rounded-full bg-[#7FBF92] flex-none" />
      {message}
    </div>
  );
}
