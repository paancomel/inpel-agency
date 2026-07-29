begin;

-- No automatic rollback: the previous script deleted every university asset
-- and disabled RLS on public tables. Recovery must use a reviewed forward
-- migration or a verified backup, never an access-widening rollback.

commit;
