-- =====================================================================
-- CREATE YOUR ADMIN (do this once, in the SQL Editor – never from the site)
-- 1. Supabase Dashboard -> Authentication -> Users -> "Add user" -> create
--    your admin with email + a STRONG unique password (tick "Auto Confirm").
-- 2. Then run this, using that same email:
-- =====================================================================
update public.profiles
   set role = 'admin'
 where lower(email) = lower('PUT-YOUR-ADMIN-EMAIL-HERE');   -- <- edit

-- Verify (should return exactly the people you expect):
select id, email, role, created_at from public.profiles where role = 'admin';
