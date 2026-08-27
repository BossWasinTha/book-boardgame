import { isAdminSession } from "@/lib/admin-session";
import { listItems } from "@/lib/db/items";
import { listMembersForAdmin } from "@/lib/db/members";
import PinGate from "@/components/admin/PinGate";
import AdminShell from "@/components/admin/AdminShell";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const isAdmin = await isAdminSession();
  if (!isAdmin) {
    return <PinGate />;
  }

  const [items, members] = await Promise.all([listItems(), listMembersForAdmin()]);
  const counts = {
    items: items.length,
    rentals: items.filter((i) => i.status === "out" || i.status === "overdue").length,
    members: members.length,
  };

  return <AdminShell initialCounts={counts}>{children}</AdminShell>;
}
