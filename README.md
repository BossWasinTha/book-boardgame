# Books & Boardgame

แอปเช่าหนังสือและบอร์ดเกม (ภาษาไทย) — mobile app + admin dashboard ในไฟล์เดียว

## ไฟล์

- `index.html` — ไฟล์ต้นฉบับ (ใช้ `support.js`) ← ไฟล์ที่ Vercel จะเสิร์ฟ
- `support.js` — runtime
- `offline.html` — เวอร์ชันไฟล์เดียวจบ ใช้ได้แบบ offline
- `vercel.json` — ตั้งค่า static hosting

## Deploy บน Vercel (ฟรี)

1. สร้าง repo ใหม่ใน GitHub (ตั้งเป็น **Private**) แล้วอัปโหลดไฟล์ในโฟลเดอร์นี้
2. เข้า https://vercel.com → เข้าสู่ระบบด้วย GitHub → **Add New → Project**
3. เลือก repo นี้ แล้วตั้งค่า:
   - Framework Preset: **Other**
   - Root Directory: `./` (หรือ `deploy` ถ้า push ทั้งโปรเจกต์)
   - Build Command / Output Directory: เว้นว่างทั้งคู่
4. กด **Deploy** → ได้ URL `https://<ชื่อโปรเจกต์>.vercel.app`

## Admin

กดปุ่ม admin แล้วใส่ PIN (ผิด 3 ครั้ง ล็อก 5 นาที)
