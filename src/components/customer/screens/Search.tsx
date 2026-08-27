"use client";
import type { Item } from "@/lib/types";
import { decorate, matchesItem } from "@/lib/customer/catalog";

const SUGGESTIONS = ["Codenames", "Murakami", "ไซไฟ", "บอร์ดเกม", "หนังสือ", "Azul"];

export function Search({
  items,
  cat,
  query,
  filters,
  onQuery,
  onBack,
  onOpen,
}: {
  items: Item[];
  cat: "ทั้งหมด" | "หนังสือ" | "บอร์ดเกม";
  query: string;
  filters: string[];
  onQuery: (q: string) => void;
  onBack: () => void;
  onOpen: (id: string) => void;
}) {
  const hasQuery = query.trim().length > 0;
  const results = items.filter((i) => matchesItem(i, { cat, query, filters }));

  return (
    <div className="px-5 pb-[108px] flex flex-col gap-4">
      <div className="flex items-center gap-[10px]">
        <div className="flex-1 flex items-center gap-[10px] h-[46px] px-[14px] bg-surface border border-border-input rounded-[13px]">
          <div className="w-[14px] h-[14px] border-2 border-ink-5 rounded-full flex-none" />
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="ค้นหาหนังสือ เกม ผู้เขียน…"
            autoFocus
            className="flex-1 min-w-0 border-0 outline-none bg-transparent font-body text-[14px] text-ink"
          />
        </div>
        <button type="button" onClick={onBack} className="text-[13.5px] text-accent font-semibold cursor-pointer">
          ยกเลิก
        </button>
      </div>

      {!hasQuery && (
        <div className="flex flex-col gap-3">
          <div className="text-[11.5px] text-ink-5 font-bold">ค้นหาล่าสุดและยอดนิยม</div>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onQuery(s)}
                className="px-[13px] py-2 rounded-full bg-surface-alt border border-border text-[13px] text-ink-2 cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {hasQuery && (
        <div className="flex flex-col gap-[10px]">
          <div className="text-[12px] text-ink-4">{results.length} รายการ</div>
          {results.map((it) => {
            const d = decorate(it);
            return (
              <button
                key={it.id}
                type="button"
                onClick={() => onOpen(it.id)}
                className="flex items-center gap-3 p-[10px] bg-surface border border-border rounded-[14px] cursor-pointer text-left"
              >
                <div className="w-14 h-14 flex-none rounded-[10px]" style={{ background: it.coverColor }} />
                <div className="flex-1 flex flex-col gap-[3px] min-w-0">
                  <div className="text-[14px] font-semibold text-ink">{it.title}</div>
                  <div className="text-[11.5px] text-ink-3">
                    {it.itemType} · {it.subtitle}
                  </div>
                  <div className="flex items-center gap-[5px]">
                    <div className="w-[6px] h-[6px] rounded-full" style={{ background: d.dot }} />
                    <div className="text-[11px] font-semibold" style={{ color: d.statusInk }}>
                      {d.statusLabel}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
          {results.length === 0 && (
            <div className="mt-[30px] flex flex-col items-center gap-[10px] text-center">
              <div className="font-display text-[19px] text-ink">ไม่พบ “{query}”</div>
              <div className="text-[13px] text-ink-3 max-w-[250px] leading-[1.7]">
                ลองตรวจตัวสะกดอีกครั้ง หรือฝากผู้ดูแลชั้นวางให้เพิ่มเข้าคอลเลกชัน
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
