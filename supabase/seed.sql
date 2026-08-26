-- Books & Boardgame — seed data
-- Run after schema.sql. Ported from the CATALOG in
-- design_handoff_books_boardgame/source/Books & Boardgame.dc.html.

insert into items
  (id, title, item_type, author, genre, subtitle, short_label, cover_color, cover_ink, description, facts, tags, deposit, rate_per_day)
values
  ('codenames', 'Codenames', 'บอร์ดเกม', null, null, '2–8 คน · 15–30 นาที', '2–8 คน', '#D9C4A9', '#3A2E22',
    'สองทีมแข่งกันหาสายลับของตัวเองจากคำใบ้เพียงคำเดียว สนุก เสียงดัง และสอนกันได้ในสองนาที เหมาะมากเวลามีคนที่ไม่เคยเล่นบอร์ดเกมมาก่อน',
    '[{"k":"ผู้เล่น","v":"2–8 คน"},{"k":"เวลา","v":"15–30 นาที"},{"k":"อายุ","v":"10 ปีขึ้นไป"},{"k":"ความยาก","v":"ง่าย"}]',
    '{popular,under30,two,new}', 750, 20),

  ('azul', 'Azul', 'บอร์ดเกม', null, null, '2–4 คน · 30–45 นาที', '2–4 คน', '#B9C7C9', '#22312F',
    'เลือกกระเบื้องสีสวยมาตกแต่งผนังวัง เงียบ ๆ จับต้องสนุก และหน้าตาน่ามอง เหมาะกับเย็นที่อยากเล่นช้า ๆ พร้อมกาแฟสักแก้ว',
    '[{"k":"ผู้เล่น","v":"2–4 คน"},{"k":"เวลา","v":"30–45 นาที"},{"k":"อายุ","v":"8 ปีขึ้นไป"},{"k":"ความยาก","v":"ง่าย"}]',
    '{popular,two}', 1350, 30),

  ('ticket', 'Ticket to Ride', 'บอร์ดเกม', null, null, '2–5 คน · 45–60 นาที', '2–5 คน', '#C9A88C', '#33231A',
    'วางเส้นทางรถไฟเชื่อมเมืองต่าง ๆ ให้สำเร็จก่อนที่คู่แข่งจะยึดรางที่คุณต้องการ เกมคลาสสิกที่เล่นกันได้ทั้งครอบครัว',
    '[{"k":"ผู้เล่น","v":"2–5 คน"},{"k":"เวลา","v":"45–60 นาที"},{"k":"อายุ","v":"8 ปีขึ้นไป"},{"k":"ความยาก","v":"ง่าย"}]',
    '{popular}', 1600, 35),

  ('carcassonne', 'Carcassonne', 'บอร์ดเกม', null, null, '2–5 คน · 30–45 นาที', '2–5 คน', '#CBBE9B', '#332C1B',
    'ต่อแผ่นกระเบื้องเป็นถนน เมือง และอาราม แล้ววางลูกน้องลงไปเก็บแต้ม เล่นสบาย ๆ และไม่ซ้ำกันสักรอบ',
    '[{"k":"ผู้เล่น","v":"2–5 คน"},{"k":"เวลา","v":"30–45 นาที"},{"k":"อายุ","v":"7 ปีขึ้นไป"},{"k":"ความยาก","v":"ง่าย"}]',
    '{two}', 1200, 30),

  ('dixit', 'Dixit', 'บอร์ดเกม', null, null, '3–6 คน · 30 นาที', '3–6 คน', '#C7B3C4', '#2E2432',
    'บรรยายภาพวาดเหนือจริงด้วยคำเดียว เสียงฮัม หรือความทรงจำ ให้คลุมเครือพอที่จะมีแค่บางคนเดาถูก เล่นด้วยกันได้ทุกวัย',
    '[{"k":"ผู้เล่น","v":"3–6 คน"},{"k":"เวลา","v":"30 นาที"},{"k":"อายุ","v":"8 ปีขึ้นไป"},{"k":"ความยาก","v":"ง่าย"}]',
    '{new}', 1100, 25),

  ('sushigo', 'Sushi Go!', 'บอร์ดเกม', null, null, '2–5 คน · 15 นาที', '2–5 คน', '#E0BBA6', '#3A2219',
    'ส่งไพ่วนรอบโต๊ะแล้วคว้าชุดอาหารที่คุ้มที่สุดก่อนที่มันจะหายไป สิบห้านาทีจบ พกง่าย และเล่นซ้ำได้ไม่เบื่อ',
    '[{"k":"ผู้เล่น","v":"2–5 คน"},{"k":"เวลา","v":"15 นาที"},{"k":"อายุ","v":"8 ปีขึ้นไป"},{"k":"ความยาก","v":"ง่าย"}]',
    '{under30,two,popular}', 450, 15),

  ('midnight', 'The Midnight Library', 'หนังสือ', 'Matt Haig', 'นิยาย', 'Matt Haig · นิยาย', 'Matt Haig', '#A9B8C4', '#1F2B34',
    'ระหว่างความเป็นและความตายมีห้องสมุดแห่งหนึ่ง ทุกเล่มคือชีวิตที่คุณอาจได้ใช้ อ่านง่าย อบอุ่น และเป็นเล่มที่คนในตึกส่งต่อกันไม่หยุด',
    '[{"k":"ผู้เขียน","v":"Matt Haig"},{"k":"หมวด","v":"นิยาย"},{"k":"ภาษา","v":"อังกฤษ"},{"k":"ความยาว","v":"304 หน้า"}]',
    '{popular,easy,new}', 420, 10),

  ('atomic', 'Atomic Habits', 'หนังสือ', 'James Clear', 'สารคดี', 'James Clear · สารคดี', 'James Clear', '#C6C2A9', '#2C2C1E',
    'การเปลี่ยนเล็ก ๆ ที่ทำซ้ำทุกวันจะทบต้นเป็นผลลัพธ์ที่ใหญ่มาก อ่านเป็นตอน ๆ ได้ เพื่อนบ้านส่วนใหญ่จบได้ในหนึ่งสุดสัปดาห์',
    '[{"k":"ผู้เขียน","v":"James Clear"},{"k":"หมวด","v":"สารคดี"},{"k":"ภาษา","v":"อังกฤษ"},{"k":"ความยาว","v":"320 หน้า"}]',
    '{popular}', 520, 10),

  ('alchemist', 'The Alchemist', 'หนังสือ', 'Paulo Coelho', 'นิยาย', 'Paulo Coelho · นิยาย', 'Paulo Coelho', '#DCC49B', '#3A2C18',
    'เด็กเลี้ยงแกะออกเดินทางจากอันดาลูเซียไปถึงพีระมิดเพื่อตามหาสมบัติ บทสั้น อารมณ์ใหญ่ อ่านจบได้ในคืนเดียว',
    '[{"k":"ผู้เขียน","v":"Paulo Coelho"},{"k":"หมวด","v":"นิยาย"},{"k":"ภาษา","v":"อังกฤษ"},{"k":"ความยาว","v":"208 หน้า"}]',
    '{easy,under30}', 320, 8),

  ('norwegian', 'Norwegian Wood', 'หนังสือ', 'Haruki Murakami', 'นิยาย', 'Haruki Murakami · นิยาย', 'Haruki Murakami', '#B0B9A5', '#232B1F',
    'เรื่องราวเงียบเศร้าของรักครั้งแรกและการสูญเสียในโตเกียวยุค 1960 ค่อย ๆ ไปในแบบที่ดี เหมาะกับช่วงหน้าฝนหลาย ๆ คืน',
    '[{"k":"ผู้เขียน","v":"Haruki Murakami"},{"k":"หมวด","v":"นิยาย"},{"k":"ภาษา","v":"อังกฤษ"},{"k":"ความยาว","v":"296 หน้า"}]',
    '{}', 380, 8),

  ('hailmary', 'Project Hail Mary', 'หนังสือ', 'Andy Weir', 'ไซไฟ', 'Andy Weir · ไซไฟ', 'Andy Weir', '#B7AEC7', '#262135',
    'ชายคนหนึ่งตื่นขึ้นมาบนยานอวกาศตัวคนเดียว ไร้ความทรงจำ และมีดาวทั้งดวงให้ช่วย ตลก สนุก และวางไม่ลง',
    '[{"k":"ผู้เขียน","v":"Andy Weir"},{"k":"หมวด","v":"ไซไฟ"},{"k":"ภาษา","v":"อังกฤษ"},{"k":"ความยาว","v":"496 หน้า"}]',
    '{popular,new}', 560, 12);

-- Demo members + a handful of open/overdue/past rentals so the app
-- doesn't look empty on first run. Safe to delete once you have real data:
--   delete from rentals where member_id in (select id from members where phone like '08%demo%');
--   delete from members where phone like '08%demo%';
-- Reserved member row the admin dashboard's "Mark rented" (walk-in,
-- no member account) toggle attaches its rental to. Keep this id in
-- sync with WALK_IN_MEMBER_ID in src/lib/types.ts.
insert into members (id, name, phone, unit) values
  ('00000000-0000-0000-0000-000000000000', 'หน้าเคาน์เตอร์ (walk-in)', '—', null);

insert into members (id, name, phone, unit, signup_ip) values
  ('00000000-0000-0000-0000-000000000001', 'ปรียา รามัน', '081-234-5678-demo', 'ตึก B · 12-04', '203.0.113.10'),
  ('00000000-0000-0000-0000-000000000002', 'แดเนียล อ๋อง', '089-922-4410-demo', 'ตึก B · 04-11', '203.0.113.11');

insert into rentals (item_id, member_id, rented_on, due_on, returned_on, pickup_slot, return_slot, deposit_thb, rent_thb, total_thb, payment_state) values
  ('azul',       '00000000-0000-0000-0000-000000000001', current_date - 5,  current_date + 2,  null,              'เย็น', 'เย็น', 1350, 210, 1560, 'confirmed'),
  ('norwegian',  '00000000-0000-0000-0000-000000000001', current_date - 2,  current_date + 6,  null,              'เย็น', 'เย็น', 380,  64,  444,  'confirmed'),
  ('dixit',      '00000000-0000-0000-0000-000000000001', current_date - 12, current_date - 6,  null,              'เย็น', 'เย็น', 1100, 150, 1250, 'confirmed'),
  ('ticket',     '00000000-0000-0000-0000-000000000002', current_date - 3,  current_date + 3,  null,              'เช้า', 'เช้า', 1600, 105, 1705, 'confirmed'),
  ('atomic',     '00000000-0000-0000-0000-000000000002', current_date - 4,  current_date + 5,  null,              'เช้า', 'เช้า', 520,  90,  610,  'confirmed'),
  ('sushigo',    '00000000-0000-0000-0000-000000000001', current_date - 46, current_date - 43, current_date - 43, 'เย็น', 'เย็น', 450,  45,  495,  'confirmed'),
  ('alchemist',  '00000000-0000-0000-0000-000000000001', current_date - 96, current_date - 93, current_date - 93, 'เย็น', 'เย็น', 320,  24,  344,  'confirmed');
