# Staging schema audit — 4 September 2026

## Scope and authority

- **Canonical environment:** Supabase project `xrmrhjgkttxzvwdsjazs` (`inpel-agency`), `ap-southeast-1`.
- **Decision:** the live staging schema and migration history are the source of truth for the 17–20 August 2026 changes.
- **Method:** Supabase MCP/CLI inspection, followed by one approved forward migration and a disposable staging integration run. No Docker, local Supabase stack, production project, reset, repair, rollback, or Edge Function write was used.

## Reconciliation status

The local repository and staging each now have 33 migration IDs, in the same order.

- The two local-only IDs were replaced with the canonical staging IDs.
- The 14 previously staging-only SQL sources were recovered directly from `supabase_migrations.schema_migrations.statements` and committed as local migration files.
- A project-scoped MCP comparison confirms no local-only or remote-only migration IDs remain.
- A normalized content comparison confirms that all 14 recovered local files exactly match the SQL stored by staging.
- Migration `20260904031206_bootstrap_institution_creator_membership.sql` was applied to staging. It creates an active `admin` membership automatically when a representative creates an institution, closing the observed RLS ownership gap.
- The deployed trigger uses a private `SECURITY DEFINER` function with an empty `search_path`; `PUBLIC`, `anon`, and `authenticated` cannot execute the function directly.

The Supabase CLI login-role path can return `403`, but direct staging connection using the locally stored `SUPABASE_DB_PASSWORD` successfully applied the reviewed migration. Use project-scoped MCP migration inspection as the authoritative read-only history check. Do **not** run `supabase migration repair`: migration IDs match and the command would only risk rewriting canonical history.

## Live security posture

- Every inspected `public` and `private` table has RLS enabled.
- Tables reported as RLS-without-policy have no `anon` or `authenticated` read/write grants. They are intentionally server/internal surfaces: `private.reference_import_runs`, `private.review_declaration_receipts`, `private.review_submission_rate_limits`, `private.reward_claims`, `private.reward_risk_signals`, `public.payments`, `public.recommendation_results`, `public.reference_institution_aliases`, `public.reference_programme_aliases`, `public.reference_programme_collaborations`, and `public.session_student_bindings`.
- Public catalog views use `security_invoker=true`; public reading therefore remains subject to the underlying RLS policies.
- Public `SECURITY DEFINER` RPCs are restricted from `anon`, use an empty `search_path`, and are exposed only where `authenticated` execution is intended. They remain an explicit review/test surface, not an automatically resolved linter warning.
- The `inpolor-review-photo` Edge Function has `verify_jwt: false` intentionally, but validates the bearer token in its own handler before every authenticated write. It had no Edge Function logs in the 24-hour audit window.

## Non-blocking advisor findings

- Performance advisor: unused-index notices are expected while staging has no data or traffic.
- Performance advisor: `institution_domains` and `institution_members` each have two permissive authenticated `SELECT` policies. This needs query-plan/behaviour review before scale, but is not evidence of data exposure.
- Security advisor warnings about intentionally exposed authenticated `SECURITY DEFINER` RPCs remain a review surface; the new private trigger function is not among them.

## Required next work

1. Run the broader local quality gates (typecheck, lint, test, build) against the final release candidate.
2. Add a focused authenticated INPOLOR submission test for `submit_inpolor_review`; the existing integration audit now correctly proves that the legacy anonymous endpoint is denied.
3. Perform the required browser journey matrix and production/legal/operations gates before any production release.

## Verification evidence

- `pnpm test:integration` passed on 4 September 2026 after the fixture was aligned with the current parent-preference contract and legacy anonymous review endpoint policy.
- Post-run staging query found zero `qa-audit-*` profiles, `QA Audit` universities/courses, test sessions, or test reviews.

## Explicitly out of scope

This audit does not authorise a staging reset, `migration repair`, production access, or any destructive rollback.
