import { NextResponse } from "next/server";
import { z } from "zod";
import { createMember, findMemberByPhone, updateMember } from "@/lib/db/members";
import { getMemberIdFromCookies, setMemberCookie } from "@/lib/session";
import { getRequestIp } from "@/lib/request-ip";

const bodySchema = z.object({
  name: z.string().trim().min(1, "กรอกชื่อก่อนนะ"),
  phone: z.string().trim().min(1, "กรอกเบอร์โทรก่อนนะ"),
  unit: z.string().trim().optional(),
  photoUrl: z.string().trim().optional(),
});

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "กรอกชื่อและเบอร์โทรก่อนนะ" }, { status: 400 });
  }
  const { name, phone, unit, photoUrl } = parsed.data;

  const existingMemberId = await getMemberIdFromCookies();
  let member;
  let matchedExisting = false;

  if (existingMemberId) {
    member = await updateMember(existingMemberId, {
      name,
      phone,
      unit: unit || null,
      photoUrl: photoUrl || null,
    });
  } else {
    // No session yet — if this phone number is already registered (e.g. the
    // customer is signing up again from a new device), log them into that
    // existing account instead of creating a duplicate.
    const found = await findMemberByPhone(phone);
    if (found) {
      member = found;
      matchedExisting = true;
    } else {
      member = await createMember({
        name,
        phone,
        unit: unit || null,
        photoUrl: photoUrl || null,
        signupIp: getRequestIp(req),
      });
    }
  }

  await setMemberCookie(member.id);
  return NextResponse.json({ member, editing: Boolean(existingMemberId), matchedExisting });
}
