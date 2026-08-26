"use client";
import type { Item, Member } from "@/lib/types";
import { decorate } from "@/lib/customer/catalog";

export function Home({
  items,
  member,
  onOpen,
  onRent,
  onGoSearch,
  onGoExplore,
  onGoProfile,
  onOpenSignup,
}: {
  items: Item[];
  member: Member | null;
  onOpen: (id: string) => void;
  onRent: (item: Item) => void;
  onGoSearch: () => void;
  onGoExplore: (cat: "ทั้งหมด" | "หนังสือ" | "บอร์ดเกม", filters: string[]) => void;
  onGoProfile: () => void;
  onOpenSignup: () => void;
}) {
  const bookCount = items.filter((i) => i.itemType === "หนังสือ").length;
  const gameCount = items.filter((i) => i.itemType === "บอร์ดเกม").length;
  const avail = items.filter((i) => i.status === "shelf");
  const tonight = avail.slice(0, 5);
  const popular = items.filter((i) => i.tags.includes("popular"));
  const forTwo = items.filter((i) => i.tags.includes("two")).slice(0, 3);
  const initials = (member?.name ?? "").trim().charAt(0) || "?";

  return (
    <div className="px-5 pb-[108px] flex flex-col gap-[26px]">
      <div className="flex items-center justify-between">
        <div className="font-display text-[19px] text-ink">Books &amp; Boardgame</div>
        <div className="flex items-center gap-[10px]">
          <div className="relative w-[34px] h-[34px] rounded-full border border-border flex items-center justify-center bg-surface-alt">
            <div className="w-1 h-1 rounded-full bg-ink-3" />
            <div className="absolute top-[6px] right-[7px] w-[7px] h-[7px] rounded-full bg-accent border-[1.5px] border-canvas" />
          </div>
          {member ? (
            <button
              type="button"
              onClick={onGoProfile}
              className="w-[34px] h-[34px] rounded-full bg-avatar overflow-hidden flex items-center justify-center text-[12px] font-bold text-ink-2 cursor-pointer bg-cover bg-center"
              style={member.photoUrl ? { backgroundImage: `url("${member.photoUrl}")` } : undefined}
            >
              {!member.photoUrl && <span>{initials}</span>}
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenSignup}
              className="h-[34px] px-[13px] rounded-full bg-ink flex items-center gap-[6px] cursor-pointer"
            >
              <span className="text-[13px] font-bold text-canvas leading-none">+</span>
              <span className="text-[12px] font-semibold text-canvas">สมัครสมาชิก</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="font-display text-[33px] leading-[1.25] text-ink -tracking-[0.01em]">
          คืนนี้อยากสนุก
          <br />
          กับอะไรดี?
        </div>
        <div className="text-[14px] leading-[1.7] text-ink-3 max-w-[300px]">ยืมหนังสือหรือบอร์ดเกมจากชั้นวางของเพื่อนบ้าน</div>
        <button
          type="button"
          onClick={onGoSearch}
          className="mt-[2px] flex items-center gap-[10px] h-[50px] px-4 bg-surface border border-border rounded-[14px] cursor-pointer shadow-[0_1px_2px_rgba(60,45,30,.04)] text-left"
        >
          <div className="w-[15px] h-[15px] border-2 border-ink-5 rounded-full flex-none" />
          <span className="text-[13.5px] text-ink-5">ค้นหาหนังสือ เกม ผู้เขียน หมวดหมู่…</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-[10px]">
        <button
          type="button"
          onClick={() => onGoExplore("หนังสือ", [])}
          className="h-24 rounded-[16px] bg-[#EFE3D2] p-[14px] flex flex-col justify-between cursor-pointer border border-border text-left"
        >
          <div className="text-[20px]">📚</div>
          <div>
            <div className="text-[14px] font-semibold text-ink">หนังสือ</div>
            <div className="text-[11.5px] text-ink-4">{bookCount} เล่มบนชั้น</div>
          </div>
        </button>
        <button
          type="button"
          onClick={() => onGoExplore("บอร์ดเกม", [])}
          className="h-24 rounded-[16px] bg-[#E7E1D2] p-[14px] flex flex-col justify-between cursor-pointer border border-border text-left"
        >
          <div className="text-[20px]">🎲</div>
          <div>
            <div className="text-[14px] font-semibold text-ink">บอร์ดเกม</div>
            <div className="text-[11.5px] text-ink-4">{gameCount} กล่องพร้อมเล่น</div>
          </div>
        </button>
        <button
          type="button"
          onClick={() => onGoExplore("ทั้งหมด", ["avail"])}
          className="col-span-2 h-[62px] rounded-[16px] bg-ink px-4 flex items-center justify-between cursor-pointer text-left"
        >
          <div className="flex items-center gap-[10px]">
            <div className="w-2 h-2 rounded-full bg-[#7FBF92]" />
            <div className="text-[14px] font-semibold text-canvas">ว่างให้ยืมตอนนี้</div>
          </div>
          <div className="text-[12px] text-[#BCAE9B]">{avail.length} รายการ →</div>
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <div className="font-display text-[21px] text-ink">ว่างสำหรับคืนนี้</div>
          <button type="button" onClick={() => onGoExplore("ทั้งหมด", ["avail"])} className="text-[12px] text-accent cursor-pointer font-medium">
            ดูทั้งหมด
          </button>
        </div>
        <div className="row flex gap-3 overflow-x-auto -mx-5 px-5 py-[2px] pb-1">
          {tonight.map((it) => (
            <TonightCard key={it.id} item={it} onOpen={() => onOpen(it.id)} onRent={() => onRent(it)} />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="font-display text-[21px] text-ink">ยอดนิยมในหมู่บ้าน</div>
        <div className="row flex gap-3 overflow-x-auto -mx-5 px-5 py-[2px] pb-1">
          {popular.map((it) => (
            <PopularCard key={it.id} item={it} onOpen={() => onOpen(it.id)} />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-baseline gap-2">
          <div className="font-display text-[21px] text-ink">เล่นกัน 2 คน</div>
          <div className="text-[11.5px] text-ink-5">ไม่เกิน 30 นาที</div>
        </div>
        <div className="flex flex-col gap-2">
          {forTwo.map((it) => {
            const d = decorate(it);
            return (
              <button
                key={it.id}
                type="button"
                onClick={() => onOpen(it.id)}
                className="flex items-center gap-3 p-[10px] bg-surface border border-border rounded-[14px] cursor-pointer text-left"
              >
                <div className="w-[52px] h-[52px] flex-none rounded-[10px]" style={{ background: it.coverColor }} />
                <div className="flex-1 flex flex-col gap-[2px] min-w-0">
                  <div className="text-[14px] font-semibold text-ink">{it.title}</div>
                  <div className="text-[11.5px] text-ink-3">{it.subtitle}</div>
                </div>
                <div className="flex items-center gap-[5px] flex-none">
                  <div className="w-[6px] h-[6px] rounded-full" style={{ background: d.dot }} />
                  <div className="text-[11px] font-semibold" style={{ color: d.statusInk }}>
                    {d.statusShort}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4 rounded-[16px] bg-surface-alt border border-dashed border-border-input flex flex-col gap-[5px]">
        <div className="font-display text-[17px] text-ink">รับของที่ล็อบบี้ตึก A</div>
        <div className="text-[12px] leading-[1.7] text-ink-3">ส่งมือต่อมือ · ทุกวัน เวลา 19:00–21:00 น.</div>
      </div>
    </div>
  );
}

function TonightCard({ item, onOpen, onRent }: { item: Item; onOpen: () => void; onRent: () => void }) {
  const d = decorate(item);
  return (
    <div className="flex-none w-[168px] bg-surface border border-border rounded-[16px] overflow-hidden shadow-[0_1px_2px_rgba(60,45,30,.04)]">
      <button
        type="button"
        onClick={onOpen}
        className="h-[132px] w-full flex items-end p-3 cursor-pointer text-left"
        style={{ background: item.coverColor }}
      >
        <div className="font-display text-[16px] leading-[1.15]" style={{ color: item.coverInk }}>
          {item.title}
        </div>
      </button>
      <div className="p-[11px_12px_12px] flex flex-col gap-[7px]">
        <button type="button" onClick={onOpen} className="cursor-pointer flex flex-col gap-[3px] text-left">
          <div className="text-[14px] font-semibold text-ink leading-[1.25]">{item.title}</div>
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
          className="mt-[2px] h-[34px] rounded-[10px] bg-accent flex items-center justify-center text-[13px] font-semibold text-white cursor-pointer"
        >
          ยืมเลย
        </button>
      </div>
    </div>
  );
}

function PopularCard({ item, onOpen }: { item: Item; onOpen: () => void }) {
  const d = decorate(item);
  return (
    <button type="button" onClick={onOpen} className="flex-none w-[132px] cursor-pointer flex flex-col gap-2 text-left">
      <div className="h-[108px] rounded-[14px] flex items-end p-[10px]" style={{ background: item.coverColor }}>
        <div className="font-display text-[14px] leading-[1.15]" style={{ color: item.coverInk }}>
          {item.title}
        </div>
      </div>
      <div className="flex flex-col gap-[2px]">
        <div className="text-[13px] font-semibold text-ink leading-[1.25]">{item.title}</div>
        <div className="text-[11px] text-ink-3">{item.shortLabel}</div>
        <div className="text-[11px] font-semibold" style={{ color: d.statusInk }}>
          {d.statusLabel}
        </div>
      </div>
    </button>
  );
}
