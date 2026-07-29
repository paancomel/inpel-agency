begin;

-- Server-side audit/admin-fixture access only. These privileges support the
-- isolated integration audit's setup, cleanup, and cleanup verification; they
-- are not for browser clients and grant nothing to anon, authenticated, or public.
grant usage on schema public to service_role;

grant insert, delete on table public.profiles to service_role;
grant insert, select, delete on table public.recommendation_results to service_role;

grant select, delete on table public.reviews to service_role;
grant delete on table public.student_assessments to service_role;
grant select, delete on table public.sessions to service_role;
grant select, delete on table public.gallery_images to service_role;
grant select, delete on table public.courses to service_role;
grant select, delete on table public.universities to service_role;

commit;
