# REL-007 Migration Reconciliation

**Scope:** authorized staging project `xrmrhjgkttxzvwdsjazs` only  
**Rule:** do not run a blind `supabase db push` while local and remote history differ.

## Why reconciliation is required

The repository and staging contain equivalent August 16–17 contract changes under different migration versions. Staging also contains several execution-time versions that were not represented by files in `main`. REL-007 adds no-op history mirrors for those already-applied remote versions and one final idempotent convergence migration.

## Local versions already represented by equivalent staging objects

Mark these repository versions as applied on staging only after the read-only object checks below pass:

```text
20260816130000  inpel_parent_guardian_consent
20260816130100  inpolor_review_declaration_audit
```

Do not mark `20260820043600` as applied. That is the real REL-007 convergence migration and must execute normally.

## Remote history mirrors added to the repository

```text
20260817111316  inpel_parent_guardian_consent
20260817111334  inpolor_review_declaration_audit
20260817111420  inpolor_review_declaration_audit
20260817111423  fix_inpolor_declaration_return_contract
20260817111541  critical_platform_contracts_staging
20260817111548  reject_null_parent_preferences
20260817111553  remove_legacy_profile_policies
20260817111604  enforce_approved_unspoken_unlock
20260817111617  remove_legacy_representative_policies
20260817111630  catalog_security_invoker_views
20260817111638  remove_remaining_legacy_rls_policies
20260817111729  catalog_read_policies_for_security_invoker_views
```

These files intentionally contain no schema mutation. They make a clean local rebuild aware of staging’s recorded versions; the final REL-007 migration owns the converged end state.

## Required pre-repair checks

Run read-only checks first and retain their output in the PR:

```sql
select to_regprocedure(
  'public.create_parent_student_invitation(text,text,text,jsonb,jsonb,text,boolean)'
) is not null as guardian_contract_present;

select to_regclass('private.review_declaration_receipts') is not null
  as declaration_receipt_present;

select to_regprocedure('public.submit_inpolor_review(jsonb)') is not null
  as review_submission_present;

select table_name, column_name
from information_schema.columns
where table_schema = 'public'
  and table_name = 'sessions'
  and column_name in (
    'student_age_band',
    'guardian_consent_given',
    'guardian_consent_recorded_at',
    'guardian_consent_declaration'
  )
order by column_name;
```

All checks must confirm that the equivalent objects already exist before history is repaired.

## One-time staging repair sequence

Use the linked staging project from a trusted local checkout:

```bash
supabase migration list --linked
supabase migration repair 20260816130000 --status applied
supabase migration repair 20260816130100 --status applied
supabase migration list --linked
supabase db push --dry-run
```

The dry run must show only:

```text
20260820043600_rel_007_source_of_truth_convergence.sql
```

If any other schema-changing migration appears, stop and reconcile again. After the PR checks pass and the dry run is clean:

```bash
supabase db push
supabase migration list --linked
```

## Post-deploy verification

Verify all of the following:

- declaration version is `inpolor-launch-2026-08-16`;
- `submit_inpolor_review` is not executable by `anon`;
- reference catalogue views are `security_invoker=true`;
- catalogue base-table policies require verified links and published visibility;
- `private.reference_import_runs` has RLS enabled and no browser grants;
- one report does not update a public content status;
- unlock requires an owned published review;
- parent invitation accepts the portal’s exact four preference values and rejects missing, null, extra, or mismatched keys;
- public catalogue and review counts remain unchanged unless real reviewed data is deliberately added.

## Rollback posture

REL-007 replaces functions and policies but does not delete product or reference data. Roll back application code through Git, restore the previous function definitions captured in Phase 0 evidence, and repair migration history only after the schema has been restored. Never mark a failed or partially applied migration as applied.
