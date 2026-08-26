import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

const MEMBER_COOKIE = "bb_member";
const MEMBER_TTL = "180d";
const MEMBER_MAX_AGE = 60 * 60 * 24 * 180;

function secretKey() {
  return new TextEncoder().encode(env.sessionSecret);
}

export async function setMemberCookie(memberId: string) {
  const token = await new SignJWT({ mid: memberId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(MEMBER_TTL)
    .sign(secretKey());
  const store = await cookies();
  store.set(MEMBER_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MEMBER_MAX_AGE,
  });
}

export async function clearMemberCookie() {
  const store = await cookies();
  store.delete(MEMBER_COOKIE);
}

export async function getMemberIdFromCookies(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(MEMBER_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return typeof payload.mid === "string" ? payload.mid : null;
  } catch {
    return null;
  }
}
