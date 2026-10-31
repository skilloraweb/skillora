# SkillOra – Secure Setup (do these in order)

## 0. Rotate the leaked key – do this FIRST
The old `data/config.local.js` contained a Supabase **secret** key and was loaded by the browser pages.
Treat it as compromised: Supabase Dashboard -> Project Settings -> API Keys -> create a new secret key and
delete/disable the old one. The new site never needs a secret key. (Never paste it in chat, HTML or JS.)

## 1. Back up, then apply the database
1. Dashboard -> Database -> Backups (take a backup).
2. SQL Editor -> run `db/01_secure_schema.sql`.
3. Authentication -> Providers -> Email: keep **Confirm email ON**. Set minimum password length 8+.
   Authentication -> URL Configuration: set Site URL to your real domain.
4. Create your admin (Authentication -> Users -> Add user), then run `db/02_create_admin.sql`.
5. Review and run `db/03_cleanup_demo_data.sql` (preview first; deletes are commented out).

## 2. Deploy
Static hosting is fine (Netlify / Vercel / Cloudflare Pages / GitHub Pages). Only upload the site files.
Do NOT upload `db/`, `*.py`, or any `.env`.

## 2b. Fill in your real contact numbers
Edit `data/config.js` -> `SUPPORT_PHONE`, `SUPPORT_WHATSAPP`. Also upload `_headers` (security headers) with the site.

## 3. What is where
| File | Purpose |
|---|---|
| `data/config.js` | Project URL + **publishable** key (public by design) |
| `data/auth_db.js` | Auth + data layer (Supabase Auth, JWT, RLS-backed) |
| `db/01_secure_schema.sql` | Tables, triggers (auto-profile, timestamps), RLS policies, private resume bucket |
| `db/02_create_admin.sql` | One-time admin promotion (never possible from the website) |
| `db/03_cleanup_demo_data.sql` | Preview + optional removal of demo/test rows |

## 4. How a new user is stored
Sign-up -> Supabase Auth (password bcrypt-hashed server-side) -> trigger creates a `profiles` row
(`created_at`, `updated_at` automatic, role clamped to student/college/employer) -> confirmation email.
Sign-in updates `last_login_at`. All timestamps are `timestamptz` (UTC), shown in IST in the UI.
