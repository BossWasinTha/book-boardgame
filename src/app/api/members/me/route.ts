import { NextResponse } from "next/server";
import { getMemberIdFromCookies } from "@/lib/session";
import { getMember } from "@/lib/db/members";

export async function GET() {
  const memberId = await getMemberIdFromCookies();
  if (!memberId) return NextResponse.json({ member: null });
  const member = await getMember(memberId);
  return NextResponse.json({ member });
}
