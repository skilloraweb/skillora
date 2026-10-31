# SkillOra

Static website (HTML/CSS/JS) backed by Supabase (Auth, Postgres with Row Level Security, private Storage).

- Start here: **SETUP_AND_SECURITY.md** (how to deploy safely) and **CHANGES_AND_NEXT_STEPS.md** (what changed and what to do next).
- `db/` - SQL to run in Supabase (schema + security rules, create admin, clean demo data).
- `data/config.js` - public project URL + publishable key + your support phone numbers. **Never put a secret/service key in any file served to the browser.**
- `data/auth_db.js` - all login and data access; security is enforced by the database rules, not by the page.
