import "server-only";
import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-session";
import { getMemberIdFromCookies } from "@/lib/session";

export async function requireAdmin(): Promise<NextResponse | null> {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return null;
}

export async function requireMember(): Promise<{ memberId: string } | NextResponse> {
  const memberId = await getMemberIdFromCookies();
  if (!memberId) {
    return NextResponse.json({ error: "member session required" }, { status: 401 });
  }
  return { memberId };
}
