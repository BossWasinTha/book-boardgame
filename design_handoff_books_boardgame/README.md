# Handoff: Books & Boardgame — เช่าหนังสือและบอร์ดเกม (real database migration)

## Overview
แอปเช่าหนังสือและบอร์ดเกมในคอนโด/อพาร์ตเมนต์ ภาษาไทย ประกอบด้วย 2 ส่วนในไฟล์เดียว:

1. **Mobile app (ฝั่งลูกค้า)** — เลือกของ, ดูราคา/มัดจำ, จองรอบรับ–คืน, ชำระเงินด้วย PromptPay QR, เพิ่มเพื่อน LINE OA เพื่อส่งสลิป, ดูรายการที่ยืมอยู่, โปรไฟล์
2. **Admin dashboard (ฝั่งผู้ดูแล)** — PIN gate, KPI, ของที่ใกล้ครบกำหนด, คิวส่งมอบคืนนี้, Inventory (แก้ราคา/มัดจำ, เพิ่ม, ลบ), Rentals (mark returned), Users (สมาชิก + IP + ลบสมาชิก)

**เป้าหมายของงานส่งต่อนี้:** ย้ายจาก `localStorage` ไปเป็นฐานข้อมูลจริง (แนะนำ Supabase/Postgres) เพื่อให้ข้อมูลซิงก์ข้ามเครื่อง ระหว่างลูกค้าหลายคนและผู้ดูแล

## About the Design Files
ไฟล์ในชุดนี้เป็น **design reference ที่เขียนด้วย HTML** — เป็น prototype ที่แสดงหน้าตาและพฤติกรรมที่ต้องการ ไม่ใช่ production code ที่ก็อปไปใช้ตรงๆ

งานที่ต้องทำคือ **สร้าง UI เหล่านี้ขึ้นใหม่ในโค้ดเบสจริง** (Next.js บน Vercel เป็นตัวเลือกที่ตรงกับ hosting ปัจจุบันที่สุด) โดยใช้ pattern และ library ของโปรเจกต์นั้น พร้อมต่อฐานข้อมูลจริงแทน localStorage

ตอนนี้ยัง deploy อยู่ที่ Vercel (repo: `BossWasinTha/book-boardgame`) เป็น static HTML ไฟล์เดียว

## Fidelity
**High-fidelity (hifi)** — สี ตัวอักษร ระยะห่าง และ interaction เป็นค่าสุดท้ายแล้ว ให้สร้าง UI ให้ตรงตาม prototype (ดูค่าจริงทั้งหมดใน Design Tokens ด้านล่าง และใน `index.html` ที่แนบมา)

---

# ⚠️ งานหลัก: Database migration

## สถานะปัจจุบัน (สิ่งที่ต้องแทนที่)
ทุกอย่างอยู่ใน `localStorage` คีย์เดียว: `bb_db` (JSON) แชร์กันระหว่าง mobile app และ admin dashboard ผ่าน polling 1.2 วินาที + `storage` event

โครงสร้าง object ปัจจุบัน:

```js
{
  seeded: true,                    // flag ว่า seed ข้อมูลตัวอย่างแล้ว
  members: [                       // สมาชิกที่สมัครในแอป
    { name, phone, photo, joined, ip }
  ],
  items: {                         // override สถานะสินค้า (key = item id)
    azul: { status, renter, unit, rented, due, days, dueISO }
  },
  prices: {                        // override ราคา (key = item id)
    azul: [deposit, ratePerDay]
  },
  custom: [ { id, title, sub, type, cover, status, renter, due } ],  // สินค้าที่แอดมินเพิ่ม
  removed: ['itemId', ...]         // สินค้าที่แอดมินลบ
}
```

ฟังก์ชันที่แตะ storage (ต้องเปลี่ยนเป็น API call ทั้งหมด):
- `readDB()` / `writeDB(patch)` — อยู่ทั้งใน mobile และ admin, patch แบบ shallow merge (`prices` และ `items` merge ลึกลง 1 ชั้น)
- `localStorage.getItem('bb_ip')` — IP ที่ resolve ได้ ใช้จำผู้ใช้เดิม
- `localStorage.getItem('bb_out')` — flag ว่า user กด logout ไม่ให้ auto-login ซ้ำ

## Schema ที่แนะนำ (Postgres / Supabase)

```sql
-- สมาชิก
create table members (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  phone         text not null,
  photo_url     text,                        -- ปัจจุบันเป็น data URI base64; ย้ายไป object storage
  signup_ip     inet,
  created_at    timestamptz not null default now(),
  deleted_at    timestamptz                  -- soft delete (ปุ่ม ✕ ในหน้า Users)
);
create index on members (signup_ip) where deleted_at is null;

-- สินค้า (หนังสือ + บอร์ดเกม)
create table items (
  id            text primary key,            -- slug เช่น 'azul', 'codenames'
  title         text not null,
  item_type     text not null check (item_type in ('หนังสือ','บอร์ดเกม')),
  subtitle      text,                        -- หมวดหมู่/ผู้เขียน
  meta          text,                        -- '2–8 คน · 15–30 นาที'
  cover_color   text not null,               -- hex ของ cover placeholder
  cover_ink     text not null,               -- hex ตัวอักษรบน cover
  description   text,
  tags          text[] default '{}',         -- 'popular','under30','two','easy','new','fiction'...
  deposit       integer not null,            -- บาท (= ราคาสินค้า)
  rate_per_day  integer not null,            -- บาท/วัน
  status        text not null default 'shelf'  -- 'shelf' | 'out' | 'overdue' | 'repair'
    check (status in ('shelf','out','overdue','repair')),
  is_custom     boolean not null default false, -- แอดมินเพิ่มเอง
  deleted_at    timestamptz,
  created_at    timestamptz not null default now()
);

-- การยืม
create table rentals (
  id            uuid primary key default gen_random_uuid(),
  item_id       text not null references items(id),
  member_id     uuid not null references members(id),
  rented_on     date not null default current_date,
  due_on        date not null,
  returned_on   date,
  pickup_slot   text not null check (pickup_slot in ('เช้า','เย็น')),  -- 07:00–08:00 / 19:00–20:00
  return_slot   text not null check (return_slot in ('เช้า','เย็น')),
  deposit_thb   integer not null,            -- snapshot ตอนยืม
  rent_thb      integer not null,            -- rate × จำนวนวัน
  total_thb     integer not null,            -- deposit + rent
  payment_state text not null default 'awaiting_slip'
    check (payment_state in ('awaiting_slip','confirmed','refunded')),
  created_at    timestamptz not null default now()
);
create index on rentals (item_id) where returned_on is null;
create index on rentals (member_id);
```

**หมายเหตุสำคัญ:**
- `items.status` เป็น derived field ได้ (มี rental ที่ `returned_on is null` = out; เกิน `due_on` = overdue) จะเก็บซ้ำเพื่อความเร็วก็ได้ แต่ต้อง sync ให้ตรง
- ราคาปัจจุบันเก็บใน `PRICE` (hardcode) + `db.prices` (override) → รวมเป็น 2 คอลัมน์ในตาราง `items`
- `photo` ปัจจุบันเป็น base64 data URI เก็บใน localStorage — **ต้องย้ายไป object storage** (Supabase Storage) เก็บแค่ URL ไม่งั้น payload บวมเร็วมาก

## Endpoints ที่แอปต้องใช้

| Action ในแอป | ปัจจุบัน | ที่ต้องมี |
|---|---|---|
| โหลด catalog + สถานะ | `readDB()` + `CATALOG` hardcode | `GET /api/items` |
| สมัคร / แก้โปรไฟล์ | `writeDB({members})` | `POST /api/members`, `PATCH /api/members/:id` |
| จำผู้ใช้เดิมจาก IP | filter `members` ด้วย `bb_ip` | `GET /api/members/me` (อ่าน IP จาก request header ฝั่ง server — แม่นกว่าเดิม) |
| ยืนยันการยืม | `writeDB({items})` + state | `POST /api/rentals` |
| คืนของ (ฝั่งลูกค้า) | `writeDB({items})` | `POST /api/rentals/:id/return-request` |
| Mark returned (แอดมิน) | `patchItem()` | `POST /api/rentals/:id/return` |
| แก้ราคา/มัดจำ | `writeDB({prices})` | `PATCH /api/items/:id` |
| เพิ่มสินค้า | `writeDB({custom})` | `POST /api/items` |
| ลบสินค้า | `writeDB({removed})` | `DELETE /api/items/:id` (soft delete) |
| ลบสมาชิก | `writeDB({members})` | `DELETE /api/members/:id` (soft delete) |
| ซิงก์สดข้ามเครื่อง | polling 1.2s + storage event | Supabase Realtime subscription (แทน polling ได้ทั้งหมด) |

## Auth — ต้องเปลี่ยนแนวคิด
ปัจจุบันไม่มี auth จริง: จำผู้ใช้จาก **IP address** (fetch จาก `api.ipify.org`, fallback เป็น IP วงในสุ่มเมื่อออฟไลน์) และเก็บใน `localStorage`

**ปัญหา:** IP เปลี่ยนได้ตลอด (มือถือสลับ WiFi/4G), และคนละคนใน WiFi เดียวกันได้ IP เดียวกัน → สวมสิทธิ์กันได้

**แนะนำ:** OTP ทาง SMS หรือ LINE Login (เข้ากับ LINE OA `@147itqlv` ที่ใช้อยู่แล้ว) — เก็บ `signup_ip` ไว้เป็นข้อมูลเสริมสำหรับแอดมินได้ แต่ไม่ใช้เป็น identity

## PIN gate ของแอดมิน
ปัจจุบัน: PIN 6 หลัก hardcode ในไฟล์ client, ผิด 3 ครั้ง ล็อก 5 นาที (เก็บ timestamp ใน state)

**ต้องเปลี่ยน:** PIN อยู่ใน client = ใครก็เปิด devtools อ่านได้ → ย้ายไปตรวจฝั่ง server, rate-limit ที่ระดับ IP/session, และเก็บ lockout state ใน DB ไม่ใช่ memory

---

# UI Reference

## Screens (ฝั่งลูกค้า — mobile, 414×896)

1. **Home** (`screen: 'home'`) — header (โลโก้ + ปุ่มสมัครสมาชิก/รูปโปรไฟล์ขวาบน), hero headline, search bar, แถวการ์ด "ว่างสำหรับคืนนี้", "เล่นกัน 2 คน", กล่องจุดรับของ · ป็อปอัปแนะนำราคา + ฟอร์มสมัคร แสดง **ทุกครั้งที่เข้าเว็บ**
2. **Explore** (`explore`) — grid 2 คอลัมน์, chip หมวดหมู่ (ทั้งหมด/หนังสือ/บอร์ดเกม), sheet ตัวกรอง, badge ราคา/วัน มุมขวาบนของการ์ด
3. **Search** (`search`) — input + ผลลัพธ์แบบ list
4. **Detail** (`detail`) — cover 280px, ชื่อ, สถานะ pill, ราคา/มัดจำ, เรื่องย่อ, bottom bar "ยืมเล่มนี้"
5. **Checkout** (`checkout`) — เลือกวัน/รอบรับ, วัน/รอบคืน (เช้า 07:00–08:00 · เย็น 19:00–20:00), สรุปมัดจำ + ค่าเช่า + ยอดรวม → **ต้องเป็นสมาชิกก่อนกดยืนยัน** (ถ้าไม่ใช่ เปิดฟอร์มสมัครพร้อมข้อความเตือน แล้วพากลับมาที่หน้านี้)
6. **Payment** (`payment`) — breakdown มัดจำ/ค่าเช่า/ยอดรวม
7. **QR** (`qr`) — ขั้นที่ 1 PromptPay QR (ดาวน์โหลดได้) · ขั้นที่ 2 เพิ่มเพื่อน LINE OA `@147itqlv` (ลิงก์ `https://line.me/R/ti/p/~@147itqlv`) แล้วส่งสลิป
8. **Success** (`success`) — สรุปการจอง
9. **My Rentals** (`rentals`) — tab กำลังยืม/ที่ผ่านมา, badge ครบกำหนด/เลยกำหนด, sheet ยืนยันคืน
10. **Profile** (`profile`) — รูป+ชื่อ, สถิติ 2 ช่อง, แถวเบอร์โทร/วันสมัคร, ปุ่มประวัติการยืม · แก้ไขโปรไฟล์ · แดชบอร์ดผู้ดูแล · **ออกจากระบบ**

## Screens (ฝั่งแอดมิน — desktop)
PIN keypad → Dashboard (KPI 5 ช่อง, ใกล้ครบกำหนด 3 วัน, คิวส่งมอบคืนนี้) · Inventory (ตาราง แก้ Deposit/Rate inline, +Add, ✕ ลบ, Mark available/rented) · Rentals (mark returned) · Users (การ์ดสมาชิก แสดงรูป เบอร์โทร IP วันสมัคร + ปุ่ม ✕ ลบ)

## Design Tokens

**Colors**
| Token | Hex | ใช้ที่ |
|---|---|---|
| Canvas | `#FAF6EF` | พื้นหลังแอป |
| Canvas (admin) | `#EDE6DA` | พื้นหลังแดชบอร์ด |
| Surface | `#FFFFFF` | การ์ด |
| Surface alt | `#F2EBDF` | กล่องข้อมูลรอง |
| Surface warm | `#F6F1E6` | หัวตาราง |
| Border | `#E4D9C8` | เส้นขอบหลัก |
| Border light | `#F0E7D9` | เส้นคั่นในการ์ด |
| Border input | `#DCCDB6` | ขอบ input |
| Ink | `#2A241E` | ตัวอักษรหลัก |
| Ink 2 | `#5C4A38` | body |
| Ink 3 | `#7A6B5A` | secondary |
| Ink 4 | `#8A7A66` | caption |
| Ink 5 | `#A8977F` | label / placeholder |
| Accent (terracotta) | `#B85C38` | CTA หลัก, ลิงก์ (hover `#8F4526`) |
| Accent dark | `#2A241E` | ปุ่มรอง |
| Avatar bg | `#DCC9B0` | วงกลมโปรไฟล์ |
| Green (ว่าง/สำเร็จ) | `#3F7D52` | dot สถานะ |
| Amber (ใกล้ครบ) | `#9A6A18` | badge |
| Red (เลยกำหนด/ลบ) | `#B03A2E` | badge, ปุ่มลบ, logout |
| LINE green | `#06C755` | ปุ่ม LINE |

**Typography**
- Display/heading: `'Newsreader', 'Noto Serif Thai', serif` — 19/21/23/25/26/29/30/33px, line-height 1.1–1.35, letter-spacing -.01em
- Body/UI: `'DM Sans', 'Noto Sans Thai', system-ui, sans-serif` — 10.5/11/11.5/12/12.5/13/13.5/14/14.5/15px, line-height 1.5–1.8
- Label uppercase: 11–11.5px, weight 700, letter-spacing .04em

**Radius:** 8 · 11 · 12 · 13 · 14 · 16 · 17 · 18 · 24 · 26 · 999px (pill) · 50% (avatar)

**Spacing:** 2 · 3 · 5 · 6 · 7 · 8 · 10 · 11 · 12 · 14 · 16 · 18 · 20 · 22 · 26px

**Shadows:** `0 1px 2px rgba(60,45,30,.04)` (การ์ด) · `0 26px 50px -18px rgba(40,30,20,.5)` (โมดัล) · `0 30px 70px rgba(42,36,30,0.28)` (โมดัลแอดมิน)

**Animations:** `fade` .2–.3s ease (opacity) · `up` .28s cubic-bezier(.2,.8,.2,1) (translateY 100%→0, bottom sheet) · `pop` .3s ease (opacity + translateY 8px + scale .98, โมดัล)

**Component sizes:** hit target ปุ่มหลัก 52px · ปุ่มรอง 48–50px · input 46px · avatar header 34px / profile 64px / signup 58px · bottom nav ~78px

## Assets
- `assets/promptpay-qr.jpg` (885×1200 JPEG) — QR PromptPay ของร้าน · ใน `index.html` ฝังเป็น base64 data URI
- ไม่มีรูปสินค้า — cover ทุกชิ้นเป็นบล็อกสีพร้อมชื่อทับ (ค่าสีอยู่ใน `CATALOG`) · **ถ้ามีรูปจริงควรใส่ตอน migrate**
- ฟอนต์โหลดจาก Google Fonts: Newsreader, DM Sans, Noto Serif Thai, Noto Sans Thai

## Files ในชุดนี้
- `index.html` — แอปทั้งหมด (ลูกค้า + แอดมิน) พร้อม QR ฝังในไฟล์ · **นี่คือ design reference หลัก**
- `source/Books & Boardgame.dc.html` — ต้นฉบับฝั่งลูกค้า (อ่านง่ายกว่า แยกส่วน template/logic ชัด)
- `source/AdminDashboard.dc.html` — ต้นฉบับแดชบอร์ดแอดมิน
- `assets/promptpay-qr.jpg` — รูป QR ต้นฉบับ

## Repo ปัจจุบัน
```
repo:   BossWasinTha/book-boardgame  (private)
branch: main
host:   Vercel — static, Framework Preset "Other", no build step
```

## ลำดับงานที่แนะนำ
1. ตั้ง Supabase project + รัน schema ข้างบน + seed จาก `CATALOG` และ `PRICE` ใน `index.html`
2. สร้าง Next.js app บน Vercel (repo เดิมได้) แล้ว port UI ทีละหน้าตาม token ข้างบน
3. เปลี่ยน `readDB/writeDB` ทั้งหมดเป็น API call + Supabase Realtime แทน polling
4. เปลี่ยน auth จาก IP → OTP หรือ LINE Login
5. ย้าย PIN gate ไปตรวจฝั่ง server
6. ย้ายรูปโปรไฟล์จาก base64 → Supabase Storage
