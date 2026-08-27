import { NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { supabaseAdmin } from "@/lib/supabase/server";

const DATA_URL = /^data:(image\/(png|jpe?g|webp|gif));base64,([a-zA-Z0-9+/=]+)$/;

const bodySchema = z.object({
  dataUrl: z.string().regex(DATA_URL, "รูปภาพไม่ถูกต้อง"),
});

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "อัปโหลดรูปไม่สำเร็จ" }, { status: 400 });
  }
  const match = parsed.data.dataUrl.match(DATA_URL)!;
  const [, mime, ext, base64] = match;
  const bytes = Buffer.from(base64, "base64");
  if (bytes.length > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "ไฟล์รูปใหญ่เกินไป (สูงสุด 5MB)" }, { status: 400 });
  }

  const db = supabaseAdmin();
  const path = `${randomUUID()}.${ext === "jpeg" ? "jpg" : ext}`;
  const { error } = await db.storage.from("avatars").upload(path, bytes, {
    contentType: mime,
    upsert: false,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  const { data } = db.storage.from("avatars").getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
