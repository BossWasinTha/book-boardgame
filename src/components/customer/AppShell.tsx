"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Item, Member, RentalHistoryEntry, Slot } from "@/lib/types";
import { supabaseBrowser } from "@/lib/supabase/client";
import { addDays, daysBetween, fmtShort, fromIsoDate, today, toIsoDate } from "@/lib/customer/date";
import { customerVisible, matchesItem } from "@/lib/customer/catalog";
import type { Screen } from "./types";
import { BottomNav } from "./BottomNav";
import { RentBar } from "./RentBar";
import { Toast } from "@/components/ui/Toast";
import { IntroSheet } from "./IntroSheet";
import { FilterSheet } from "./FilterSheet";
import { ReturnSheet } from "./ReturnSheet";
import { Home } from "./screens/Home";
import { Explore } from "./screens/Explore";
import { Search } from "./screens/Search";
import { Detail } from "./screens/Detail";
import { Checkout } from "./screens/Checkout";
import { Payment } from "./screens/Payment";
import { Qr } from "./screens/Qr";
import { Success } from "./screens/Success";
import { Rentals } from "./screens/Rentals";
import { Profile } from "./screens/Profile";

async function fetchItems(): Promise<Item[]> {
  const r = await fetch("/api/items");
  if (!r.ok) return [];
  const d = await r.json();
  return d.items ?? [];
}
async function fetchMine(): Promise<RentalHistoryEntry[]> {
  const r = await fetch("/api/rentals/mine");
  if (!r.ok) return [];
  const d = await r.json();
  return d.rentals ?? [];
}
async function fetchMe(): Promise<Member | null> {
  const r = await fetch("/api/members/me");
  if (!r.ok) return null;
  const d = await r.json();
  return d.member ?? null;
}

export interface SignupFormState {
  name: string;
  phone: string;
  unit: string;
  photoDataUrl: string;
}

const EMPTY_FORM: SignupFormState = { name: "", phone: "", unit: "", photoDataUrl: "" };

export function AppShell({
  initialItems,
  initialMember,
}: {
  initialItems: Item[];
  initialMember: Member | null;
}) {
  const [screen, setScreen] = useState<Screen>("home");
  const [prevScreen, setPrevScreen] = useState<Screen>("home");
  const [items, setItems] = useState<Item[]>(initialItems);
  const [member, setMember] = useState<Member | null>(initialMember);
  const [myRentals, setMyRentals] = useState<RentalHistoryEntry[]>([]);

  const [cat, setCat] = useState<"ทั้งหมด" | "หนังสือ" | "บอร์ดเกม">("ทั้งหมด");
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<string[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);

  const [selId, setSelId] = useState<string | null>(null);
  const [pickupDate, setPickupDate] = useState<Date>(() => today());
  const [pickupSlot, setPickupSlot] = useState<Slot>("เย็น");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [returnSlot, setReturnSlot] = useState<Slot>("เย็น");
  const [bookingSaving, setBookingSaving] = useState(false);

  const [returnRentalId, setReturnRentalId] = useState<string | null>(null);
  const [rentTab, setRentTab] = useState<"กำลังยืม" | "ที่ผ่านมา">("กำลังยืม");

  const [introOpen, setIntroOpen] = useState(true);
  const [signupMode, setSignupMode] = useState(false);
  const [signupForm, setSignupForm] = useState<SignupFormState>(EMPTY_FORM);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [signupSaving, setSignupSaving] = useState(false);
  const [pendingRent, setPendingRent] = useState(false);

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  function toast(msg: string) {
    clearTimeout(toastTimer.current);
    setToastMsg(msg);
    toastTimer.current = setTimeout(() => setToastMsg(null), 2600);
  }

  // Realtime sync — replaces the prototype's 1.2s poll + storage event.
  useEffect(() => {
    const sb = supabaseBrowser();
    const channel = sb
      .channel("customer-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "items" }, () => {
        fetchItems().then(setItems);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "rentals" }, () => {
        fetchItems().then(setItems);
        fetchMine().then(setMyRentals);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "members" }, () => {
        fetchMe().then((m) => {
          setMember(m);
          if (!m) setMyRentals([]);
        });
      })
      .subscribe();
    return () => {
      sb.removeChannel(channel);
    };
  }, []);

  const memberId = member?.id;
  useEffect(() => {
    if (!memberId) return;
    let cancelled = false;
    fetchMine().then((r) => {
      if (!cancelled) setMyRentals(r);
    });
    return () => {
      cancelled = true;
    };
  }, [memberId]);

  const visible = useMemo(() => customerVisible(items), [items]);
  const itemsById = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);
  const selectedItem = selId ? (itemsById.get(selId) ?? null) : null;

  const days = dueDate ? Math.max(1, daysBetween(pickupDate, dueDate)) : 1;
  const deposit = selectedItem?.deposit ?? 0;
  const ratePerDay = selectedItem?.ratePerDay ?? 0;
  const rentFee = ratePerDay * days;
  const total = deposit + rentFee;

  function go(next: Screen) {
    setPrevScreen(screen);
    setScreen(next);
  }
  function back() {
    setScreen(prevScreen === screen ? "home" : prevScreen);
  }
  function openCheckout(itemId: string) {
    setSelId(itemId);
    setDueDate(addDays(today(), 3));
    setPrevScreen(screen);
    setScreen("checkout");
  }
  function pickPickupDate(d: Date) {
    setPickupDate(d);
    setDueDate((cur) => (cur && cur > d ? cur : addDays(d, 3)));
  }

  function requireSignup() {
    setSignupMode(true);
    setIntroOpen(true);
    setPrevScreen(screen);
    setScreen("home");
    setSignupError("สมัครสมาชิกก่อนยืนยันการยืมนะ · ใช้เวลา 10 วินาที");
    setPendingRent(true);
  }
  function openSignup() {
    setSignupForm({
      name: member?.name ?? "",
      phone: member && member.phone !== "—" ? member.phone : "",
      unit: member?.unit ?? "",
      photoDataUrl: member?.photoUrl ?? "",
    });
    setSignupMode(true);
    setIntroOpen(true);
    setPrevScreen(screen);
    setScreen("home");
    setSignupError(null);
  }
  function closeIntro() {
    setIntroOpen(false);
    setSignupMode(false);
    setPendingRent(false);
    setSignupError(null);
  }

  async function submitSignup() {
    const name = signupForm.name.trim();
    const phone = signupForm.phone.trim();
    if (!name || !phone) {
      setSignupError("กรอกชื่อและเบอร์โทรก่อนนะ");
      return;
    }
    setSignupSaving(true);
    try {
      let photoUrl: string | undefined = member?.photoUrl ?? undefined;
      if (signupForm.photoDataUrl && signupForm.photoDataUrl.startsWith("data:")) {
        const up = await fetch("/api/members/photo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dataUrl: signupForm.photoDataUrl }),
        });
        const upJson = await up.json();
        if (!up.ok) {
          setSignupError(upJson.error ?? "อัปโหลดรูปไม่สำเร็จ");
          setSignupSaving(false);
          return;
        }
        photoUrl = upJson.url;
      }
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, unit: signupForm.unit.trim(), photoUrl }),
      });
      const json = await res.json();
      if (!res.ok) {
        setSignupError(json.error ?? "บันทึกไม่สำเร็จ");
        setSignupSaving(false);
        return;
      }
      const wasEditing = Boolean(member);
      const matchedExisting = Boolean(json.matchedExisting);
      setMember(json.member);
      setIntroOpen(false);
      setSignupMode(false);
      setSignupSaving(false);
      if (pendingRent) {
        setPendingRent(false);
        setPrevScreen("detail");
        setScreen("checkout");
        toast(
          matchedExisting
            ? `ยินดีต้อนรับกลับมา ${json.member.name} · ยืนยันการยืมต่อได้เลย`
            : "สมัครสมาชิกเรียบร้อย · ยืนยันการยืมต่อได้เลย",
        );
      } else if (matchedExisting) {
        toast(`พบบัญชีเดิมด้วยเบอร์นี้ · ยินดีต้อนรับกลับมา ${json.member.name}`);
      } else if (wasEditing) {
        setScreen("profile");
        toast("บันทึกโปรไฟล์แล้ว");
      } else {
        toast(`ยินดีต้อนรับ ${name} · สมัครสมาชิกเรียบร้อย!`);
      }
    } catch {
      setSignupError("เกิดข้อผิดพลาด ลองใหม่อีกครั้ง");
      setSignupSaving(false);
    }
  }

  async function logout() {
    await fetch("/api/session/logout", { method: "POST" });
    setMember(null);
    setMyRentals([]);
    setScreen("home");
    setPrevScreen("home");
    setIntroOpen(true);
    setSignupMode(false);
    toast("ออกจากระบบแล้ว · สมัครหรือเข้าใช้ใหม่ได้ทุกเมื่อ");
  }

  async function confirmSlip() {
    if (!selectedItem || !dueDate) return;
    setBookingSaving(true);
    try {
      const res = await fetch("/api/rentals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: selectedItem.id,
          pickupOn: toIsoDate(pickupDate),
          dueOn: toIsoDate(dueDate),
          pickupSlot,
          returnSlot,
        }),
      });
      const json = await res.json();
      setBookingSaving(false);
      if (!res.ok) {
        toast(json.error ?? "จองไม่สำเร็จ ลองใหม่อีกครั้ง");
        fetchItems().then(setItems);
        return;
      }
      fetchItems().then(setItems);
      fetchMine().then(setMyRentals);
      setPrevScreen("qr");
      setScreen("success");
    } catch {
      setBookingSaving(false);
      toast("เกิดข้อผิดพลาด ลองใหม่อีกครั้ง");
    }
  }

  async function confirmReturn() {
    if (!returnRentalId) return;
    const id = returnRentalId;
    const title = itemsById.get(myRentals.find((r) => r.id === id)?.itemId ?? "")?.title ?? "รายการ";
    setReturnRentalId(null);
    await fetch(`/api/rentals/${id}/return`, { method: "POST" });
    fetchMine().then(setMyRentals);
    fetchItems().then(setItems);
    setRentTab("ที่ผ่านมา");
    toast(`คืน ${title} เรียบร้อย ขอบคุณนะ!`);
  }

  function downloadQr() {
    const a = document.createElement("a");
    a.href = "/promptpay-qr.jpg";
    a.download = `promptpay-${selId ?? "rental"}.jpg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    toast("บันทึก QR แล้ว · โอนได้เลย");
  }

  function toggleFilter(id: string) {
    setFilters((f) => (f.includes(id) ? f.filter((x) => x !== id) : f.concat(id)));
  }
  function clearFilters() {
    setFilters([]);
    setCat("ทั้งหมด");
    setQuery("");
  }

  const showNav = screen === "home" || screen === "explore" || screen === "rentals" || screen === "profile";
  const showRentBar = screen === "detail" || screen === "checkout";

  return (
    <div className="relative w-full h-full overflow-hidden bg-canvas">
      <div className="scr absolute inset-0 overflow-y-auto overflow-x-hidden pt-[14px]">
        {screen === "home" && (
          <Home
            items={visible}
            member={member}
            onOpen={(id) => {
              setSelId(id);
              go("detail");
            }}
            onRent={(item) => {
              if (item.status === "shelf") openCheckout(item.id);
              else toast(`เราจะแจ้งเตือนเมื่อ ${item.title} กลับมาบนชั้น`);
            }}
            onGoSearch={() => {
              setQuery("");
              go("search");
            }}
            onGoExplore={(nextCat, nextFilters) => {
              setCat(nextCat);
              setFilters(nextFilters);
              go("explore");
            }}
            onGoProfile={() => go("profile")}
            onOpenSignup={openSignup}
          />
        )}
        {screen === "explore" && (
          <Explore
            items={visible}
            cat={cat}
            query={query}
            filters={filters}
            onCat={setCat}
            onOpenFilters={() => setFilterOpen(true)}
            onOpen={(id) => {
              setSelId(id);
              go("detail");
            }}
            onRent={(item) => {
              if (item.status === "shelf") openCheckout(item.id);
              else toast(`เราจะแจ้งเตือนเมื่อ ${item.title} กลับมาบนชั้น`);
            }}
            onGoSearch={() => {
              setQuery("");
              go("search");
            }}
            onClearFilters={clearFilters}
          />
        )}
        {screen === "search" && (
          <Search
            items={visible}
            cat={cat}
            query={query}
            filters={filters}
            onQuery={setQuery}
            onBack={back}
            onOpen={(id) => {
              setSelId(id);
              go("detail");
            }}
          />
        )}
        {screen === "detail" && selectedItem && (
          <Detail
            item={selectedItem}
            onBack={back}
            onRent={() => openCheckout(selectedItem.id)}
            onNotify={() => toast(`เราจะแจ้งเตือนเมื่อ ${selectedItem.title} กลับมาบนชั้น`)}
          />
        )}
        {screen === "checkout" && selectedItem && (
          <Checkout
            item={selectedItem}
            pickupDate={pickupDate}
            pickupSlot={pickupSlot}
            dueDate={dueDate}
            returnSlot={returnSlot}
            days={days}
            deposit={deposit}
            ratePerDay={ratePerDay}
            rentFee={rentFee}
            total={total}
            member={member}
            onBack={back}
            onPickPickup={pickPickupDate}
            onPickupSlot={setPickupSlot}
            onPickDue={setDueDate}
            onReturnSlot={setReturnSlot}
            onGoProfile={() => go("profile")}
          />
        )}
        {screen === "payment" && selectedItem && (
          <Payment
            item={selectedItem}
            dueDate={dueDate}
            days={days}
            deposit={deposit}
            ratePerDay={ratePerDay}
            rentFee={rentFee}
            total={total}
            onBack={back}
            onConfirm={() => go("qr")}
          />
        )}
        {screen === "qr" && (
          <Qr total={total} onBack={back} onDownload={downloadQr} onConfirmSlip={confirmSlip} saving={bookingSaving} />
        )}
        {screen === "success" && selectedItem && (
          <Success
            item={selectedItem}
            pickupDate={pickupDate}
            pickupSlot={pickupSlot}
            dueDate={dueDate}
            returnSlot={returnSlot}
            deposit={deposit}
            rentFee={rentFee}
            total={total}
            onGoRentals={() => {
              setRentTab("กำลังยืม");
              go("rentals");
            }}
            onGoHome={() => go("home")}
          />
        )}
        {screen === "rentals" && (
          <Rentals
            rentals={myRentals}
            itemsById={itemsById}
            tab={rentTab}
            onTab={setRentTab}
            onOpen={(id) => {
              setSelId(id);
              go("detail");
            }}
            onStartReturn={setReturnRentalId}
            onGoHome={() => go("home")}
          />
        )}
        {screen === "profile" && (
          <Profile
            member={member}
            currentCount={myRentals.filter((r) => !r.returnedOn).length}
            pastCount={myRentals.filter((r) => r.returnedOn).length}
            onGoRentals={() => {
              setRentTab("กำลังยืม");
              go("rentals");
            }}
            onEditProfile={openSignup}
            onLogout={logout}
          />
        )}
      </div>

      {showRentBar && screen === "detail" && selectedItem && (
        <RentBarForDetail item={selectedItem} onRent={() => openCheckout(selectedItem.id)} onNotify={() => toast(`เราจะแจ้งเตือนเมื่อ ${selectedItem.title} กลับมาบนชั้น`)} />
      )}
      {showRentBar && screen === "checkout" && selectedItem && (
        <RentBarForCheckout
          dueDate={dueDate}
          returnSlot={returnSlot}
          onConfirm={() => {
            if (!dueDate) return toast("เลือกวันคืนก่อนนะ");
            if (!member) return requireSignup();
            setPrevScreen("checkout");
            setScreen("payment");
          }}
        />
      )}

      {showNav && <BottomNav screen={screen} onNavigate={go} />}

      <FilterSheet
        open={filterOpen}
        filters={filters}
        resultCount={visible.filter((i) => matchesItem(i, { cat, query, filters })).length}
        onToggle={toggleFilter}
        onClear={clearFilters}
        onClose={() => setFilterOpen(false)}
      />
      <ReturnSheet
        rental={returnRentalId ? myRentals.find((r) => r.id === returnRentalId) : undefined}
        item={returnRentalId ? itemsById.get(myRentals.find((r) => r.id === returnRentalId)?.itemId ?? "") : undefined}
        onClose={() => setReturnRentalId(null)}
        onConfirm={confirmReturn}
      />
      <IntroSheet
        open={introOpen && screen === "home"}
        member={member}
        signupMode={signupMode || !member}
        form={signupForm}
        error={signupError}
        saving={signupSaving}
        onChange={setSignupForm}
        onSubmit={submitSignup}
        onClose={closeIntro}
        onStartOver={openSignup}
      />

      <Toast message={toastMsg} />
    </div>
  );
}

function RentBarForDetail({ item, onRent, onNotify }: { item: Item; onRent: () => void; onNotify: () => void }) {
  const av = item.status === "shelf";
  return (
    <RentBar
      caption={av ? "ช่วงส่งมอบ" : "กลับมา"}
      value={av ? "07:00 / 19:00 น." : item.activeRental ? fmtShort(fromIsoDate(item.activeRental.dueOn)) : "เร็ว ๆ นี้"}
      label={av ? "ยืมเล่มนี้" : "แจ้งเตือนฉัน"}
      bg={av ? "var(--color-accent)" : "#2A241E"}
      onAction={av ? onRent : onNotify}
    />
  );
}

function RentBarForCheckout({
  dueDate,
  returnSlot,
  onConfirm,
}: {
  dueDate: Date | null;
  returnSlot: Slot;
  onConfirm: () => void;
}) {
  return (
    <RentBar
      caption="คืนภายใน"
      value={dueDate ? `${fmtShort(dueDate)} · ${returnSlot === "เช้า" ? "07:00–08:00 น." : "19:00–20:00 น."}` : "—"}
      label="ยืนยันการยืม"
      bg={dueDate ? "var(--color-accent)" : "#C6B7A3"}
      onAction={onConfirm}
    />
  );
}
