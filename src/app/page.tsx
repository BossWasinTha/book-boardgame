import { listItems } from "@/lib/db/items";
import { getMember } from "@/lib/db/members";
import { getMemberIdFromCookies } from "@/lib/session";
import { AppShell } from "@/components/customer/AppShell";

export default async function Page() {
  const memberId = await getMemberIdFromCookies();
  const [items, member] = await Promise.all([listItems(), memberId ? getMember(memberId) : null]);

  return (
    <div className="h-dvh bg-canvas-admin flex justify-center">
      <div className="w-full max-w-[480px] h-dvh bg-canvas relative">
        <AppShell initialItems={items} initialMember={member} />
      </div>
    </div>
  );
}
