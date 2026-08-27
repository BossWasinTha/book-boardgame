"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import type { Item } from "@/lib/types";
import type { AdminMemberView } from "@/lib/db/members";
import { AdminUiProvider, useAdminUi } from "./AdminUiContext";
import { useRealtimeRefetch } from "./useRealtimeRefetch";
import AddItemModal from "./AddItemModal";

export interface AdminCounts {
  items: number;
  rentals: number;
  members: number;
}

const NAV: { href: string; label: string; countKey: keyof AdminCounts | null }[] = [
  { href: "/admin", label: "Dashboard", countKey: null },
  { href: "/admin/inventory", label: "Inventory", countKey: "items" },
  { href: "/admin/rentals", label: "Rentals", countKey: "rentals" },
  { href: "/admin/users", label: "Users", countKey: "members" },
];

export default function AdminShell({
  children,
  initialCounts,
}: {
  children: ReactNode;
  initialCounts: AdminCounts;
}) {
  return (
    <AdminUiProvider>
      <ShellInner initialCounts={initialCounts}>{children}</ShellInner>
    </AdminUiProvider>
  );
}

function headerFor(pathname: string, counts: AdminCounts): { title: string; subtitle: string } {
  if (pathname === "/admin") {
    const today = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date());
    return { title: "Dashboard", subtitle: `${today} · next handover 7–8 pm` };
  }
  if (pathname.startsWith("/admin/inventory")) {
    return { title: "Inventory", subtitle: `${counts.items} items in the collection` };
  }
  if (pathname.startsWith("/admin/rentals")) {
    return { title: "Rentals", subtitle: `${counts.rentals} rentals out right now` };
  }
  if (pathname.startsWith("/admin/users")) {
    return { title: "Users", subtitle: `${counts.members} neighbours registered` };
  }
  return { title: "Admin", subtitle: "" };
}

function ShellInner({ children, initialCounts }: { children: ReactNode; initialCounts: AdminCounts }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast, addOpen } = useAdminUi();
  const [counts, setCounts] = useState<AdminCounts>(initialCounts);
  const q = searchParams.get("q") ?? "";

  const refreshCounts = useMemo(
    () => async () => {
      try {
        const [itemsRes, membersRes] = await Promise.all([
          fetch("/api/items").then((r) => r.json()),
          fetch("/api/admin/members").then((r) => r.json()),
        ]);
        const items: Item[] = itemsRes.items ?? [];
        const members: AdminMemberView[] = membersRes.members ?? [];
        setCounts({
          items: items.length,
          rentals: items.filter((i) => i.status === "out" || i.status === "overdue").length,
          members: members.length,
        });
      } catch {
        // best-effort — keep showing the previous counts on failure
      }
    },
    [],
  );

  useRealtimeRefetch(["items", "rentals", "members"], refreshCounts);

  const onSearchChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("q", value);
    else params.delete("q");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const header = headerFor(pathname, counts);

  return (
    <div className="flex min-h-screen bg-canvas-admin text-ink font-body max-[1180px]:flex-col">
      <aside className="w-[236px] flex-none bg-ink flex flex-col p-[22px_16px] gap-[26px] max-[1180px]:w-full max-[1180px]:flex-row max-[1180px]:items-center max-[1180px]:gap-[14px] max-[1180px]:p-[12px_14px] max-[1180px]:overflow-x-auto">
        <div className="flex flex-col gap-[3px] px-[6px]">
          <div className="font-display text-[19px] text-canvas">Books &amp; Boardgame</div>
          <div className="max-[1180px]:hidden text-[11px] tracking-[0.08em] font-semibold text-ink-4">
            BUILDING LIBRARY ADMIN
          </div>
        </div>

        <nav className="flex flex-col gap-1 max-[1180px]:flex-row max-[1180px]:gap-[6px]">
          {NAV.map((n) => {
            const active = n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href);
            const count = n.countKey ? counts[n.countKey] : null;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`h-10 px-3 rounded-[9px] flex items-center justify-between gap-3 whitespace-nowrap ${
                  active ? "bg-[#413931]" : "bg-transparent"
                }`}
              >
                <span className={`text-[13.5px] font-medium ${active ? "text-canvas" : "text-[#B5A794]"}`}>
                  {n.label}
                </span>
                {count !== null && (
                  <span className={`text-[11.5px] font-semibold ${active ? "text-[#B5A794]" : "text-[#7A6C5A]"}`}>
                    {count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <LogoutButton />

        <div className="mt-auto p-[14px] rounded-xl bg-[#352E27] flex flex-col gap-[5px] max-[1180px]:hidden">
          <div className="text-[11px] tracking-[0.07em] font-bold text-ink-4">HANDOVER WINDOWS</div>
          <div className="text-[12.5px] text-[#D9CEBD] leading-[1.6]">
            7–8 am · 7–8 pm
            <br />
            Lobby, Tower B
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-auto max-[1180px]:overflow-visible">
        <div className="p-[26px_32px_44px] flex flex-col gap-[22px] max-[1180px]:p-[18px_16px_40px] max-[1180px]:gap-[16px]">
          <div className="flex items-end gap-[18px] max-[1180px]:flex-col max-[1180px]:items-stretch max-[1180px]:gap-3">
            <div className="flex-1 flex flex-col gap-1">
              <div className="font-display text-[30px] tracking-[-0.01em] text-ink">{header.title}</div>
              <div className="text-[13px] text-ink-3">{header.subtitle}</div>
            </div>
            <div className="h-[38px] w-[280px] flex-none px-[13px] rounded-[10px] bg-surface border border-border flex items-center gap-[9px] max-[1180px]:w-full">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#A8977F" strokeWidth={2} strokeLinecap="round">
                <circle cx="11" cy="11" r="7" />
                <path d="M16.2 16.2 21 21" />
              </svg>
              <input
                value={q}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search items, renters…"
                className="flex-1 border-0 outline-none bg-transparent text-[13px] text-ink font-body"
              />
            </div>
            <AddItemButton />
          </div>

          {children}
        </div>
      </main>

      {addOpen && <AddItemModal />}

      {toast && (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-[30px] z-[35] p-[13px_18px] rounded-xl bg-ink text-canvas text-[13px] font-medium flex items-center gap-[10px] shadow-[0_18px_40px_-14px_rgba(40,30,20,.6)] anim-fade">
          <div className="w-[7px] h-[7px] rounded-full bg-[#7FBF92]" />
          {toast}
        </div>
      )}
    </div>
  );
}

function LogoutButton() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const logout = async () => {
    setLoggingOut(true);
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={logout}
      disabled={loggingOut}
      className="h-10 px-3 rounded-[9px] flex items-center gap-2 whitespace-nowrap text-[13.5px] font-medium text-[#C98A7D] hover:bg-[#413931] cursor-pointer disabled:opacity-60"
    >
      {loggingOut ? "Logging out…" : "Log out"}
    </button>
  );
}

function AddItemButton() {
  const { openAdd } = useAdminUi();
  return (
    <button
      type="button"
      onClick={openAdd}
      className="h-[38px] flex-none px-4 rounded-[10px] bg-accent hover:bg-accent-hover flex items-center whitespace-nowrap text-[13px] font-semibold text-white cursor-pointer"
    >
      + Add item
    </button>
  );
}
