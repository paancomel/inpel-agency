begin;

-- Staging migration-history mirror.
-- The equivalent contract change was already applied to the authorized staging
-- project during the August 17 hardening work. The final intended state is
-- asserted idempotently by REL-007's convergence migration.

commit;
