# REL-007 Migration Reconciliation

**Scope:** authorized staging project `xrmrhjgkttxzvwdsjazs` only  
**Status:** reconciled and deployed on 20 August 2026.

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

REL-007 moves the real migration bodies to those recorded staging versions and removes the unrecorded repository versions. Fresh local rebuilds still execute the real guardian-consent and declaration migrations; linked staging correctly treats them as already applied.

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
20260820050152  rel_007_source_of_truth_convergence — real migration body
20260820050348  rel_007_remove_duplicate_review_index — real follow-up
```

The mirror files intentionally contain no schema mutation. They represent changes already applied to staging before REL-007. The two REL-007 migrations are stored under the exact versions recorded by Supabase MCP, preventing another filename/history split.

## Deployment evidence

Before deployment:

- the repository and staging histories aligned through `20260817111729`;
- the only new schema change was REL-007;
- application typecheck, lint, tests, and build passed;
- a clean local Supabase rebuild and all pgTAP tests passed;
- all three Vercel staging deployments succeeded.

After deployment:

- `private.reference_import_runs` has RLS enabled and no browser grants;
- canonical declaration receipts are private and hidden from `anon` and `authenticated`;
- `submit_inpolor_review` accepts only `inpolor-launch-2026-08-16` declarations and is blocked for `anon`;
- review projection reads `mainExperience`;
- one report no longer auto-hides public content;
- moderator publication, not submission, unlocks protected excerpts;
- `get_institution_entitlement` runs as security invoker;
- catalogue policies require verified links and published visibility;
- the duplicate review lookup index introduced during rollout was removed immediately;
- product data counts remained zero: no universities, verified links, published catalogue rows, profiles, or reviews were fabricated.

## Remaining non-migration gates

Migration history is no longer a blocker. Remaining gates are operational or governance work:

- legal publication approval;
- named verification and moderation owners;
- a real institution, moderator account, and verified contributor for an end-to-end staging smoke test;
- enabling Supabase Auth leaked-password protection;
- a separate authorization review for intentionally callable `SECURITY DEFINER` RPCs;
- older performance-advisor findings outside REL-007.

## Rollback posture

REL-007 replaces functions and policies but does not delete product or reference data. Roll back application code through Git, restore the prior function definitions from Phase 0 evidence, and restore migration history only after the schema has been restored. Never mark a failed or partially applied migration as applied.
