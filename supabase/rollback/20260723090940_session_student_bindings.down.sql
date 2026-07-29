begin;

-- No automatic rollback: dropping the binding table destroys invitation state
-- and can leave later trusted functions with a broken security contract.
-- Use a reviewed forward migration or verified backup for recovery.

commit;
