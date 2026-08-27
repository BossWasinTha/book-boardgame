"use client";
import type { Item } from "@/lib/types";
import { baht } from "@/lib/customer/date";
import { decorate, matchesItem } from "@/lib/customer/catalog";
import { Chip } from "@/components/ui/Chip";

const CATS: ("ทั้งหมด" | "หนังสือ" | "บอร์ดเกม")[] = ["ทั้งหมด", "หนังสือ", "บอร์ดเกม"];

export function Explore({
  items,
  cat,
  query,
  filters,
  onCat,
  onOpenFilters,
  onOpen,
  onRent,
  onGoSearch,
  onClearFilters,
}: {
  items: Item[];
  cat: "ทั้งหมด" | "หนังสือ" | "บอร์ดเกม";
  query: string;
  filters: string[];
  onCat: (c: "ทั้งหมด" | "หนังสือ" | "บอร์ดเกม") => void;
  onOpenFilters: () => void;
  onOpen: (id: string) => void;
  onRent: (item: Item) => void;
  onGoSearch: () => void;
  onClearFilters: () => void;
}) {
  const results = items.filter((i) => matchesItem(i, { cat, query, filters }));

  return (
    <div className="px-5 pb-[108px] flex flex-col gap-4">
      <div className="font-display text-[29px] text-ink -tracking-[0.01em]">สำรวจ</div>
      <button
        type="button"
        onClick={onGoSearch}
        className="flex items-center gap-[10px] h-[46px] px-[14px] bg-surface border border-border rounded-[13px] cursor-pointer text-left"
      >
        <div className="w-[14px] h-[14px] border-2 border-ink-5 rounded-full flex-none" />
        <span className="text-[13.5px] text-ink-5">ค้นหาในคอลเลกชัน</span>
      </button>
      <div className="flex items-center gap-2">
        {CATS.map((c) => (
          <Chip key={c} label={c} active={cat === c} onClick={() => onCat(c)} />
        ))}
        <button
          type="button"
          onClick={onOpenFilters}
          className="ml-auto flex items-center gap-[6px] px-3 py-2 rounded-full border border-border bg-surface text-[13px] font-semibold text-ink cursor-pointer whitespace-nowrap"
        >
          <div className="flex flex-col gap-[2px]">
            <div className="w-[11px] h-[1.5px] bg-ink" />
            <div className="w-[7px] h-[1.5px] bg-ink" />
          </div>
          ตัวกรอง {filters.length ? `· ${filters.length}` : ""}
        </button>
      </div>

      <div className="text-[12px] text-ink-4">
        {results.length} รายการ{filters.length ? ` · ${filters.length} ตัวกรอง` : ""}
      </div>

      {results.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {results.map((it) => (
            <ExploreCard key={it.id} item={it} onOpen={() => onOpen(it.id)} onRent={() => onRent(it)} />
          ))}
        </div>
      ) : (
        <div className="mt-10 flex flex-col items-center gap-[10px] text-center">
          <div className="w-16 h-16 rounded-full bg-surface-alt border border-dashed border-border-input" />
          <div className="font-display text-[19px] text-ink">ยังไม่มีรายการที่ตรง</div>
          <div className="text-[13px] text-ink-3 max-w-[250px] leading-[1.7]">ลองล้างตัวกรอง หรือดูทุกอย่างที่ว่างอยู่บนชั้นคืนนี้</div>
          <button
            type="button"
            onClick={onClearFilters}
            className="mt-[6px] px-[18px] py-[11px] rounded-[11px] bg-ink text-canvas text-[13px] font-semibold cursor-pointer"
          >
            ล้างตัวกรอง
          </button>
        </div>
      )}
    </div>
  );
}

function ExploreCard({ item, onOpen, onRent }: { item: Item; onOpen: () => void; onRent: () => void }) {
  const d = decorate(item);
  return (
    <div className="bg-surface border border-border rounded-[16px] overflow-hidden">
      <button
        type="button"
        onClick={onOpen}
        className="h-[118px] w-full flex items-end p-[11px] cursor-pointer text-left"
        style={{ background: item.coverColor }}
      >
        <div className="font-display text-[15px] leading-[1.15]" style={{ color: item.coverInk }}>
          {item.title}
        </div>
      </button>
      <div className="p-[10px_11px_11px] flex flex-col gap-[6px]">
        <button type="button" onClick={onOpen} className="cursor-pointer flex flex-col gap-[3px] text-left">
          <div className="flex items-start justify-between gap-2">
            <div className="text-[13.5px] font-semibold text-ink leading-[1.25]">{item.title}</div>
            <div className="flex-none px-[7px] py-[3px] rounded-[8px] bg-surface-alt border border-border text-[10.5px] font-bold text-ink-2 whitespace-nowrap">
              {baht(item.ratePerDay)} ฿/วัน
            </div>
          </div>
          <div className="text-[11px] text-ink-5 font-semibold">{item.itemType}</div>
          <div className="text-[11.5px] text-ink-3 leading-[1.5]">{item.subtitle}</div>
        </button>
        <div className="flex items-center gap-[5px]">
          <div className="w-[6px] h-[6px] rounded-full" style={{ background: d.dot }} />
          <div className="text-[11px] font-semibold" style={{ color: d.statusInk }}>
            {d.statusLabel}
          </div>
        </div>
        <button
          type="button"
          onClick={onRent}
          className="h-8 rounded-[10px] flex items-center justify-center text-[12.5px] font-semibold cursor-pointer border"
          style={
            d.isAvailable
              ? { background: "var(--color-accent)", color: "#FFFFFF", borderColor: "transparent" }
              : { background: "transparent", color: "#2A241E", borderColor: "var(--color-border-input)" }
          }
        >
          {d.isAvailable ? "ยืมเลย" : "แจ้งเตือน"}
        </button>
      </div>
    </div>
  );
}
