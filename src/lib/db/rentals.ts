import "server-only";
import { supabaseAdmin } from "@/lib/supabase/server";
import { addDaysIso, todayBangkokIso } from "@/lib/server-date";
import { WALK_IN_MEMBER_ID, type RentalHistoryEntry, type Slot } from "@/lib/types";

export interface CreateRentalInput {
  itemId: string;
  memberId: string;
  dueOn: string; // ISO date
  pickupSlot: Slot;
  returnSlot: Slot;
  depositThb: number;
  rentThb: number;
}

export class ItemUnavailableError extends Error {
  constructor() {
    super("Item already has an open rental");
  }
}

export async function createRental(input: CreateRentalInput): Promise<string> {
  const db = supabaseAdmin();
  const { data: existing, error: existingErr } = await db
    .from("rentals")
    .select("id")
    .eq("item_id", input.itemId)
    .is("returned_on", null)
    .maybeSingle();
  if (existingErr) throw existingErr;
  if (existing) throw new ItemUnavailableError();

  const { data, error } = await db
    .from("rentals")
    .insert({
      item_id: input.itemId,
      member_id: input.memberId,
      rented_on: todayBangkokIso(),
      due_on: input.dueOn,
      pickup_slot: input.pickupSlot,
      return_slot: input.returnSlot,
      deposit_thb: input.depositThb,
      rent_thb: input.rentThb,
      total_thb: input.depositThb + input.rentThb,
      payment_state: "confirmed",
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function getRentalMemberId(rentalId: string): Promise<string | null> {
  const db = supabaseAdmin();
  const { data, error } = await db.from("rentals").select("member_id").eq("id", rentalId).maybeSingle();
  if (error) throw error;
  return (data?.member_id as string | undefined) ?? null;
}

export async function returnRental(rentalId: string) {
  const db = supabaseAdmin();
  const { error } = await db
    .from("rentals")
    .update({ returned_on: todayBangkokIso() })
    .eq("id", rentalId)
    .is("returned_on", null);
  if (error) throw error;
}

/** Admin "mark rented" walk-in toggle — no member account attached. */
export async function createWalkInRental(itemId: string, days = 3): Promise<string> {
  return createRental({
    itemId,
    memberId: WALK_IN_MEMBER_ID,
    dueOn: addDaysIso(todayBangkokIso(), days),
    pickupSlot: "เย็น",
    returnSlot: "เย็น",
    depositThb: 0,
    rentThb: 0,
  });
}

export async function returnOpenRentalForItem(itemId: string) {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("rentals")
    .select("id")
    .eq("item_id", itemId)
    .is("returned_on", null)
    .maybeSingle();
  if (error) throw error;
  if (data) await returnRental(data.id as string);
}

interface RentalRow {
  id: string;
  item_id: string;
  rented_on: string;
  due_on: string;
  returned_on: string | null;
  pickup_slot: Slot;
  return_slot: Slot;
  deposit_thb: number;
  rent_thb: number;
  total_thb: number;
}

function mapRental(row: RentalRow): RentalHistoryEntry {
  return {
    id: row.id,
    itemId: row.item_id,
    rentedOn: row.rented_on,
    dueOn: row.due_on,
    returnedOn: row.returned_on,
    pickupSlot: row.pickup_slot,
    returnSlot: row.return_slot,
    depositThb: row.deposit_thb,
    rentThb: row.rent_thb,
    totalThb: row.total_thb,
  };
}

export async function listRentalsForMember(memberId: string): Promise<RentalHistoryEntry[]> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("rentals")
    .select("*")
    .eq("member_id", memberId)
    .order("rented_on", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as RentalRow[]).map(mapRental);
}

export interface AdminRentalRow extends RentalHistoryEntry {
  renterName: string;
  renterUnit: string | null;
  itemTitle: string;
  itemType: "หนังสือ" | "บอร์ดเกม";
  coverColor: string;
  coverInk: string;
}

interface AdminRentalJoinRow extends RentalRow {
  member: { name: string; unit: string | null } | null;
  item: { title: string; item_type: "หนังสือ" | "บอร์ดเกม"; cover_color: string; cover_ink: string } | null;
}

export async function listOpenRentalsForAdmin(): Promise<AdminRentalRow[]> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("rentals")
    .select("*, member:members(name, unit), item:items(title, item_type, cover_color, cover_ink)")
    .is("returned_on", null)
    .order("due_on");
  if (error) throw error;
  return ((data ?? []) as AdminRentalJoinRow[]).map((row) => ({
    ...mapRental(row),
    renterName: row.member?.name ?? "—",
    renterUnit: row.member?.unit ?? null,
    itemTitle: row.item?.title ?? row.item_id,
    itemType: row.item?.item_type ?? "บอร์ดเกม",
    coverColor: row.item?.cover_color ?? "#DCCDB6",
    coverInk: row.item?.cover_ink ?? "#2A241E",
  }));
}

/** Items whose pickup or return happens today, plus overdue items to chase — for the admin dashboard's handover panel. */
export async function listTodayHandover(): Promise<
  { kind: "pickup" | "return" | "chase"; itemTitle: string; renterName: string; renterUnit: string | null }[]
> {
  const db = supabaseAdmin();
  const todayIso = todayBangkokIso();
  const { data, error } = await db
    .from("rentals")
    .select("rented_on, due_on, member:members(name, unit), item:items(title)")
    .is("returned_on", null)
    .or(`rented_on.eq.${todayIso},due_on.lte.${todayIso}`);
  if (error) throw error;
  return ((data ?? []) as unknown as {
    rented_on: string;
    due_on: string;
    member: { name: string; unit: string | null } | null;
    item: { title: string } | null;
  }[]).map((row) => ({
    kind: row.due_on < todayIso ? "chase" : row.due_on === todayIso ? "return" : "pickup",
    itemTitle: row.item?.title ?? "—",
    renterName: row.member?.name ?? "—",
    renterUnit: row.member?.unit ?? null,
  }));
}
