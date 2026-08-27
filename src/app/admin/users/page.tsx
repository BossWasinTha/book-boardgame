import { listMembersForAdmin } from "@/lib/db/members";
import UsersGrid from "@/components/admin/UsersGrid";

export default async function AdminUsersPage() {
  const members = await listMembersForAdmin();
  return <UsersGrid initialMembers={members} />;
}
