"use client";

import { useMemo, useState } from "react";
import type { AdminMemberView } from "@/lib/db/members";
import { useAdminUi } from "./AdminUiContext";
import { useRealtimeRefetch } from "./useRealtimeRefetch";
import { formatLongDate } from "./adminFormat";

function initialsOf(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** Real members don't have the prototype's hand-written narrative — derive a plain line from their rental counts. */
function lastLine(member: AdminMemberView): string {
  if (member.currentCount > 0) return `กำลังยืม ${member.currentCount} รายการ`;
  if (member.totalCount > 0) return `เคยยืมแล้ว ${member.totalCount} รายการทั้งหมด`;
  return "ยังไม่เคยยืม";
}

export default function UsersGrid({ initialMembers }: { initialMembers: AdminMemberView[] }) {
  const { flash } = useAdminUi();
  const [members, setMembers] = useState(initialMembers);

  const refetch = useMemo(
    () => async () => {
      try {
        const res = await fetch("/api/admin/members");
        const data = await res.json();
        setMembers(data.members ?? []);
      } catch {
        // best-effort
      }
    },
    [],
  );

  useRealtimeRefetch(["members", "rentals"], refetch);

  const remove = async (member: AdminMemberView) => {
    setMembers((prev) => prev.filter((m) => m.id !== member.id));
    try {
      const res = await fetch(`/api/admin/members/${member.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("failed");
      flash(`${member.name} removed from the member list.`);
    } catch {
      flash(`Could not remove ${member.name}.`);
      refetch();
    }
  };

  if (members.length === 0) {
    return <div className="text-[13px] text-ink-3">No neighbours registered yet.</div>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 max-[1180px]:grid-cols-1">
      {members.map((member) => {
        const dot = member.currentCount > 0 ? "bg-accent" : "bg-green";
        const state = member.currentCount > 0 ? "Borrowing" : member.totalCount > 0 ? "Returned all" : "New member";
        return (
          <div key={member.id} className="bg-surface border border-border rounded-2xl p-[18px_20px] flex gap-[14px]">
            <div
              className="w-11 h-11 flex-none rounded-full bg-avatar flex items-center justify-center text-[14px] font-bold text-ink-2 overflow-hidden bg-cover bg-center"
              style={member.photoUrl ? { backgroundImage: `url(${member.photoUrl})` } : undefined}
            >
              {!member.photoUrl && initialsOf(member.name)}
            </div>
            <div className="flex-1 flex flex-col gap-[6px] min-w-0">
              <div className="flex items-center justify-between gap-[10px]">
                <div className="text-[14.5px] font-semibold text-ink truncate">{member.name}</div>
                <div className="flex items-center gap-[10px] flex-none">
                  <div className="flex items-center gap-[6px]">
                    <div className={`w-[7px] h-[7px] flex-none rounded-full ${dot}`} />
                    <div className="text-[11.5px] text-ink-3 whitespace-nowrap">{state}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(member)}
                    title="Remove member"
                    className="w-6 h-6 flex-none rounded-lg border border-[#E0C4BC] bg-[#FBF1EE] flex items-center justify-center text-[11px] font-bold text-red cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="text-[12px] text-ink-4">
                {member.unit ?? "—"} · {member.currentCount} out now · {member.totalCount} all-time
              </div>
              <div className="text-[12px] text-ink-4">
                {member.phone} · IP {member.signupIp ?? "—"} · joined {formatLongDate(member.createdAt)}
              </div>
              <div className="text-[12.5px] text-ink-2 leading-[1.65]">{lastLine(member)}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
