import { NextResponse } from "next/server";
import { z } from "zod";
import { checkAndRecordPinAttempt } from "@/lib/admin/pin";
import { setAdminCookie } from "@/lib/admin-session";
import { getRequestIp } from "@/lib/request-ip";

const bodySchema = z.object({ pin: z.string().regex(/^\d{6}$/) });

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "PIN ไม่ถูกต้อง" }, { status: 400 });
  }

  const ip = getRequestIp(req);
  const result = await checkAndRecordPinAttempt(ip, parsed.data.pin);

  if (result.ok) {
    await setAdminCookie();
    return NextResponse.json({ ok: true });
  }
  if ("lockedForMs" in result) {
    return NextResponse.json({ ok: false, lockedForMs: result.lockedForMs }, { status: 429 });
  }
  return NextResponse.json({ ok: false, attemptsLeft: result.attemptsLeft }, { status: 401 });
}
