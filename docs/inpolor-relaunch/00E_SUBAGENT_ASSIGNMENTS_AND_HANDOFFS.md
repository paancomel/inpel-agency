# Phase 0 Sub-Agent Assignments and Handoffs

## Execution note

The current interface did not expose a native isolated sub-agent/worktree execution tool. In accordance with the master directive, the required specialist roles were executed as sequential, non-overlapping audit lanes while preserving the same handoff structure.

No two lanes edited runtime code. All Phase 0 work was read-only against the repository and live Supabase until the orchestrator assembled the documentation on `agent/inpolor-phase-0-audit`.

## Lane map

| Lane | Directive role coverage | Audit focus | Primary output |
|---|---|---|---|
| A | Product Strategy | Positioning, user groups, scope, density, feature disposition | Product gap and funnel analysis |
| B/F | UX + Analytics | Routes, journeys, form friction, empty states, SEO, measurement | Funnel and information gap findings |
| C/H | Trust + QA | Anonymity, verification, moderation, appeals, privacy, release evidence | Risk register and test implications |
| D | Data/Backend/Security | Live schema, migrations, RLS, RPCs, storage, canonical IDs | Architecture and dependency maps |
| Orchestrator | Cross-functional resolution | Evidence hierarchy, conflicts, sequencing, milestone selection | Decisions, task board, target architecture, first milestone |

---

# Lane A — Product Strategy and Relaunch Scope

## Findings

1. The current experience is university-directory-first rather than programme-campus-first.
2. Live public supply is zero despite a large reference catalogue.
3. Product positioning mixes decision-support language with legacy “tea” framing.
4. Compare and saved features indicate a valid education-decision use case.
5. No evidence currently supports selecting the first three campuses.
6. Reward/payment/photo complexity is ahead of the standard-review supply loop.
7. No national ranking should be part of the relaunch.

## Decisions made

- Treat the live marketplace as pre-supply.
- Prioritise density and standard verified reviews before breadth or rewards.
- Retain decision tools but rebuild them around programme-campus offerings.
- Defer campus selection until relationship/access evidence is supplied.
- Remove gossip-first and tiny-sample ranking behaviour from the MVP direction.

## Assumptions

- Programme-level relevance is likely more valuable than university averages, but must be validated.
- Campus societies/alumni may be viable supply channels, but no relationship evidence was provided.
- A scoped Reality Report may motivate contribution, but no experiment data exists.

## Files created or changed

- `00_CURRENT_STATE_AUDIT.md`
- `00C_PRODUCT_GAP_AND_FUNNEL.md`
- `00G_FIRST_FOUNDATION_MILESTONE.md`
- `04_DECISION_LOG.md`
- `TASK_BOARD.md`

## Tests performed

- Compared target principles against current routes, components, live row counts, and public views.
- Verified that no live product/review supply exists.
- Verified that no analytics data supports conversion claims.

## Risks discovered

- Broad catalogue size may be mistaken for usable marketplace supply.
- Launch targets may be presented as measured activity.
- Reward complexity may attract fraud or abandonment before trust is established.

## Outstanding dependencies

- Campus access shortlist.
- Product-owner decision on contribution value exchange.
- Verification and entitlement policy.
- Moderation operating owner.

## Handoff

Sub-Agents B, C, D, and F should use programme-campus density—not directory breadth—as the shared success frame. Do not design a public score or acquisition campaign before confidence and verification rules are approved.

---

# Lane B/F — UX, Information Architecture, Funnel, and Analytics

## Findings

1. INPOLOR has no campus or programme routes.
2. The review form uses five stages and many overlapping narrative prompts.
3. All eight category ratings are mandatory and have no N/A option.
4. Authentication/DOB occurs without a complete verification/value explanation.
5. Pending DOB is vulnerable to cross-tab magic-link loss.
6. Errors can be silently downgraded to local/demo states.
7. Ranking and cost filters can mislead users.
8. Static SPA metadata cannot support useful programme search intent.
9. No analytics SDK, event table, event taxonomy, or dashboard exists.

## Decisions made

- The future review flow should use four mobile-first steps.
- Trust/value must be explained before high-friction authentication or verification.
- Error states must be explicit and retryable; false success is prohibited.
- Empty pages should invite relevant first contributors without fabricated ratings.
- Analytics requires a typed allow-list and privacy review before installation.

## Assumptions

- The current form is likely too long, but no duration/abandonment telemetry exists.
- “Verified privately, shared anonymously” may improve trust, but must be tested.
- Programme pages may improve search relevance, subject to density/noindex thresholds.

## Files created or changed

- `00_CURRENT_STATE_AUDIT.md`
- `00C_PRODUCT_GAP_AND_FUNNEL.md`
- `00B_DEPENDENCY_MAP.md`
- `00F_PROPOSED_TARGET_ARCHITECTURE.md`

## Tests performed

- Traced all current INPOLOR routes and major UI states.
- Compared frontend payload construction against live RPC definitions.
- Searched repository code for common analytics integrations and found none.
- Inspected static document metadata and route structure.

## Risks discovered

- Review conversion cannot be measured.
- Public anonymity copy is too absolute.
- Tiny samples and unknown cost can be represented misleadingly.
- Auth/submission failures can appear successful.

## Outstanding dependencies

- Approved trust model and verification sequence.
- Approved confidence thresholds.
- Analytics stack decision.
- Canonical campus/programme APIs.

## Handoff

Sub-Agent E must not implement homepage or programme routes until D provides stable canonical IDs and C provides trust/privacy display rules. Sub-Agent F must prohibit raw review text, email, verification evidence, and small-cohort PII from events.

---

# Lane C/H — Trust, Safety, Privacy, QA, and Release Readiness

## Findings

1. No student/alumni verification subsystem exists.
2. Raw review/public projection separation is a strong baseline.
3. Institution roles do not have broad profile access.
4. Review-photo processing is privacy-conscious but relies on manual auth because the function has `verify_jwt=false`.
5. Appeals, withdrawal, revision, and verification queues are incomplete.
6. Legal documents are draft and explicitly say not to publish.
7. `private.reference_import_runs` has RLS disabled.
8. Base public table reads are broader than curated catalogue views.
9. A global unlock can be granted at inconsistent points.
10. Normal CI has no browser E2E or deployed journey test.

## Decisions made

- Public collection remains blocked until verification, legal, moderation, and role-boundary gates are met.
- Verification evidence must be separated into a private domain.
- Institution representatives must never receive reviewer identity/evidence.
- Cohort precision must be configurable and generalised below a privacy threshold.
- Existing photo pipeline should be retained but not treated as student verification.
- Security-advisor warnings must be reviewed individually, not blanket-remediated.

## Assumptions

- A minimum public cohort threshold of three plausible people is a useful design default, subject to privacy/legal review.
- Some private tables intentionally have deny-all RLS with no policies.
- Some authenticated `SECURITY DEFINER` RPCs are legitimate when internal checks are complete.

## Files created or changed

- `00D_TRUST_PRIVACY_RISK_REGISTER.md`
- `00B_DEPENDENCY_MAP.md`
- `00F_PROPOSED_TARGET_ARCHITECTURE.md`
- `00G_FIRST_FOUNDATION_MILESTONE.md`

## Tests performed

- Inspected live RLS policies and function grants.
- Inspected critical RPC definitions and internal role checks.
- Inspected storage bucket visibility and Edge Function implementation.
- Ran Supabase security and performance advisors.
- Compared current lifecycle states with directive requirements.

## Risks discovered

- Legal contract invalidity for public use.
- Re-identification through detailed cohort context.
- Evidence-access design is absent.
- Migration drift can invalidate security assumptions.
- No operating moderation capacity is evidenced.

## Outstanding dependencies

- Qualified Malaysian legal review.
- Evidence retention decision.
- Named moderation/verification owners.
- Redaction vendor security/privacy review.
- Vercel protected-preview access for runtime testing.

## Handoff

Sub-Agent D must design evidence tables, bucket policies, audit logs, and capability checks before E builds verification UI. Sub-Agent H must test prohibited access for anonymous, contributor, institution, moderator, admin, and service roles.

---

# Lane D — Data Architecture, Supabase, Backend, and Security

## Findings

1. Live reference catalogue is large; product catalogue is empty.
2. No campus or programme-campus offering entity exists.
3. INPOLOR frontend/server identity contracts disagree.
4. Frontend/live declaration contracts disagree.
5. `reviews` mixes normalized ratings with opaque JSONB narratives.
6. `review_versions`, moderation, reports, and responses provide useful primitives.
7. Global `profiles.role` cannot represent independent capabilities.
8. Global `has_unlocked_tea` is not scoped or revocable.
9. Main migrations, PR #3, and live migration history diverge.
10. Candidate duplicate programme records require source-aware reconciliation.

## Decisions made

- Reference IDs remain provenance IDs.
- Product IDs remain transitional public targets until the canonical hierarchy is introduced.
- Do not merge PR #3 wholesale.
- Source-of-truth convergence precedes new schema expansion.
- Introduce the target hierarchy additively with dual-read/dual-write and rollback.
- Use normalized tables for fields requiring filters, aggregation, moderation, and reporting.

## Assumptions

- Existing `universities` and `courses` can be transitional sources during migration.
- Existing review IDs can be retained while normalized child tables are introduced.
- Existing published projection can be evolved rather than discarded immediately.

## Files created or changed

- `00A_SYSTEM_ARCHITECTURE_MAP.md`
- `00B_DEPENDENCY_MAP.md`
- `00F_PROPOSED_TARGET_ARCHITECTURE.md`
- `00G_FIRST_FOUNDATION_MILESTONE.md`
- `04_DECISION_LOG.md`

## Tests performed

- Inspected live migrations, tables, columns, constraints, row counts, views, RLS, function grants, definitions, storage, and Edge Functions.
- Inspected candidate duplicate groups without mutating data.
- Compared live state with main and PR #3 patches.

## Risks discovered

- Unsafe blind migration push.
- Broken standard review submission.
- Public base-table exposure.
- Privileged RPC surface requiring explicit tests.
- Missing verification and entitlement domains.

## Outstanding dependencies

- Final migration reconciliation approach.
- Product/trust decisions on verification and entitlement.
- Campus/programme source mapping rules.
- Legal evidence-retention decision.

## Handoff

The implementation agent should begin with the convergence milestone, not the full canonical model. Every migration must be additive, tested from a clean database, compared with staging, and accompanied by rollback instructions.

---

# Orchestrator resolution

## Cross-lane conflicts resolved

### “Fix PR #3” versus “start clean”

PR #3 contains useful fixes and tests, but it is not a coherent source of truth because live staging has partially diverged and the declaration contract remains broken. The resolved approach is to port audited changes into a fresh foundation branch and supersede PR #3.

### “Publish the broad catalogue” versus “density first”

Reference data remains available for reconciliation and internal discovery, but public product pages are limited to reviewed, linked, published programme-campus profiles.

### “Reduce friction” versus “add verification”

The product must reduce repetitive writing while adding a transparent verification step. Friction is not reduced by removing trust controls; it is reduced by sequencing, method choice, save-and-resume, and clear value.

### “Use existing university score” versus “programme confidence”

Existing university averages may remain only as transitional internal data. Relaunch public decisions require programme-campus distributions and confidence gates.

## Orchestrator decisions

1. Phase 0 audit is complete when these documents and task-board updates are merged.
2. First runtime milestone: source-of-truth convergence and working standard-review lifecycle.
3. PR #3 should be superseded, not merged wholesale.
4. Phase 1 can begin in parallel at the documentation/design level after the foundation contract is stable, but runtime UI work remains gated by backend/trust decisions.
5. No production data mutation or public launch occurs during the foundation milestone.

## Next-agent instructions

The foundation implementation agent must:

1. branch from the latest `main` after Phase 0 merge;
2. reconcile PR #3 intent against live staging;
3. define a shared declaration contract;
4. use canonical product university IDs;
5. add isolated lifecycle tests with cleanup;
6. preserve no-fake-data and identity-separation guarantees;
7. publish a migration/rollback report before staging changes.
