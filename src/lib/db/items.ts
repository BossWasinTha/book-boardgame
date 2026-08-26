import "server-only";
import { supabaseAdmin } from "@/lib/supabase/server";
import { todayBangkokIso } from "@/lib/server-date";
import type { Item, ItemStatus } from "@/lib/types";

interface ItemRow {
  id: string;
  title: string;
  item_type: "หนังสือ" | "บอร์ดเกม";
  author: string | null;
  genre: string | null;
  subtitle: string;
  short_label: string;
  cover_color: string;
  cover_ink: string;
  description: string;
  facts: { k: string; v: string }[];
  tags: string[];
  deposit: number;
  rate_per_day: number;
  condition: "shelf" | "repair";
  is_custom: boolean;
}

interface OpenRentalRow {
  id: string;
  item_id: string;
  due_on: string;
  rented_on: string;
  member: { name: string; unit: string | null } | { name: string; unit: string | null }[] | null;
}

function firstMember(member: OpenRentalRow["member"]) {
  if (!member) return null;
  return Array.isArray(member) ? (member[0] ?? null) : member;
}

function mapItem(row: ItemRow, rental: OpenRentalRow | undefined, todayIso: string): Item {
  let status: ItemStatus = row.condition;
  let activeRental: Item["activeRental"] = null;
  if (rental) {
    status = rental.due_on < todayIso ? "overdue" : "out";
    const member = firstMember(rental.member);
    activeRental = {
      id: rental.id,
      dueOn: rental.due_on,
      rentedOn: rental.rented_on,
      renterName: member?.name ?? "—",
      renterUnit: member?.unit ?? null,
    };
  }
  return {
    id: row.id,
    title: row.title,
    itemType: row.item_type,
    author: row.author,
    genre: row.genre,
    subtitle: row.subtitle,
    shortLabel: row.short_label,
    coverColor: row.cover_color,
    coverInk: row.cover_ink,
    description: row.description,
    facts: row.facts ?? [],
    tags: row.tags ?? [],
    deposit: row.deposit,
    ratePerDay: row.rate_per_day,
    isCustom: row.is_custom,
    status,
    activeRental,
  };
}

export async function listItems(): Promise<Item[]> {
  const db = supabaseAdmin();
  const todayIso = todayBangkokIso();

  const [itemsRes, rentalsRes] = await Promise.all([
    db.from("items").select("*").is("deleted_at", null).order("created_at"),
    db
      .from("rentals")
      .select("id, item_id, due_on, rented_on, member:members(name, unit)")
      .is("returned_on", null),
  ]);
  if (itemsRes.error) throw itemsRes.error;
  if (rentalsRes.error) throw rentalsRes.error;

  const rentalByItem = new Map<string, OpenRentalRow>();
  for (const r of (rentalsRes.data ?? []) as unknown as OpenRentalRow[]) {
    rentalByItem.set(r.item_id, r);
  }

  return ((itemsRes.data ?? []) as ItemRow[]).map((row) =>
    mapItem(row, rentalByItem.get(row.id), todayIso),
  );
}

export async function getItem(id: string): Promise<Item | null> {
  const items = await listItems();
  return items.find((i) => i.id === id) ?? null;
}

export async function setItemCondition(id: string, condition: "shelf" | "repair") {
  const db = supabaseAdmin();
  const { error } = await db.from("items").update({ condition }).eq("id", id);
  if (error) throw error;
}

export async function setItemPrice(id: string, deposit: number, ratePerDay: number) {
  const db = supabaseAdmin();
  const { error } = await db.from("items").update({ deposit, rate_per_day: ratePerDay }).eq("id", id);
  if (error) throw error;
}

export async function softDeleteItem(id: string) {
  const db = supabaseAdmin();
  const { error } = await db.from("items").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
}

export interface NewItemInput {
  title: string;
  itemType: "หนังสือ" | "บอร์ดเกม";
  subtitle: string;
  coverColor: string;
  deposit: number;
  ratePerDay: number;
}

function slugify(title: string) {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "item"
  );
}

export async function createCustomItem(input: NewItemInput): Promise<string> {
  const db = supabaseAdmin();
  const base = slugify(input.title);
  let id = base;
  for (let n = 2; ; n++) {
    const { data } = await db.from("items").select("id").eq("id", id).maybeSingle();
    if (!data) break;
    id = `${base}-${n}`;
  }
  const { error } = await db.from("items").insert({
    id,
    title: input.title,
    item_type: input.itemType,
    subtitle: input.subtitle,
    short_label: input.subtitle,
    cover_color: input.coverColor,
    cover_ink: "#2A241E",
    description: "เพิ่มเข้าคลังใหม่โดยผู้ดูแลตึก รับและคืนที่ล็อบบี้ตึก B ในช่วงส่งมอบปกติ",
    facts: [
      { k: "ประเภท", v: input.itemType },
      { k: "รายละเอียด", v: input.subtitle },
      { k: "สถานะ", v: "เพิ่มใหม่" },
    ],
    tags: ["new"],
    deposit: input.deposit,
    rate_per_day: input.ratePerDay,
    is_custom: true,
  });
  if (error) throw error;
  return id;
}
