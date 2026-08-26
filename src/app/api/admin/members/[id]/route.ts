import { NextResponse } from "next/server";
import { softDeleteMember } from "@/lib/db/members";
import { requireAdmin } from "@/lib/admin/guard";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  await softDeleteMember(id);
  return NextResponse.json({ ok: true });
}
