# Books & Boardgame

Next.js + Supabase rebuild of the `design_handoff_books_boardgame/` prototype — a book/boardgame
rental app for a condo building. Customer-facing app at `/`, admin dashboard at `/admin`.

## 1. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com).
2. In the SQL editor, run `supabase/schema.sql`, then `supabase/seed.sql`.
3. In **Project Settings → API**, copy the Project URL, `anon` key, and `service_role` key.

## 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in the Supabase values from step 1, plus:
- `SESSION_SECRET` — any long random string (`openssl rand -base64 32`), used to sign the member/admin session cookies.
- `ADMIN_PIN` — the 6-digit PIN for `/admin`.

## 3. Run it

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the customer app, or
[http://localhost:3000/admin](http://localhost:3000/admin) for the admin dashboard (PIN from `.env.local`).

## Notes

- Realtime sync (Supabase `postgres_changes`) keeps the customer app and admin dashboard in sync across
  devices — no polling.
- Member auth is a signed httpOnly session cookie set after a name+phone signup — see the migration
  README in `design_handoff_books_boardgame/README.md` for the full rationale and what's intentionally
  deferred (OTP/LINE Login, etc.) from this first pass.
- Profile photos upload to the Supabase Storage `avatars` bucket (created by `schema.sql`).
