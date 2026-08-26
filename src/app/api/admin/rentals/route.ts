import { NextResponse } from "next/server";
import { listOpenRentalsForAdmin } from "@/lib/db/rentals";
import { requireAdmin } from "@/lib/admin/guard";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const rentals = await listOpenRentalsForAdmin();
  return NextResponse.json({ rentals });
}
