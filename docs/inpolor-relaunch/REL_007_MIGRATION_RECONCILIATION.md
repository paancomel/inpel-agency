# REL-007 Migration Reconciliation

**Scope:** authorized staging project `xrmrhjgkttxzvwdsjazs` only  
**Rule:** do not run a blind `supabase db push` while local and remote history differ.

## Resolution

The repository previously stored two August 16 migrations under versions that staging never recorded:

```text
20260816130000  inpel_parent_guardian_consent
20260816130100  inpolor_review_declaration_audit
```

Staging contains the equivalent changes under its actual recorded versions:

```text
20260817111316  inpel_parent_guardian_consent
20260817111334  inpolor_review_declaration_audit
```

REL-007 moves the real migration bodies to those recorded staging versions and removes the unrecorded repository versions. This is deliberate history convergence, not a schema rollback. Fresh local rebuilds still execute the real guardian-consent and declaration migrations; linked staging correctly treats them as already applied.

## Remote history represented in the repository

```text
20260817111316  inpel_parent_guardian_consent — real migration body
20260817111334  inpolor_review_declaration_audit — real migration body
20260817111420  inpolor_review_declaration_audit — history mirror
20260817111423  fix_inpolor_declaration_return_contract — history mirror
20260817111541  critical_platform_contracts_staging — history mirror
20260817111548  reject_null_parent_preferences — history mirror
20260817111553  remove_legacy_profile_policies — history mirror
20260817111604  enforce_approved_unspoken_unlock — history mirror
20260817111617  remove_legacy_representative_policies — history mirror
20260817111630  catalog_security_invoker_views — history mirror
20260817111638  remove_remaining_legacy_rls_policies — history mirror
20260817111729  catalog_read_policies_for_security_invoker_views — history mirror
```

The mirror files intentionally contain no schema mutation. The final idempotent migration `20260820043600_rel_007_source_of_truth_convergence.sql` owns the converged end state.

## Required checks before deployment

Run from a trusted checkout linked to staging:

```bash
supabase migration list --linked
supabase db push --dry-run
```

The local and remote columns must align through `20260817111729`. The dry run must show only:

```text
20260820043600_rel_007_source_of_truth_convergence.sql
```

If an older migration appears pending or a remote-only version lacks a local file, stop. Do not use `migration repair` to conceal a mismatch that has not been explained.

After application quality, local reset, pgTAP, and the dry run all pass:

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

REL-007 replaces functions and policies but does not delete product or reference data. Roll back application code through Git, restore the previous function definitions captured in Phase 0 evidence, and reconcile migration history only after the schema has been restored. Never mark a failed or partially applied migration as applied.
