"use client";

import { useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { ItemType } from "@/lib/types";
import { useAdminUi } from "./AdminUiContext";

const COVER_OPTIONS = ["#C9A88C", "#B9C7C9", "#CBBE9B", "#C7B3C4", "#A9B8C4", "#DCC49B", "#B0B9A5"];
const TYPE_OPTIONS: { label: string; value: ItemType }[] = [
  { label: "Board Game", value: "บอร์ดเกม" },
  { label: "Book", value: "หนังสือ" },
];

function toNonNegInt(raw: string): number {
  const n = parseInt(raw.replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export default function AddItemModal() {
  const { closeAdd, flash } = useAdminUi();
  const router = useRouter();
  const pathname = usePathname();
  const [title, setTitle] = useState("");
  const [sub, setSub] = useState("");
  const [type, setType] = useState<ItemType>("บอร์ดเกม");
  const [deposit, setDeposit] = useState("800");
  const [rate, setRate] = useState("20");
  const [cover, setCover] = useState(COVER_OPTIONS[0]);
  const [saving, setSaving] = useState(false);

  const canSave = title.trim().length > 0;

  const save = async () => {
    const trimmed = title.trim();
    if (!trimmed) {
      flash("Give the item a title first.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: trimmed,
          itemType: type,
          subtitle: sub.trim(),
          coverColor: cover,
          deposit: toNonNegInt(deposit),
          ratePerDay: toNonNegInt(rate),
        }),
      });
      if (!res.ok) {
        flash("Could not add the item. Try again.");
        return;
      }
      setTitle("");
      setSub("");
      setType("บอร์ดเกม");
      setDeposit("800");
      setRate("20");
      setCover(COVER_OPTIONS[0]);
      closeAdd();
      flash(`${trimmed} added to the collection.`);
      if (pathname !== "/admin/inventory") router.push("/admin/inventory");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      onClick={closeAdd}
      className="fixed inset-0 z-30 bg-[rgba(42,36,30,0.42)] flex items-center justify-center p-10 anim-fade"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-[520px] max-w-full bg-[#FDFAF4] border border-border rounded-[18px] p-[26px_28px_24px] flex flex-col gap-[18px] shadow-[0_30px_70px_rgba(42,36,30,0.28)] anim-pop"
      >
        <div className="flex flex-col gap-1">
          <div className="font-display text-[24px] text-ink">Add an item</div>
          <div className="text-[13px] text-ink-3">
            It goes straight onto the shelf and into the neighbours&apos; app.
          </div>
        </div>

        <Field label="TITLE">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Wingspan"
            className="h-[42px] px-[13px] border border-border rounded-[10px] bg-surface outline-none text-[14px] text-ink font-body"
          />
        </Field>

        <Field label="DETAIL">
          <input
            value={sub}
            onChange={(e) => setSub(e.target.value)}
            placeholder="Engine-building · 1–5"
            className="h-[42px] px-[13px] border border-border rounded-[10px] bg-surface outline-none text-[14px] text-ink font-body"
          />
        </Field>

        <Field label="TYPE">
          <div className="flex gap-2">
            {TYPE_OPTIONS.map((t) => {
              const on = type === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  className={`px-4 py-[9px] rounded-[9px] border text-[13px] font-medium cursor-pointer ${
                    on ? "bg-ink text-canvas border-ink" : "bg-surface text-ink-2 border-border"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </Field>

        <div className="flex gap-[14px]">
          <Field label="DEPOSIT (฿)" className="flex-1">
            <input
              value={deposit}
              onChange={(e) => setDeposit(e.target.value)}
              inputMode="numeric"
              className="h-[42px] px-[13px] border border-border rounded-[10px] bg-surface outline-none text-[14px] text-ink font-body"
            />
          </Field>
          <Field label="RATE / DAY (฿)" className="flex-1">
            <input
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              inputMode="numeric"
              className="h-[42px] px-[13px] border border-border rounded-[10px] bg-surface outline-none text-[14px] text-ink font-body"
            />
          </Field>
        </div>

        <Field label="COVER">
          <div className="flex gap-[10px]">
            {COVER_OPTIONS.map((hex) => (
              <button
                key={hex}
                type="button"
                onClick={() => setCover(hex)}
                aria-label={`cover ${hex}`}
                style={{ background: hex, boxShadow: cover === hex ? "0 0 0 2px #2A241E" : "0 0 0 0px #2A241E" }}
                className="w-[38px] h-[48px] rounded-[6px] cursor-pointer"
              />
            ))}
          </div>
        </Field>

        <div className="flex justify-end gap-[10px] pt-[2px]">
          <button
            type="button"
            onClick={closeAdd}
            className="h-10 px-[18px] rounded-[10px] border border-border flex items-center text-[13px] font-medium text-ink-2 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className={`h-10 px-5 rounded-[10px] flex items-center text-[13px] font-semibold text-canvas cursor-pointer disabled:cursor-wait ${
              canSave ? "bg-accent" : "bg-[#C6B7A3]"
            }`}
          >
            Add to collection
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col gap-[6px] ${className ?? ""}`}>
      <div className="text-[11px] font-semibold tracking-[0.08em] text-ink-4">{label}</div>
      {children}
    </div>
  );
}
