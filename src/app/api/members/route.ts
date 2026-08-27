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

  // Phone numbers are unique across members. Reject if this number already
  // belongs to someone else (a different member than the one editing, if any).
  const existingOwner = await findMemberByPhone(phone);
  if (existingOwner && existingOwner.id !== existingMemberId) {
    return NextResponse.json(
      { error: "เบอร์นี้มีอยู่ในระบบแล้ว กรุณาใช้เบอร์อื่น" },
      { status: 409 },
    );
  }

  const member = existingMemberId
    ? await updateMember(existingMemberId, {
        name,
        phone,
        unit: unit || null,
        photoUrl: photoUrl || null,
      })
    : await createMember({
        name,
        phone,
        unit: unit || null,
        photoUrl: photoUrl || null,
        signupIp: getRequestIp(req),
      });

  await setMemberCookie(member.id);
  return NextResponse.json({ member, editing: Boolean(existingMemberId) });
}
