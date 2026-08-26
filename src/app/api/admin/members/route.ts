import { NextResponse } from "next/server";
import { listMembersForAdmin } from "@/lib/db/members";
import { requireAdmin } from "@/lib/admin/guard";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const members = await listMembersForAdmin();
  return NextResponse.json({ members });
}
