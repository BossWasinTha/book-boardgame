import "server-only";
import { timingSafeEqual } from "node:crypto";
import { supabaseAdmin } from "@/lib/supabase/server";
import { env } from "@/lib/env";

const MAX_ATTEMPTS = 3;
const LOCK_MS = 5 * 60 * 1000;

function pinsMatch(submitted: string, expected: string): boolean {
  const a = Buffer.from(submitted);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export type PinAttemptResult =
  | { ok: true }
  | { ok: false; lockedForMs: number }
  | { ok: false; attemptsLeft: number };

export async function checkAndRecordPinAttempt(ip: string, pin: string): Promise<PinAttemptResult> {
  const db = supabaseAdmin();
  const { data: row } = await db.from("admin_lockouts").select("*").eq("ip", ip).maybeSingle();

  const now = Date.now();
  const lockedUntilMs = row?.locked_until ? new Date(row.locked_until).getTime() : 0;
  if (lockedUntilMs > now) {
    return { ok: false, lockedForMs: lockedUntilMs - now };
  }

  if (pinsMatch(pin, env.adminPin)) {
    if (row) await db.from("admin_lockouts").delete().eq("ip", ip);
    return { ok: true };
  }

  const attempts = (row?.attempts ?? 0) + 1;
  if (attempts >= MAX_ATTEMPTS) {
    const lockedUntil = new Date(now + LOCK_MS).toISOString();
    await db.from("admin_lockouts").upsert({ ip, attempts, locked_until: lockedUntil });
    return { ok: false, lockedForMs: LOCK_MS };
  }
  await db.from("admin_lockouts").upsert({ ip, attempts, locked_until: null });
  return { ok: false, attemptsLeft: MAX_ATTEMPTS - attempts };
}
