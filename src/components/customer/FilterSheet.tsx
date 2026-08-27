"use client";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Chip } from "@/components/ui/Chip";
import { FILTER_GROUPS } from "@/lib/customer/catalog";

export function FilterSheet({
  open,
  filters,
  resultCount,
  onToggle,
  onClear,
  onClose,
}: {
  open: boolean;
  filters: string[];
  resultCount: number;
  onToggle: (id: string) => void;
  onClear: () => void;
  onClose: () => void;
}) {
  return (
    <BottomSheet open={open} onClose={onClose} maxHeightPct={80}>
      <div className="flex items-center justify-between mb-4">
        <div className="font-display text-[21px] text-ink">ตัวกรอง</div>
        <button type="button" onClick={onClear} className="text-[13px] font-semibold text-accent cursor-pointer">
          ล้างทั้งหมด
        </button>
      </div>
      <div className="flex flex-col gap-[18px]">
        {FILTER_GROUPS.map((g) => (
          <div key={g.name} className="flex flex-col gap-[9px]">
            <div className="text-[11.5px] text-ink-5 font-bold">{g.name}</div>
            <div className="flex flex-wrap gap-2">
              {g.opts.map((o) => (
                <Chip key={o.id} label={o.label} active={filters.includes(o.id)} onClick={() => onToggle(o.id)} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="mt-[22px] w-full h-[52px] rounded-[14px] bg-ink flex items-center justify-center text-[15px] font-semibold text-canvas cursor-pointer"
      >
        ดู {resultCount} รายการ
      </button>
    </BottomSheet>
  );
}
