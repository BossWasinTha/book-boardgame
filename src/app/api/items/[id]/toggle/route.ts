import { NextResponse } from "next/server";
import { getItem, setItemCondition } from "@/lib/db/items";
import { createWalkInRental, returnOpenRentalForItem } from "@/lib/db/rentals";
import { requireAdmin } from "@/lib/admin/guard";

/**
 * Admin-only "mark rented" / "mark available" toggle. "Mark rented" only
 * applies to shelf items (walk-in counter traffic, no member account).
 * "Mark available" force-returns an open rental for out/overdue items, or
 * clears the repair flag for items in repair — it's a shortcut back to
 * shelf either way, same as the prototype's single binary toggle.
 */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const item = await getItem(id);
  if (!item) return NextResponse.json({ error: "not found" }, { status: 404 });

  if (item.status === "shelf") {
    await createWalkInRental(id);
  } else if (item.status === "repair") {
    await setItemCondition(id, "shelf");
  } else {
    await returnOpenRentalForItem(id);
  }
  return NextResponse.json({ ok: true });
}
