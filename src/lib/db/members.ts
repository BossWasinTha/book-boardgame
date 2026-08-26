import "server-only";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { Member } from "@/lib/types";

interface MemberRow {
  id: string;
  name: string;
  phone: string;
  unit: string | null;
  photo_url: string | null;
  signup_ip: string | null;
  created_at: string;
}

function mapMember(row: MemberRow): Member {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    unit: row.unit,
    photoUrl: row.photo_url,
    signupIp: row.signup_ip,
    createdAt: row.created_at,
  };
}

export async function getMember(id: string): Promise<Member | null> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("members")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throw error;
  return data ? mapMember(data as MemberRow) : null;
}

export interface UpsertMemberInput {
  name: string;
  phone: string;
  unit: string | null;
  photoUrl: string | null;
  signupIp: string;
}

export async function createMember(input: UpsertMemberInput): Promise<Member> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("members")
    .insert({
      name: input.name,
      phone: input.phone,
      unit: input.unit,
      photo_url: input.photoUrl,
      signup_ip: input.signupIp,
    })
    .select("*")
    .single();
  if (error) throw error;
  return mapMember(data as MemberRow);
}

export async function updateMember(
  id: string,
  input: Pick<UpsertMemberInput, "name" | "phone" | "unit" | "photoUrl">,
): Promise<Member> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("members")
    .update({
      name: input.name,
      phone: input.phone,
      unit: input.unit,
      photo_url: input.photoUrl,
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return mapMember(data as MemberRow);
}

export interface AdminMemberView extends Member {
  currentCount: number;
  totalCount: number;
}

export async function listMembersForAdmin(): Promise<AdminMemberView[]> {
  const db = supabaseAdmin();
  const [{ data: members, error: mErr }, { data: rentals, error: rErr }] = await Promise.all([
    db.from("members").select("*").is("deleted_at", null).order("created_at"),
    db.from("rentals").select("member_id, returned_on"),
  ]);
  if (mErr) throw mErr;
  if (rErr) throw rErr;

  const counts = new Map<string, { current: number; total: number }>();
  for (const r of rentals ?? []) {
    const c = counts.get(r.member_id) ?? { current: 0, total: 0 };
    c.total += 1;
    if (!r.returned_on) c.current += 1;
    counts.set(r.member_id, c);
  }

  return ((members ?? []) as MemberRow[])
    .filter((m) => m.id !== "00000000-0000-0000-0000-000000000000")
    .map((row) => {
      const c = counts.get(row.id) ?? { current: 0, total: 0 };
      return { ...mapMember(row), currentCount: c.current, totalCount: c.total };
    });
}

export async function softDeleteMember(id: string) {
  const db = supabaseAdmin();
  const { error } = await db.from("members").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
}
