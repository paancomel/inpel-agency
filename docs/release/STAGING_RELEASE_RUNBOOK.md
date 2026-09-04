# Agency Web / Inpel Staging Release Runbook

## State and one rule

**Current state: release blocked until every required gate below is evidenced.**

The technical baseline was last verified on **29 July 2026** at commit
`587bebe5e1507bfe476b9d9c89871eb4f567e660`:

- GitHub Local quality passed typecheck, lint, unit/component tests, and build.
- The disposable staging integration audit passed, including cross-owner family
  and university ownership checks plus fixture cleanup.

On **4 September 2026**, the reconciled migration history was verified through
`20260904031206_bootstrap_institution_creator_membership`, and the disposable
staging integration audit passed again with zero fixture residue. This is newer
staging evidence, not a replacement for the full local quality or release gates.

This is staging evidence only. It is not production approval and it does not
complete the legal, browser, domain, communications, or operations gates.

Use only the disposable Supabase staging project:

| Item | Required value |
| --- | --- |
| Project name | `inpel-agency` |
| Project ref | `xrmrhjgkttxzvwdsjazs` |
| Allowed remote environment | This disposable staging project only |
| Production project, URL, credentials, or data | **Prohibited** |

Do not use a production credential as a substitute for a missing staging credential. Do not run a command against another project merely because it has the expected schema.

Do not use Docker Desktop or a local Supabase stack. All database inspection,
verification, and approved staging operations target this project directly. See
[the canonical Supabase environment boundary](../SUPABASE_CANONICAL_ENVIRONMENT.md).

Stop immediately if the project ref, environment URL, migration history, or intended target cannot be proven to be the staging project above.

## Roles and release ownership

| Role | May do | Must not do |
| --- | --- | --- |
| Release operator | Run the approved read-only preflight, local gates, and approved staging verification | Access production or print secrets |
| Database/RLS owner | Approve migration order, security fixes, advisor findings, and fixture cleanup | Use access-widening rollback |
| Product owner | Decide payment/demo and matching claims | Represent a demo as a real payment or personalised result |
| Legal/operations owner | Complete legal, privacy, communications, incident, and backup gates | Invent corporate, legal, or vendor facts |

---

## 1. Before any staging write

Complete these in order. Expected time: 20–40 minutes before code/database remediation time.

### 1.1 Freeze the exact release candidate

- [ ] Record the commit SHA and `git status --short` output in the release ticket.
- [ ] Run `git diff --check`; fix whitespace errors before continuing.
- [ ] Review the dirty worktree. Do not reset, delete, or include unrelated user work in the release candidate.
- [ ] Confirm the intended migrations are limited to the Agency Web/Inpel security and trusted-flow scope.

```powershell
git status --short
git diff --check
Get-ChildItem supabase/migrations -File -Filter '*.sql' | Sort-Object Name | Select-Object Name
```

### 1.2 Staging identity preflight — read-only

Use the project-scoped Supabase MCP connection only. Request all of the following without SQL writes, migration application, fixture creation, or another project:

```text
Use the Supabase MCP server for project ref xrmrhjgkttxzvwdsjazs only.
Read-only only. Confirm the project ref, project health, remote migration history,
public tables, RLS state, inspectable grants/policies, university-assets bucket
configuration, and security/performance advisor findings. Compare the remote
migration history with the local files listed in this runbook. Do not execute SQL,
apply migrations, create users, modify data, or access another project.
```

- [ ] The response identifies `xrmrhjgkttxzvwdsjazs` exactly.
- [ ] The response records the remote migration history and current advisor findings.
- [ ] The response records the current RLS/policy/grant and storage state that can be inspected.
- [ ] A mismatch, unknown project, or inaccessible migration history stops the release.

### 1.3 Required local migration order

The remote history must contain the first four migrations before the trusted-flow,
security-hardening, and audit-support migrations are considered:

1. `20260714024203_initial_schema.sql`
2. `20260714050000_expand_portal_assessment_payloads.sql`
3. `20260717153000_university_management_assets.sql`
4. `20260719231138_university_management_grants.sql`
5. `20260726030008_session_student_bindings.sql`
6. `20260726030217_trusted_invitation_operations.sql`
7. `20260726030227_ownership_rls_policies.sql`
8. `20260726030238_security_hardening_profiles_reviews_storage.sql`
9. `20260726030646_harden_public_review_projection_and_storage.sql`
10. `20260726032653_move_admin_check_to_private_schema.sql`
11. `20260726033011_rate_limit_public_review_submission.sql`
12. `20260729074956_grant_service_role_integration_audit.sql`
13. `20260729075740_grant_service_role_audit_cleanup_filter_access.sql`
14. `20260815090000_inpeler_v1_institution_management.sql`
15. `20260816090000_inpolor_public_launch_foundation.sql`
16. `20260816100000_inpolor_community_profile_onboarding.sql`
17. `20260816110000_inpolor_reward_photo_pipeline.sql`
18. `20260816120000_reference_diploma_catalog.sql`
19. `20260817111316_inpel_parent_guardian_consent.sql`
20. `20260817111334_inpolor_review_declaration_audit.sql`
21. `20260817111420_inpolor_review_declaration_audit.sql`
22. `20260817111423_fix_inpolor_declaration_return_contract.sql`
23. `20260817111541_critical_platform_contracts_staging.sql`
24. `20260817111548_reject_null_parent_preferences.sql`
25. `20260817111553_remove_legacy_profile_policies.sql`
26. `20260817111604_enforce_approved_unspoken_unlock.sql`
27. `20260817111617_remove_legacy_representative_policies.sql`
28. `20260817111630_catalog_security_invoker_views.sql`
29. `20260817111638_remove_remaining_legacy_rls_policies.sql`
30. `20260817111729_catalog_read_policies_for_security_invoker_views.sql`
31. `20260820050152_rel_007_source_of_truth_convergence.sql`
32. `20260820050348_rel_007_remove_duplicate_review_index.sql`
33. `20260904031206_bootstrap_institution_creator_membership.sql`

Before applying items 5–33, the database/RLS owner must review their order, current-data conflicts, grants, policies, `SECURITY DEFINER` authorization, and `search_path` controls. Do not use a broad migration push that could include unrelated dirty-worktree changes.

### 1.4 Apply rule

- [ ] Apply only the reviewed, missing migration(s), in the listed order, through the explicitly approved staging workflow.
- [ ] Record migration ID, UTC timestamp, operator, result, and resulting remote migration history after each apply.
- [ ] Re-run the read-only MCP inspection and advisors after schema changes.
- [ ] Stop on a migration failure, advisor critical finding, duplicate-assessment conflict, grant surprise, or RLS regression.

---

## 2. Rollback and security incident rule

**Never use a legacy rollback that disables RLS or deletes the `university-assets` bucket/objects.**

In particular, do not run `supabase/rollback/20260717153000_university_management_assets.down.sql` as a release rollback. It disables RLS on university-management tables and is not safe for a shared environment with assets.

For a security, RLS, grant, or storage-policy incident:

1. Stop the affected release/feature path and preserve evidence.
2. Restrict exposure with an approved, reviewed **forward-fix migration**.
3. Re-run advisor, role-matrix, integration, and cleanup checks.
4. Restore data only from a known-good backup through an approved recovery process.
5. Record the incident, impact, decision, and follow-up owner.

Do not disable RLS, widen grants, re-enable public bucket listing, or delete a bucket as an automated recovery step.

---

## 3. Required local quality gates

Run these from the repository root after source changes and before staging verification:

```powershell
git diff --check
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

- [ ] Record command, commit SHA, date/time, exit code, and first failing line if a command fails.
- [ ] Do not declare a broad pass from a focused test alone.
- [ ] The root `pnpm lint` script runs lint tasks for the three portals. `@repo/database` and `@repo/ui` do not currently expose equivalent lint scripts.
- [ ] The local quality workflow in `.github/workflows/local-quality.yml` intentionally runs only these non-secret gates. It does not run migrations, remote integration, browser tests, or deployments.

---

## 4. Disposable staging integration and cleanup

### 4.1 Integration environment

Use an ignored local file only:

`packages/database/.env.integration.local`

It must contain **staging-only** values for:

```text
NEXT_PUBLIC_SUPABASE_URL=<disposable staging URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<staging browser-safe public key>
SUPABASE_SECRET_KEY=<staging server-only key>
SUPABASE_AUDIT_ALLOW_REMOTE=true
```

The file must never be committed, printed, copied to CI, or populated with a production credential.

```powershell
git check-ignore -v packages/database/.env.integration.local
pnpm test:integration
```

`pnpm test:integration` uses the trusted RPC flow for authorised family and
report operations. It includes explicit negative tests for direct browser table
writes and cross-owner access. Keep those assertions current whenever an RPC,
policy, grant, or portal payload changes.

### 4.2 Database-test rule

The repository pgTAP files use transactional `BEGIN`/`ROLLBACK` patterns. Do not run a local-Docker-only command when the approved environment is disposable staging. A reviewed staging-capable database test runner is required; it must execute the tests transactionally and leave no schema/data changes. Record the exact runner, target ref, and result.

### 4.3 Required role and negative-test matrix

| Actor | Must prove |
| --- | --- |
| Anonymous | Cannot read/write sensitive family, payment, binding, raw-review, or storage-listing data; public asset retrieval works only for an already-known allowed URL. |
| Parent A / Parent B | Parent A can create and read only its own family session; Parent B cannot claim, read, activate, or infer Parent A data. |
| Student A / Student B | Confirmed invited Student A can claim once and complete its bound assessment; Student B, token replay, email mismatch, revoked, expired, and concurrent claims fail closed. |
| Representative A / Representative B | A can publish/delete only A-owned university paths; B cannot list, upload, delete, or move A's assets. |
| Admin | Access is explicit, narrow, audited, and does not depend on self-assigned `profiles.role`. |

Also prove direct client mutation of `sessions`, `student_assessments`, `recommendation_results`, `payments`, `session_student_bindings`, raw reviews, comments, and likes is denied where the design requires a trusted operation.

### 4.4 Cleanup is a release gate

Every staging verification run needs a unique run ID/prefix and must clean up even after an assertion failure:

- [ ] Auth users and sessions created for the run.
- [ ] Profiles, sessions, bindings, assessments, recommendations, payments, reports/access grants, reviews, comments, likes, universities, courses, and gallery fixtures created for the run.
- [ ] Storage objects created under the run-specific prefix.
- [ ] Any test-created public URLs, invitation tokens, and logs are not retained in reports.
- [ ] A final service-side assertion proves zero rows, users, and storage objects remain for that run ID.
- [ ] If cleanup fails or a run is interrupted, mark the release failed, retain the run manifest, and execute the reviewed cleanup procedure before retrying.

---

## 5. Browser journey gate

Run the real-browser matrix after staging verification. There is no checked-in browser automation configuration yet, so this is a manual release requirement until a reviewed harness exists.

| Portal | Required journeys |
| --- | --- |
| INPEL — `apps/portal-universiti` | Parent authentication and invitation, student claim, assessment, auth redirect/recovery, parent handoff, report-access denial/approval, refresh, invalid route, and no local-storage payment bypass. |
| INPELER — `apps/portal-student` | Representative login/refresh, profile/course edits, exact MQA validation, allowed and rejected asset upload, publish rollback, and cross-owner storage denial. |
| INPOLOR — `apps/portal-parent` | Public redacted feed, review submission/status truthfulness, anonymous identity handling, malformed/quota storage, refresh, and invalid route. Comments and likes are intentionally unavailable until a separately reviewed server-authorised flow exists. |

For every journey test at **320px, 768px, 1024px, and 1440px**:

- [ ] Keyboard navigation, focus, labels, validation errors, and colour/contrast review.
- [ ] Route guard and refresh behaviour.
- [ ] Browser console errors and failed network requests reviewed.
- [ ] Screenshot or recorded evidence attached to the release ticket.

---

## 6. Product, legal, and operational owner decisions

These are blocking fields. Leave them unchecked until an authorised owner supplies the fact or approval; do not invent a value from repository code.

### Legal and privacy

- [ ] Legal entity name, registration number, registered address, support email, privacy/security contact, and DPO decision supplied.
- [ ] English and Bahasa Malaysia Terms and Privacy Policy completed; no placeholders remain; Malaysian legal review approved.
- [ ] PDPA retention, deletion, subject-access, correction, withdrawal, marketing opt-out, parental/minor consent, vendor, and cross-border transfer processes approved and implemented.

### Authentication and communications

- [ ] Production domain(s), HTTPS, allowed callback URLs, SMTP sender/domain, email confirmation behaviour, OAuth providers, rate limits, and CAPTCHA/abuse decision supplied and verified in the target environment.
- [ ] No service-role or secret key is present in a browser bundle, public environment variable, repository, CI log, screenshot, or ticket.

### Commercial and matching truthfulness

- [ ] Owner selects either a real payment provider with a server-authoritative webhook/access model, or a permanent free-demo experience with no payment claim.
- [ ] Owner approves the matching methodology, inputs, limitations, explanation, correction/recalculation, and human-review process before calling results personalised or production-ready.

### Operations and launch authority

- [ ] Production monitoring, error reporting, log access, ownership/on-call, backup restore procedure, incident response, and post-release monitoring window supplied and rehearsed.
- [ ] Deployment platform, DNS/SSL, rollback owner, release approver, and launch communication plan supplied.

---

## 7. Final go / no-go record

Do not mark release ready until every item is green.

| Gate | Owner | Evidence link | Status |
| --- | --- | --- | --- |
| Staging ref and migration history |  |  | ⬜ |
| RLS/grants/storage/advisor review |  |  | ⬜ |
| Local typecheck, lint, test, build |  |  | ⬜ |
| Staging integration + zero-fixture cleanup |  |  | ⬜ |
| Three-portal browser matrix |  |  | ⬜ |
| Product truthfulness decision |  |  | ⬜ |
| Legal/privacy approval |  |  | ⬜ |
| Production operations and rollback drill |  |  | ⬜ |

If any row is incomplete, the outcome is **NO-GO**. Document the blocker, owner, and next bounded action instead of treating a partial check as approval.
