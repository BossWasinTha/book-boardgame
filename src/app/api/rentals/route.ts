import { NextResponse } from "next/server";
import { z } from "zod";
import { getItem } from "@/lib/db/items";
import { createRental, ItemUnavailableError } from "@/lib/db/rentals";
import { requireMember } from "@/lib/admin/guard";
import { todayBangkokIso } from "@/lib/server-date";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const bodySchema = z.object({
  itemId: z.string().trim().min(1),
  pickupOn: z.string().regex(ISO_DATE),
  dueOn: z.string().regex(ISO_DATE),
  pickupSlot: z.enum(["เช้า", "เย็น"]),
  returnSlot: z.enum(["เช้า", "เย็น"]),
});

export async function POST(req: Request) {
  const auth = await requireMember();
  if (auth instanceof NextResponse) return auth;

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "ข้อมูลการจองไม่ถูกต้อง" }, { status: 400 });
  }
  const { itemId, pickupOn, dueOn, pickupSlot, returnSlot } = parsed.data;

  if (pickupOn < todayBangkokIso()) {
    return NextResponse.json({ error: "วันรับของต้องไม่อยู่ในอดีต" }, { status: 400 });
  }
  if (dueOn <= pickupOn) {
    return NextResponse.json({ error: "วันคืนต้องอยู่หลังวันรับของ" }, { status: 400 });
  }

  const item = await getItem(itemId);
  if (!item) return NextResponse.json({ error: "ไม่พบรายการนี้" }, { status: 404 });
  if (item.status === "out" || item.status === "overdue") {
    return NextResponse.json({ error: "รายการนี้ถูกยืมไปแล้ว" }, { status: 409 });
  }

  const days = Math.max(
    1,
    Math.round((Date.parse(dueOn) - Date.parse(pickupOn)) / 86_400_000),
  );
  const rentThb = item.ratePerDay * days;

  try {
    const id = await createRental({
      itemId,
      memberId: auth.memberId,
      dueOn,
      pickupSlot,
      returnSlot,
      depositThb: item.deposit,
      rentThb,
    });
    return NextResponse.json({ id, days, rentThb, depositThb: item.deposit }, { status: 201 });
  } catch (e) {
    if (e instanceof ItemUnavailableError) {
      return NextResponse.json({ error: "รายการนี้ถูกยืมไปแล้ว" }, { status: 409 });
    }
    throw e;
  }
}
