begin;

-- This security migration intentionally has no automatic access-widening
-- rollback. Restoring broad profile, review, university, or storage permissions
-- would reintroduce vulnerabilities. Use a reviewed forward migration or a
-- known-good database backup when recovery is required.

commit;
