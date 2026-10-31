# What changed in your website (simple words)

## The big problems your ORIGINAL site had
1. **A secret master key was inside the website files** (config.local.js) and the pages loaded it. Anyone could copy it from the browser and read, change or delete your whole database.
2. **Passwords were kept in the visitor's browser** as weak hashes, and sign-up used that master key.
3. **The admin login was fake**: it only checked a password hash inside the page, and the "logged in" flag could be set by anyone from the browser console.
4. **Everyone could read all student leads and job applications** (names, phones, emails) just by knowing your public key.
5. **Resumes were stored in a public folder.**
6. **Many things were saved only in the browser** (jobs posted by employers, colleges, contact messages, applications). Other people, including you as admin, never saw them.
7. **Forms said "success" even when saving failed**, so real applications could be lost. (jobs.html never saved to the cloud at all, because of a coding bug.)
8. **Lots of made-up data**: 488 generated colleges, fictional hospitals/hotels, fake news notices naming Apollo/Fortis/Max, fake statistics (488+, 450+, 25+, 100k+ students...), fake phone 0000000000, fake default status "Shortlisted for Interview", fake candidate skills, fake "Verified" labels.

## What I changed
**Security (backend)**
- Real login system (Supabase Auth): passwords are hashed by the server, never stored in the browser.
- The master key is gone from the site. The site only uses the public key, which is safe by design.
- Database rules (Row Level Security): a student sees only their own data; a college sees only leads for its own college; an employer sees only applicants for its own jobs; only a real admin sees everything. These rules are enforced by the database, so they cannot be bypassed from the browser.
- Nobody can make themselves admin from the website. Admin is created only by you in the Supabase dashboard.
- Resumes are in a private folder; links expire (10-60 minutes). Employers can open a resume only if that person applied to their job.
- New jobs from employers and new colleges are held for your review (Pending / unverified) before they appear publicly.
- All user text is escaped before display (stops script-injection attacks); CSV exports are safe from spreadsheet-formula attacks.
- Server-side input checks, login rate-limit friendly design, one application per job per student, security headers file (`_headers`).

**Functional (everything now goes to the cloud database)**
- Sign-up auto-creates the user + profile with automatic timestamps (created_at, updated_at, last_login_at). Login is role-checked.
- Contact form, partner-with-us form, college enquiries, job applications: saved in the database, and the user sees an error if saving fails.
- Employer portal: post jobs, pause/resume, see applicants, change status, open resumes.
- College portal: create the college listing and courses, update seats, see leads, change status.
- Student dashboard: real applications with real timestamps.
- Admin console: logs in through the server, shows real leads/applications/messages/users/jobs/colleges, records admin logins with real timestamps, can add/publish jobs and colleges to the database.

**Demo / fake data removed**
- Removed the generated college list and the fictional jobs; the site now shows only what is in your database (with friendly "nothing yet" messages).
- Removed fake notices, tickers, statistics, fake ratings, fake recruiters, fake fallback values (Mumbai, 12th Pass, 0000000000, candidate@skillora.in...).
- Removed seed_jobs.py and import_to_supabase.py (they re-created fake data), the browser-profile folder (scratch/) and the old secret-key file.

# What YOU must do (in this order)
1. **Rotate the leaked secret key** in Supabase (Project Settings -> API Keys). Treat the old one as stolen. Also never reuse your old admin password anywhere (its hash was in your public git history).
2. **Back up**, then run `db/01_secure_schema.sql` in the Supabase SQL Editor.
3. Supabase -> Authentication: keep **Confirm email ON**, minimum password length 8+, enable **leaked-password protection**, set the **Site URL** to your real domain, and (recommended) turn on CAPTCHA/rate limits.
4. Create your admin user (Authentication -> Users -> Add user), then run `db/02_create_admin.sql` with that email.
5. Run `db/03_cleanup_demo_data.sql`: preview first, then un-comment the deletes you want (old fake jobs, the 488 generated colleges, test users/leads). Also empty the old public `resumes` files you don't need.
6. Edit `data/config.js` and add your REAL `SUPPORT_PHONE` / `SUPPORT_WHATSAPP`. Until then the site hides phone numbers instead of showing 0000000000.
7. Decide which emails are real: the site mentions support@skillora.in, support@skilloraindia.com, admissions@skilloraindia.com and skillora.web@gmail.com (contact-form notifications go through formsubmit.co to that Gmail). Keep only addresses you own.
8. Deploy as static site (Netlify/Cloudflare Pages/Vercel). Do not upload db/ or any .env.
9. Test with real accounts: sign up as student/college/employer, apply, post a job, approve it from admin.
10. Remove the old git history of the secret/admin hash if the repo is public (or make the repo private).

# Still to improve later (not blocking)
- Photos on job/college cards are stock images, not real facility photos.
- Student login is email-only (phone-number login was removed because it can't be done safely).
- Add password-reset ("Forgot password") page - Supabase supports it; needs a small page.
- Terms/Privacy/Refund pages should be reviewed by a lawyer; they mention partner banks/fees you must be able to honour.
- Admin editing of existing jobs/colleges beyond publish/unpublish, and admin "verify college" button (for now set verified=true in the Supabase table or use the admin Add College form).
- Add backups + monitoring (Supabase daily backups, uptime alerts).
