# Phase 0 Current-State Audit — INPOLOR Relaunch

**Audit date:** 20 August 2026  
**Repository baseline:** `main` at `5d2b00452755c276144baf73648b2c06569039db`  
**Live Supabase inspected:** `xrmrhjgkttxzvwdsjazs`  
**Audit posture:** Read-only. No production or staging data, schema, policies, secrets, or deployment configuration were changed.

## Executive conclusion

INPOLOR is not an empty prototype, but it is not a working verified-review marketplace either. The repository contains a substantial community schema, moderation primitives, a public projection, institution-management controls, a private photo-processing pipeline, and a large reference catalogue. However, the live product layer has no institutions, campuses, linked programmes, reviewer profiles, published reviews, moderator records, or analytics events.

The immediate problem is therefore not catalogue breadth. Live Supabase contains 756 reference institutions and 6,302 reference programme records, while the product catalogue and public review supply are both zero. The main blockers are source-of-truth divergence, broken review-submission contracts, missing private verification architecture, absence of a campus/programme-offering hierarchy, no measurable funnel, and no operational moderation cohort.

Two runtime contract breaks block a standard review from reaching moderation:

1. The INPOLOR frontend uses `reference_institution_id` as the review target, while the server requires a valid `public.universities.id`.
2. The frontend sends declaration version `inpolor-review-v1` with keys such as `age18OrOlder`, while the live RPC requires version `inpolor-launch-2026-08-16` with `adult`, `rights`, `terms`, and `privacy`.

The relaunch should not begin with homepage redesign. The first foundation milestone must converge repository, staging, payload, identity, and migration contracts so one standard review can move safely through submit → moderation → publish → public projection → aggregate.

## Evidence hierarchy

This audit uses the following order when sources conflict:

1. Live Supabase schema, policies, functions, storage, row counts, and migration history.
2. Runtime code on the current `main` branch.
3. Versioned migrations and automated tests on `main`.
4. Open pull requests, especially PR #3, as proposed but unmerged work.
5. Existing product and legal documents as intent, not proof of runtime behaviour.

## Status legend

- **Working:** implemented and supported by current evidence.
- **Partial:** implemented in part, but incomplete, inconsistent, or unproven end-to-end.
- **Absent:** no working implementation found.
- **Blocked:** implementation may exist, but cannot currently complete its intended journey.

---

## 1. Existing pages and routes

### INPOLOR — `apps/portal-parent`

Current routes:

- `/`
- `/universities/:id`
- `/compare`
- `/saved`
- `/account/reviews`
- `/submit-review`
- `/legal/terms`
- `/legal/privacy`
- `/legal/privacy-ms`

**Status: Partial.** The application has a directory, university profile, comparison, saved content, account review status, review submission, authentication modal, and legal routes. It does not have campus routes, programme routes, verification routes, moderation routes, appeal/withdrawal routes, a Student Reality Report route, or institution-response management.

### INPELER — `apps/portal-student`

Current routes support login, dashboard profile, import, courses, review/readiness, success, and legal pages.

**Status: Partial.** It is primarily a one-time institution publisher. It does not yet hydrate and maintain an existing institution, reconcile courses, create reviewed catalogue links, or expose a complete profile-version lifecycle.

### INPEL — `apps/portal-universiti`

Current routes support the parent invitation, student assessment, authentication callback, parent handoff, checkout, secure results, guides, and legal pages.

**Status: Partial but comparatively mature.** It uses server-authorised invitation and report RPCs and does not fabricate recommendations. It still uses the shared reference catalogue rather than a canonical institution-campus-programme offering model.

## 2. Existing user journeys

| Journey | Current state | Result |
|---|---|---|
| Visitor discovers institutions | Directory reads shared reference catalogue and review summaries | Blocked by zero public product links and ID inconsistency |
| Visitor opens university profile | University-level page with review feed and summary | No campus/programme distinction; no live public records |
| Contributor understands value | Homepage offers directory and contribution CTA | Trust proposition is mixed with legacy “field guide/tea” language |
| Contributor authenticates | Google or magic link plus 18+ DOB | Pending DOB is stored in `sessionStorage`; cross-tab magic links can lose it |
| Contributor submits standard review | Five-step wizard and review RPC | Blocked by declaration-version/key mismatch and university-ID mismatch |
| Contributor receives status | Pending local/cloud review appears in account | Cloud failures are collapsed into local/demo states; no precise failure status |
| Moderator reviews content | Database RPC and audit table exist | No moderator UI, staffing evidence, appeal queue, or end-to-end operational proof |
| Institution publishes profile | INPELER inserts institution, courses, and assets | Insert-only; no canonical link creation or ongoing maintenance lifecycle |
| Institution responds to review | Backend table and moderated response model exist | No usable representative response dashboard found |
| Parent/student use INPEL | Authenticated invitation, assessment, report | Working prototype, but not connected to programme-campus review insight |

## 3. Existing database entities

### Live reference layer

- `reference_institutions`: 756 rows
- `reference_programmes`: 6,302 rows
- `reference_institution_aliases`: 237 rows
- `reference_programme_aliases`: 470 rows
- `reference_programme_collaborations`: 302 rows
- `nec_classifications`: 111 rows
- `reference_import_runs`: 1 row

### Live product and community layer

The inspected staging project contains zero rows in:

- `profiles`
- `universities`
- `courses`
- `institution_members`
- `reference_institution_links`
- `reference_programme_links`
- `portal_catalog_visibility`
- `reviews`
- `review_versions`
- `review_photos`
- `published_reviews`
- `moderation_actions`
- `content_reports`
- `official_responses`
- `review_unspoken_truths`

There is one unconfirmed Auth user and no matching profile.

### Missing target entities

No dedicated tables were found for:

- campuses
- programme-campus offerings
- student verifications
- verification evidence
- review category ratings
- review structured answers
- review narratives
- scoped review entitlements
- user consent ledger
- analytics events
- ambassador referrals

Some legacy analogues exist, such as `courses`, `review_versions`, `content_reports`, declaration receipts, and `has_unlocked_tea`, but they do not satisfy the target hierarchy or privacy model.

## 4. Existing authentication and authorisation

**Working controls:**

- Supabase Auth is shared by all three portals.
- Sensitive write journeys generally use `SECURITY DEFINER` RPCs with empty `search_path`.
- Raw reviews are readable only by the owner or content moderator.
- Institution membership exists through `institution_members`.
- Private review-photo storage is owner-checked by the Edge Function.
- Public review projection excludes the reviewer ID.

**Gaps:**

- `profiles.role` is a single global role. One person cannot cleanly hold independent parent, student, alumni reviewer, moderator, and institution-member capabilities.
- Many RPCs are callable by every authenticated user and rely entirely on internal checks. They require explicit per-function authorisation tests.
- `get_institution_entitlement` is callable by anonymous users as a `SECURITY DEFINER` function. Its current payload appears non-sensitive, but the grant is broader than necessary and is flagged by the Supabase advisor.
- Leaked-password protection is disabled.
- Live `private.reference_import_runs` has RLS disabled.
- Base `universities` and `courses` tables have public `SELECT USING (true)`, which can expose unverified or incomplete product records outside the curated catalogue views.

## 5. Existing review submission flow

**Current frontend:**

- Five stages.
- Institution, free-text course, and exact study year.
- Eight mandatory 1–10 category ratings with no “not applicable”.
- One main experience field plus up to fourteen additional narrative fields.
- Optional living-cost value.
- Four declaration checkboxes.

**Current server:**

- Requires an authenticated 18+ profile.
- Requires a valid `universities.id`.
- Requires all eight ratings.
- Standard review requires at least one 30-word narrative.
- Reward review requires thirteen 30-word narratives, three food locations, monthly cost, and 16–40 confirmed server-processed photos.
- Writes a review version and declaration receipt.

**Status: Blocked.** The frontend declaration contract and university identity do not match the live RPC. The flow also exceeds the intended 3–4 minute mobile target and lacks campus, canonical programme, student/alumni status, study period, and privacy-aware cohort fields.

## 6. Existing verification system

**Status: Absent for student/alumni verification.**

The system currently has:

- an 18+ DOB gate;
- institution-domain claiming;
- institution verification status;
- review declarations;
- a private, server-processed photo pipeline for reward reviews.

It does not have:

- verification method selection;
- student/alumni verification cases;
- encrypted verification-evidence records;
- evidence retention/deletion lifecycle;
- verification reviewer access logs;
- public verified-student/alumni labels backed by evidence;
- configurable cohort-generalisation rules.

DOB confirms age only. It is not evidence that a person studied at a named institution or programme.

## 7. Existing moderation system

**Working backend primitives:**

- review status transitions;
- `moderation_actions` audit records;
- reports and report resolution fields;
- moderated institution responses;
- candidate/approved/rejected Unspoken Truth records;
- hidden-under-review state;
- separate payment-moderator role.

**Gaps:**

- no moderator dashboard or queue UI;
- no verification queue;
- no appeal status or appeal workflow;
- no reviewer withdrawal/update workflow exposed in the app;
- no public moderation explanation tied to individual decisions;
- no evidence of staffed moderators or service-level targets;
- global `has_unlocked_tea` is granted rather than a scoped entitlement;
- live `submit_inpolor_review_unchecked` still grants the global unlock immediately for reward submissions, while moderation also grants it on publish.

## 8. Existing analytics events

**Status: Absent.**

No product analytics SDK usage, event instrumentation, analytics table, funnel dashboard, or event taxonomy implementation was found. Existing `acquisition_source` and `acquisition_campaign` columns on reviews are insufficient to measure discovery, contribution, verification, approval, unlock, or referral funnels.

No conclusions about conversion rates, abandonment rates, demand, or campaign performance can be made from current evidence.

## 9. Existing deployment architecture

- Three React/Vite applications are deployed as separate Vercel projects.
- All three reported successful Vercel status for the audited `main` commit.
- One Supabase project supplies Auth, Postgres, RLS, Storage, and Edge Functions.
- One active Edge Function handles INPOLOR review-photo processing.
- The local quality workflow runs typecheck, lint, unit/component tests, workspace build, local Supabase reset, and pgTAP.
- A manual staging integration audit workflow exists.

**Gaps:**

- Browser journeys and deployed end-to-end tests are excluded from normal CI.
- The connected Vercel inspection account cannot currently fetch the owning team’s protected preview, so visual/runtime smoke evidence is incomplete.
- Successful deployment status proves build/deploy completion, not working review submission.

## 10. Existing integrations among INPEL, INPOLOR, and INPELER

**Working:**

- shared Supabase project;
- shared database package and generated types;
- shared reference institution/programme views;
- institution product records are intended to link to reference provenance;
- portal-specific catalogue visibility exists.

**Incomplete:**

- no shared campus entity;
- no shared programme-campus offering;
- INPOLOR uses reference institution IDs where product university IDs are required;
- INPELER selection copies names rather than preserving reference IDs;
- INPELER does not create reviewed institution/programme links during publishing;
- INPEL consumes reference programmes but cannot attach review confidence or campus reality;
- global profile roles make cross-portal membership brittle.

## 11. Broken or incomplete functionality

### P0

1. Frontend and live RPC declaration contracts differ.
2. INPOLOR review target ID differs from the server’s canonical product ID.
3. Repository migrations and live staging schema/history have diverged.
4. Public INPOLOR catalogue contains zero eligible product institutions.
5. There is no student/alumni verification system.

### P1

1. Magic-link onboarding can lose DOB across tabs.
2. Review submission errors can be presented as local/demo success.
3. University ranking numbers are assigned even when records are ineligible.
4. Unknown living cost is treated as RM0 by filters.
5. The review wizard can dereference a missing Zod error when only university selection is missing.
6. INPELER readiness ignores pending facility files.
7. INPELER remains insert-only and does not maintain existing institutions.
8. Legal routes render documents that explicitly say not to publish.
9. Moderation, appeal, verification, and institution-response operations lack usable interfaces.

## 12. Privacy and security risks

- No separation exists between student verification identity and public review content because student verification does not exist yet.
- “Always anonymous” and similar copy overstate the anonymity guarantee.
- Exact course/year and detailed narratives can re-identify small cohorts.
- Local review and assessment drafts can remain indefinitely on shared devices.
- Legal documents are draft, identify no completed legal controller, and contain unresolved placeholders.
- `private.reference_import_runs` lacks RLS in live staging.
- Public base-table reads can bypass curated publication conditions.
- Migration drift makes future database deployment unsafe without reconciliation.
- Future analytics could leak PII unless event contracts explicitly forbid review text, email, evidence data, and exact small-cohort attributes.

## 13. Duplicate institution or programme records

A read-only candidate-duplicate audit found:

- 1 normalised institution-name duplicate group covering 2 rows;
- 816 within-institution programme-name duplicate groups covering 1,815 rows;
- 86 repeated reference-number groups.

These are **candidate duplicates**, not confirmed duplicates. Repeated programme names and reference numbers may represent intakes, language variants, historical records, campus variants, or source irregularities. Reconciliation requires source provenance, campus, effective period, and MQA context before merging records.

## 14. Empty-state problems

The public INPOLOR catalogue, summaries, and review feed currently have zero eligible rows. The application does not insert synthetic reviews, which is correct. However:

- empty states remain university-level rather than campus/programme-level;
- the homepage presents a launch target rather than a measured supply count;
- there is no waitlist, campus-request, society referral, or verified first-contributor journey;
- noindex and structured-data controls based on review density are absent;
- the directory architecture encourages breadth even when no profile is useful yet.

## 15. Conversion friction

- DOB and account steps occur before a clear verification/value explanation.
- Review flow has five stages and many overlapping narrative prompts.
- All eight ratings are mandatory without N/A.
- Course and year are free text rather than selected from a canonical study context.
- Auth, onboarding, and submission failures can be swallowed or downgraded to demo/local states.
- Cross-tab magic-link state is fragile.
- No analytics exists to identify the largest drop-off.
- No save-and-resume contract is versioned server-side.
- The contributor does not see a precise verification, moderation, and unlock timeline.

## 16. Technical debt

- Large monolithic route/components combine data loading, business rules, and rendering.
- Major review content remains opaque JSONB despite needing filtering, moderation, aggregation, and privacy control.
- Legacy naming (`portal-parent`, `portal-student`, `has_unlocked_tea`, `spill_the_tea`) obscures product meaning.
- Repository main, PR #3, and live staging represent three different contracts.
- Main pgTAP tests are stale against evolved schema and policies.
- No browser E2E suite covers the three critical journeys.
- Root documentation still describes older Node/schema assumptions.
- Public and private catalogue responsibilities are not consistently expressed in frontend types.

## 17. Features to retain

- real-review-only policy and honest empty states;
- public identity-free review projection;
- owner/moderator restriction on raw reviews;
- moderation action audit records;
- report queue without automatic takedown from one ordinary report;
- institution right-of-response concept with moderation;
- reference-data provenance and explicit link tables;
- portal-specific publication visibility;
- private photo bucket, signed previews, metadata stripping, redaction, and original deletion;
- server-authoritative invitation/report access in INPEL;
- no fabricated matching recommendations;
- institution membership and audit concepts in INPELER;
- CI typecheck, lint, tests, build, database reset, and pgTAP foundations.

## 18. Features to redesign

- institution → campus → programme → offering hierarchy;
- canonical IDs and cross-portal linking;
- four-step mobile review flow;
- student/alumni private verification;
- capability-based roles instead of one global role;
- normalized review ratings, structured answers, narratives, revisions, and helpful votes;
- scoped, revocable review entitlements;
- confidence and small-sample logic;
- moderator and verification operations;
- institution maintenance and response workflows;
- local storage retention and shared-device controls;
- analytics taxonomy and privacy-safe event boundary;
- dynamic SEO/noindex rules based on useful review density.

## 19. Features to postpone

Until the standard verified-review lifecycle is working and measurable, postpone:

- open comment threads;
- public Q&A;
- reward-payment operations;
- mandatory 16–40-photo reward reviews;
- national rankings;
- complex AI summaries or fraud models;
- broad paid acquisition;
- large-scale institution onboarding;
- advanced referral or ambassador payments.

## 20. Features to remove from relaunch scope

- gossip-first homepage positioning;
- claims of absolute anonymity;
- a global lifetime `has_unlocked_tea` entitlement;
- automatic public ranking numbers for ineligible records;
- treating unknown cost as RM0;
- public aggregates from tiny samples;
- demo or sample reviews presented as real evidence;
- institution ability to influence review approval, ordering, or removal;
- uncontrolled comments before moderation capacity exists;
- direct use of reference IDs as public product identities.

---

## Phase 0 decisions

1. The live product is **pre-supply**, not merely low-supply.
2. Reference catalogue records are provenance/discovery inputs, not public product identities.
3. `universities.id` remains the transitional product identity until the canonical institution/campus model is introduced.
4. PR #3 must not be merged wholesale. It is based on an older main branch, staging has already received only part of its intent, and it does not fix the declaration contract mismatch.
5. The first foundation milestone is source-of-truth convergence and a working standard-review lifecycle.
6. Campus selection is deferred until the team supplies evidence of student access, societies, alumni, ambassadors, geography, and existing review supply.

## Evidence gaps and true blockers

| Blocker | Why it matters | Work that can continue | Smallest required input/access |
|---|---|---|---|
| No confirmed first-three-campus access data | Campus selection cannot be evidence-based | Architecture, verification, review lifecycle, analytics design | Shortlist with direct student/society/alumni access evidence |
| No legal entity/counsel-approved notice | Public consent contract is not ready | Internal/staging design and implementation | Registered controller details and Malaysian legal review |
| No moderator cohort | Public collection cannot be safely launched | Build queues, policies, and tests | Named internal moderator owner and operating capacity |
| Vercel protected-preview inspection unavailable to current connector | Browser/runtime evidence is incomplete | GitHub CI, Supabase audit, local E2E design | Vercel access to the owning team or a temporary share URL |
| No real review/user data | Funnel and density assumptions cannot be measured | Instrumentation design and pilot setup | Pilot contributors after verification/moderation foundation is ready |

## Recommended next step

Execute the milestone defined in [`00G_FIRST_FOUNDATION_MILESTONE.md`](./00G_FIRST_FOUNDATION_MILESTONE.md). It should establish one coherent contract across main, migrations, staging, frontend payloads, canonical product IDs, moderation, public projection, and isolated end-to-end tests before Phase 1 product/UX implementation expands the model.
