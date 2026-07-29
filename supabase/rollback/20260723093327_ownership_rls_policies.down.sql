begin;

-- No automatic rollback: disabling RLS, widening grants, or dropping access
-- grants would make sensitive family/report data unsafe or unavailable.
-- Recover through a reviewed forward migration or verified database backup.

commit;
