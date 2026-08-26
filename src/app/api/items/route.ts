import { NextResponse } from "next/server";
import { z } from "zod";
import { listItems, createCustomItem } from "@/lib/db/items";
import { requireAdmin } from "@/lib/admin/guard";

export async function GET() {
  const items = await listItems();
  return NextResponse.json({ items });
}

const newItemSchema = z.object({
  title: z.string().trim().min(1),
  itemType: z.enum(["หนังสือ", "บอร์ดเกม"]),
  subtitle: z.string().trim().default(""),
  coverColor: z.string().trim().min(1),
  deposit: z.number().int().min(0),
  ratePerDay: z.number().int().min(0),
});

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const parsed = newItemSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const input = parsed.data;
  const id = await createCustomItem({
    ...input,
    subtitle: input.subtitle || (input.itemType === "หนังสือ" ? "หนังสือ" : "บอร์ดเกม"),
  });
  return NextResponse.json({ id }, { status: 201 });
}
