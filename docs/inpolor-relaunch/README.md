# INPOLOR Relaunch Governance

**Status:** Active and approved  
**Adopted:** 2026-08-19  
**Phase 0 completed:** 2026-08-20  
**Scope:** INPOLOR relaunch and product rebuild

## Authority order

1. [`MASTER_DIRECTIVE.md`](./MASTER_DIRECTIVE.md) is the authoritative source for relaunch objectives, product principles, execution phases, required deliverables, agent responsibilities, guardrails, and acceptance criteria.
2. Current-state facts must be verified against the repository, Supabase migrations and live schema, configured environments, and deployed applications. The directive defines the intended direction; it does not replace evidence about what currently exists.
3. [`04_DECISION_LOG.md`](./04_DECISION_LOG.md) records approved interpretations, deviations, and decisions that refine or supersede part of the directive.
4. [`TASK_BOARD.md`](./TASK_BOARD.md) records execution status, dependencies, ownership, testing, and deployment requirements.

## Phase 0 deliverables

| Document | Purpose |
|---|---|
| [`00_CURRENT_STATE_AUDIT.md`](./00_CURRENT_STATE_AUDIT.md) | Evidence-backed audit of all 20 required current-state areas |
| [`00A_SYSTEM_ARCHITECTURE_MAP.md`](./00A_SYSTEM_ARCHITECTURE_MAP.md) | Current applications, data planes, identities, trust boundaries, storage, CI, and deployment map |
| [`00B_DEPENDENCY_MAP.md`](./00B_DEPENDENCY_MAP.md) | Critical sequencing, cross-portal dependencies, external blockers, and phase gates |
| [`00C_PRODUCT_GAP_AND_FUNNEL.md`](./00C_PRODUCT_GAP_AND_FUNNEL.md) | User jobs, discovery/contribution gaps, feature disposition, measurement requirements, and campus readiness |
| [`00D_TRUST_PRIVACY_RISK_REGISTER.md`](./00D_TRUST_PRIVACY_RISK_REGISTER.md) | Prioritised trust, privacy, security, moderation, legal, fraud, and release risks |
| [`00E_SUBAGENT_ASSIGNMENTS_AND_HANDOFFS.md`](./00E_SUBAGENT_ASSIGNMENTS_AND_HANDOFFS.md) | Specialist lane findings, decisions, assumptions, tests, risks, dependencies, and handoffs |
| [`00F_PROPOSED_TARGET_ARCHITECTURE.md`](./00F_PROPOSED_TARGET_ARCHITECTURE.md) | Proposed canonical, verification, review, entitlement, moderation, analytics, and migration architecture |
| [`00G_FIRST_FOUNDATION_MILESTONE.md`](./00G_FIRST_FOUNDATION_MILESTONE.md) | First runtime milestone, scope, exclusions, tests, staging sequence, rollback, and definition of done |

## Phase 0 conclusion

The live environment has a large reference catalogue but no usable product/review supply. The immediate P0 is not homepage redesign or nationwide catalogue expansion. It is source-of-truth convergence and a working standard review lifecycle.

The first implementation milestone is:

> **Source-of-Truth Convergence and Working Standard Review Lifecycle**

It must align repository migrations, live staging, declaration payloads, canonical product IDs, review submission, moderation, public projection, and isolated lifecycle tests before wider relaunch implementation.

## Conflict handling

Existing INPOLOR plans and specifications remain useful historical or supporting references. Where an older document conflicts with the target direction in the master directive, the master directive and any later accepted decision-log entry take precedence.

No material deviation may be introduced silently. It must be documented in the decision log with evidence, trade-offs, reversibility, owner, and follow-up date.

## Execution posture

- Phase 0 audit and dependency mapping are complete.
- Execute REL-007 before large relaunch feature work.
- Keep product, trust, data, frontend, analytics, growth, and QA workstreams coordinated through explicit handoffs.
- Do not publish fabricated reviews, misleading aggregates, or demo data as real evidence.
- Do not expose reviewer identity or verification evidence to institution roles.
- Prefer reversible, feature-flagged, tested changes.
- Do not merge PR #3 wholesale; port verified changes into the new foundation implementation and document supersession.
- Do not select launch campuses without relationship/access and moderation-capacity evidence.
- Do not enable public collection before verification, legal, and moderation release gates are satisfied.

## Required progress report

After every major phase, report in Bahasa Melayu using the structure required by the master directive:

- Fasa selesai
- Apa yang telah dibuat
- Keputusan penting
- Fail yang berubah
- Ujian yang dijalankan
- Risiko yang ditemui
- Perkara yang masih belum selesai
- Fasa seterusnya
