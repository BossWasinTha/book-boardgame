import { NextResponse } from "next/server";
import { getMemberIdFromCookies } from "@/lib/session";
import { isAdminSession } from "@/lib/admin-session";
import { getRentalMemberId, returnRental } from "@/lib/db/rentals";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [isAdmin, memberId, ownerId] = await Promise.all([
    isAdminSession(),
    getMemberIdFromCookies(),
    getRentalMemberId(id),
  ]);
  if (!ownerId) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (!isAdmin && ownerId !== memberId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  await returnRental(id);
  return NextResponse.json({ ok: true });
}
