begin;

-- Profiles are now created and updated through trusted RPCs. Remove the earlier
-- broad self-service policies so the single owner/admin read policy remains the
-- browser boundary.
drop policy if exists "users create basic profiles" on public.profiles;
drop policy if exists "users read their own profile" on public.profiles;
drop policy if exists "users update basic profiles" on public.profiles;

commit;
