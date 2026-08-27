export type ItemType = "หนังสือ" | "บอร์ดเกม";
export type ItemStatus = "shelf" | "out" | "overdue" | "repair";
export type Slot = "เช้า" | "เย็น";
export type PaymentState = "awaiting_slip" | "confirmed" | "refunded";

export interface Fact {
  k: string;
  v: string;
}

export interface ActiveRental {
  id: string;
  dueOn: string; // ISO date
  rentedOn: string; // ISO date
  renterName: string;
  renterUnit: string | null;
}

export interface Item {
  id: string;
  title: string;
  itemType: ItemType;
  author: string | null;
  genre: string | null;
  subtitle: string;
  shortLabel: string;
  coverColor: string;
  coverInk: string;
  description: string;
  facts: Fact[];
  tags: string[];
  deposit: number;
  ratePerDay: number;
  isCustom: boolean;
  status: ItemStatus;
  activeRental: ActiveRental | null;
}

export interface Member {
  id: string;
  name: string;
  phone: string;
  unit: string | null;
  photoUrl: string | null;
  signupIp: string | null;
  createdAt: string;
}

export interface RentalHistoryEntry {
  id: string;
  itemId: string;
  rentedOn: string;
  dueOn: string;
  returnedOn: string | null;
  pickupSlot: Slot;
  returnSlot: Slot;
  depositThb: number;
  rentThb: number;
  totalThb: number;
}

export const WALK_IN_MEMBER_ID = "00000000-0000-0000-0000-000000000000";
