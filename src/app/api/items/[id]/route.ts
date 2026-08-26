import { NextResponse } from "next/server";
import { z } from "zod";
import { setItemPrice, softDeleteItem } from "@/lib/db/items";
import { requireAdmin } from "@/lib/admin/guard";

const patchSchema = z.object({
  deposit: z.number().int().min(0),
  ratePerDay: z.number().int().min(0),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  await setItemPrice(id, parsed.data.deposit, parsed.data.ratePerDay);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  await softDeleteItem(id);
  return NextResponse.json({ ok: true });
}
