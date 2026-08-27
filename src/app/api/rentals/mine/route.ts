import { NextResponse } from "next/server";
import { listRentalsForMember } from "@/lib/db/rentals";
import { requireMember } from "@/lib/admin/guard";

export async function GET() {
  const auth = await requireMember();
  if (auth instanceof NextResponse) return auth;
  const rentals = await listRentalsForMember(auth.memberId);
  return NextResponse.json({ rentals });
}
