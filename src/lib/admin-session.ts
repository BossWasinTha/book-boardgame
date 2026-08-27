import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

const ADMIN_COOKIE = "bb_admin";
// Server-side hard cap (defense in depth) — the cookie itself carries no
// maxAge, so it's a browser-session cookie: closing the browser clears it
// and the PIN is required again next visit, by design (admin preference).
const ADMIN_TTL = "12h";

function secretKey() {
  return new TextEncoder().encode(env.sessionSecret);
}

export async function setAdminCookie() {
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ADMIN_TTL)
    .sign(secretKey());
  const store = await cookies();
  store.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

export async function clearAdminCookie() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
}

export async function isAdminSession(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return payload.role === "admin";
  } catch {
    return false;
  }
}
