# INPOLOR Relaunch Decision Log

This log is append-only in intent. New decisions may supersede older decisions, but prior records should remain available for auditability.

## ADR-INPOLOR-0001 — Adopt the relaunch master directive

- **Status:** Accepted
- **Date:** 2026-08-19
- **Decision:** Adopt `MASTER_DIRECTIVE.md` as the official master directive for the INPOLOR relaunch and product rebuild.
- **Reason:** The relaunch needs one authoritative framework spanning product strategy, UX, trust and safety, privacy, backend architecture, frontend implementation, analytics, growth, QA, staged deployment, and final acceptance.
- **Evidence:** Explicit product-owner approval on 2026-08-19 and the supplied Master Orchestration Prompt.
- **Alternatives considered:**
  - Keep the prompt only in conversation history.
  - Append selected sections to the existing public-launch specification.
  - Add the relaunch scope to the existing critical-contract hardening PR.
- **Trade-offs:**
  - Creates a substantially larger, multi-phase programme of work.
  - Requires audit and dependency mapping before visible redesign work.
  - Improves traceability and prevents disconnected feature development.
- **Reversibility:** Reversible only through a later approved ADR that explicitly supersedes this decision.
- **Owner:** Product Owner and Lead Orchestrator
- **Follow-up date:** At completion of Phase 0 audit
- **Consequences:**
  - Target positioning is a verified student decision and reality-check platform, not a gossip platform.
  - Private verification and public anonymity must remain technically separated.
  - Programme-campus density takes priority over catalogue breadth and nationwide ranking.
  - No large relaunch implementation begins before the current-state audit and dependency map are complete.
  - Major work is coordinated through the required sub-agent roles and handoff format.
  - Fake reviews, misleading small-sample ratings, paid review control, and silent deviations are prohibited.

---

## ADR-INPOLOR-0002 — Use live schema as operational evidence and repository migrations as the release source to be reconciled

- **Status:** Accepted
- **Date:** 2026-08-20
- **Decision:** Treat live Supabase as evidence of what currently exists, while requiring the repository to become the reproducible release source through explicit reconciliation.
- **Reason:** Live staging contains additional reconciliation migrations and function/policy definitions that are not represented coherently in current `main`. A clean database built from `main` does not equal the inspected live staging database.
- **Evidence:** Live migration history, table/policy/function inspection, current main migrations, and open PR #3 differ.
- **Alternatives considered:**
  - Treat `main` migrations as correct and overwrite staging.
  - Treat live staging as authoritative and stop versioning its differences.
  - Blindly merge PR #3 and run `supabase db push`.
- **Trade-offs:**
  - Reconciliation work delays visible feature development.
  - Preserves auditability and reduces destructive deployment risk.
  - Requires a documented migration-history map.
- **Reversibility:** The evidence hierarchy can be superseded by a later ADR after the repository and environments are demonstrably converged.
- **Owner:** Backend/Data Architect and Release Owner
- **Follow-up date:** Completion of REL-007
- **Consequences:**
  - Blind database push is prohibited until reconciliation tests pass.
  - Every new migration must be additive, tested from a clean database, and compared with staging.
  - Manual staging changes must be represented or explicitly retired in versioned source.

---

## ADR-INPOLOR-0003 — Separate reference provenance IDs from public product IDs

- **Status:** Accepted
- **Date:** 2026-08-20
- **Decision:** Reference institution/programme IDs are provenance and discovery identifiers. Public product and review targets must use reviewed product IDs; during the transitional milestone this means `universities.id` and, where available, `courses.id`.
- **Reason:** The frontend currently sends `reference_institution_id`, but the review RPC requires a valid `universities.id`. Summaries and public review projections are also keyed by product university ID.
- **Evidence:** INPOLOR catalogue mapper, live catalogue views, reference link tables, review RPC definition, and zero product links.
- **Alternatives considered:**
  - Change the review RPC to accept any reference institution directly.
  - Make reference rows the product catalogue.
  - Duplicate separate catalogue identities per portal.
- **Trade-offs:**
  - Requires reviewed link creation and product publication before a record can receive reviews.
  - Prevents unreviewed source rows from becoming public profiles.
  - Supports later campus/programme-offering canonicalisation.
- **Reversibility:** Product IDs may later migrate to canonical `institutions/campuses/programmes/offerings`, preserving mappings from transitional IDs.
- **Owner:** Data Architect
- **Follow-up date:** Completion of REL-007 and Phase 2 schema approval
- **Consequences:**
  - INPOLOR public directory must use curated linked/published records.
  - Types must carry reference and product IDs separately.
  - Tests must reject a reference ID used as a product review target.

---

## ADR-INPOLOR-0004 — Supersede PR #3 instead of merging it wholesale

- **Status:** Accepted
- **Date:** 2026-08-20
- **Decision:** Port verified fixes and tests from PR #3 into a fresh foundation branch based on current `main`, then close PR #3 as superseded once replacement coverage is complete.
- **Reason:** PR #3 is based on an older main branch; staging already contains partially reconciled versions of its changes; some policy definitions differ from live staging; and the PR still does not fix the live declaration-version/key mismatch.
- **Evidence:** PR #3 diff, changed-file list, live migration/policy/function state, current main, and frontend payload inspection.
- **Alternatives considered:**
  - Merge PR #3 as-is.
  - Rebase PR #3 and resolve all conflicts in place.
  - Discard PR #3 completely.
- **Trade-offs:**
  - Requires deliberate porting and a supersession matrix.
  - Avoids inheriting stale or incompatible migration assumptions.
  - Preserves valuable tests and implementation intent.
- **Reversibility:** A later review may retain a genuinely independent PR #3 remainder, but the critical-contract set will not be merged wholesale.
- **Owner:** Lead Orchestrator
- **Follow-up date:** Completion of REL-007
- **Consequences:**
  - The replacement PR must document each ported/replaced/deferred change.
  - PR #3 stays open/draft until equivalent coverage is demonstrably ready.
  - No changes are silently lost.

---

## ADR-INPOLOR-0005 — Make source-of-truth convergence and a working standard review lifecycle the first implementation milestone

- **Status:** Accepted
- **Date:** 2026-08-20
- **Decision:** Execute REL-007 before canonical campus schema, verification evidence, homepage redesign, analytics installation, or growth work.
- **Reason:** The standard review path is currently blocked by declaration and ID mismatches, and the repository cannot reproduce the live database. All wider relaunch work depends on a coherent base contract.
- **Evidence:** Phase 0 audit, architecture map, dependency map, live RPC definitions, frontend payloads, and migration drift.
- **Alternatives considered:**
  - Start the four-step review redesign first.
  - Build the final canonical data model immediately.
  - Launch with reference-only institution pages.
  - Begin campus acquisition before the review path is reliable.
- **Trade-offs:**
  - Visible UX changes are delayed.
  - The milestone does not deliver student verification or full programme-level value.
  - It creates a testable, safe base and removes compounding uncertainty.
- **Reversibility:** The milestone is additive and feature-flagged; it avoids destructive legacy retirement.
- **Owner:** Orchestrator, Backend/Data, Frontend, Trust/QA
- **Follow-up date:** REL-007 implementation PR review
- **Consequences:**
  - One standard review lifecycle must pass isolated integration and cleanup.
  - No synthetic public data may remain.
  - Production deployment is out of scope.
  - Legal and verification limitations remain explicit.

---

## ADR-INPOLOR-0006 — Defer first-three-campus selection until relationship and supply evidence exists

- **Status:** Accepted
- **Date:** 2026-08-20
- **Decision:** Do not name the first three campuses during Phase 0.
- **Reason:** No evidence was supplied for direct student access, societies, alumni, ambassadors, existing verified reviews, geographic concentration, or moderation feasibility.
- **Evidence:** Live product/review counts are zero and no campus relationship dataset or operating plan exists in the repository.
- **Alternatives considered:**
  - Select campuses by prestige.
  - Select institutions with the largest reference programme count.
  - Select campuses based on founder intuition without recording evidence.
- **Trade-offs:**
  - Growth planning cannot finalise the launch list yet.
  - Prevents an unserviceable or prestige-biased launch.
- **Reversibility:** Once evidence is provided, Phase 1 may score and approve campus candidates.
- **Owner:** Product Owner and Product/Growth Strategist
- **Follow-up date:** REL-014 evidence review
- **Consequences:**
  - A campus-selection rubric is prepared, but names remain blank.
  - Product/data foundation work continues independently.

---

## ADR-INPOLOR-0007 — Treat student verification, legal approval, and moderation capacity as public-collection release gates

- **Status:** Accepted
- **Date:** 2026-08-20
- **Decision:** Public review collection and campus launch remain blocked until private verification, approved legal notices, and named moderation/verification operations are ready.
- **Reason:** The current system has an age gate but no student/alumni verification; legal documents explicitly say not to publish; and no live moderator/verification cohort or dashboard is evidenced.
- **Evidence:** Live schema/counts, legal documents, current routes, and moderation backend/UI inspection.
- **Alternatives considered:**
  - Collect unverified reviews first and verify later.
  - Publish draft legal documents with a disclaimer.
  - Use institutions to confirm reviewers.
  - Launch and moderate reactively.
- **Trade-offs:**
  - Delays public supply acquisition.
  - Reduces trust, privacy, defamation, and operational failure risk.
- **Reversibility:** The gates can be refined after counsel and operating owners approve a different controlled policy; institutions still may not access reviewer identity/evidence.
- **Owner:** Product Owner, Trust/Safety, qualified Malaysian counsel, Moderation Owner
- **Follow-up date:** Before any public collection feature flag is enabled
- **Consequences:**
  - Internal and invited testing may continue with isolated fixtures and explicit test users.
  - Institutions cannot be used as reviewer-verification authorities.
  - No claim of launch readiness is permitted before the gates are evidenced.
