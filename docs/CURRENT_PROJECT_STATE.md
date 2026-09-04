# Current project state — 5 September 2026

This is the operational handover for the repository. It records verified facts,
not a production approval.

## Current position

- **Branch and pushed commit:** `codex/inpolor-public-launch` at `a1f5ede`
  (`fix: submit inpolor reviews with university ids`).
- **Release position:** staging is functional for the verified paths below;
  production remains **NO-GO**.
- **Canonical Supabase:** only `xrmrhjgkttxzvwdsjazs` (`inpel-agency`,
  `ap-southeast-1`). It is disposable staging and the canonical schema source.
- **Schema position:** repository and staging have the same 35 migration IDs,
  in the same order.

## Verified staging outcomes

- INPOLOR displays a 756-institution MQA-source-backed catalogue.
- All 756 source references are linked to `public.universities` and published
  for INPOLOR. No representative, contact, address, price, course, or review
  claim was invented in that import.
- An authenticated test account completed community onboarding and submitted one
  compliant review through the server-authoritative RPC; the result was
  `submitted`.
- The controlled QA account, its profile, review, versions, and private receipt
  records were removed. Post-cleanup verification returned zero matching Auth
  users, profiles, and reviews.
- Focused INPOLOR unit tests, portal typecheck, and portal build passed after
  the review-ID correction.
- Public Vercel staging smoke checks passed for [INPOLOR](https://inpolor-staging.vercel.app/),
  [INPELER](https://inpeler-staging.vercel.app/login), and
  [INPEL](https://inpel-staging-donnnave-5370s-projects.vercel.app/) on the
  deployment of `b7d06aa`. No credentials, personal data, or new records were
  used during this check.

## Critical guardrails

1. **No Docker and no alternate Supabase project.** Do not run Docker Desktop,
   `supabase start`, `supabase db reset`, `migration repair`, or connect to any
   ref other than `xrmrhjgkttxzvwdsjazs`.
2. **Forward-only schema work.** Inspect the canonical history first. Do not
   reset, repair, roll back, or overwrite history to solve drift.
3. **Keep catalogue and review identities distinct.**
   `reference_institution_id` groups MQA source data/programmes;
   `university_id` is the only valid target for `submit_inpolor_review`,
   summaries, and review relationships. The portal query and its unit test
   explicitly select and lock this mapping.
4. **No secrets in browser configuration.** Only browser-safe Supabase URL and
   publishable key may use `VITE_*`; never place service-role/secret keys there.
5. **Do not treat staging import as production approval.** The product
   specification's 20-institution launch target and its evidence/legal gates
   remain separate decisions.

## Remaining release blockers / next work

1. Replace Terms placeholders and complete Malaysian legal/corporate/vendor
   approvals before public production release.
2. Complete the authenticated, responsive browser journey matrix at 320px,
   768px, 1024px, and 1440px against the intended Vercel deployment. Public
   desktop smoke checks are complete, but the exact viewport matrix is not.
3. Before any production launch, follow the production checklist and create a
   separately approved production plan; canonical staging must not be silently
   reclassified or substituted.

## Evidence pointers

- [Canonical environment policy](SUPABASE_CANONICAL_ENVIRONMENT.md)
- [Staging schema audit](audits/STAGING_SCHEMA_AUDIT_2026-09-04.md)
- [INPOLOR production release checklist](release/INPOLOR_PRODUCTION_RELEASE_CHECKLIST.md)
