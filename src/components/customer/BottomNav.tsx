"use client";
import type { Screen } from "./types";

const NAVS: { id: Screen; label: string; path: string; path2: string }[] = [
  { id: "home", label: "หน้าแรก", path: "M3 10.2 12 3.5l9 6.7", path2: "M5.4 9v10.5h13.2V9" },
  { id: "explore", label: "สำรวจ", path: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14", path2: "M16.2 16.2 21 21" },
  {
    id: "rentals",
    label: "รายการยืม",
    path: "M4 5.2A1.2 1.2 0 0 1 5.2 4H9a2.5 2.5 0 0 1 2.5 2.5V20A2.2 2.2 0 0 0 9.3 17.8H4Z",
    path2: "M20 5.2A1.2 1.2 0 0 0 18.8 4H15a2.5 2.5 0 0 0-2.5 2.5V20a2.2 2.2 0 0 1 2.2-2.2H20Z",
  },
  {
    id: "profile",
    label: "โปรไฟล์",
    path: "M12 4a3.6 3.6 0 1 0 0 7.2A3.6 3.6 0 0 0 12 4",
    path2: "M4.8 20.2c0-3.4 3.2-5.6 7.2-5.6s7.2 2.2 7.2 5.6",
  },
];

export function BottomNav({ screen, onNavigate }: { screen: Screen; onNavigate: (s: Screen) => void }) {
  return (
    <div className="absolute left-0 right-0 bottom-0 h-[78px] bg-[rgba(250,246,239,.95)] border-t border-border flex items-start pt-3 z-[5] backdrop-blur-[8px]">
      {NAVS.map((n) => {
        const active = screen === n.id;
        const fg = active ? "#2A241E" : "#A8977F";
        return (
          <button
            key={n.id}
            type="button"
            onClick={() => onNavigate(n.id)}
            className="flex-1 flex flex-col items-center gap-1 cursor-pointer"
          >
            <svg
              width="23"
              height="23"
              viewBox="0 0 24 24"
              fill="none"
              stroke={fg}
              strokeWidth={active ? 2.1 : 1.6}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={n.path} />
              <path d={n.path2} />
            </svg>
            <div className="text-[11px] font-semibold" style={{ color: fg }}>
              {n.label}
            </div>
          </button>
        );
      })}
    </div>
  );
}
