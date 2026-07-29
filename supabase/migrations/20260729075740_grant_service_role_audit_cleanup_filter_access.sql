begin;

-- Server-side audit/admin-fixture cleanup only. PostgreSQL requires SELECT on
-- columns used in DELETE filters; this grants nothing to browser client roles.
grant select on table public.profiles to service_role;
grant select on table public.student_assessments to service_role;

commit;
