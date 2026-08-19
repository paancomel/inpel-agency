# INPOLOR Relaunch Governance

**Status:** Active and approved  
**Adopted:** 2026-08-19  
**Scope:** INPOLOR relaunch and product rebuild

## Authority order

1. [`MASTER_DIRECTIVE.md`](./MASTER_DIRECTIVE.md) is the authoritative source for relaunch objectives, product principles, execution phases, required deliverables, agent responsibilities, guardrails, and acceptance criteria.
2. Current-state facts must be verified against the repository, Supabase migrations and live schema, configured environments, and deployed applications. The directive defines the intended direction; it does not replace evidence about what currently exists.
3. [`04_DECISION_LOG.md`](./04_DECISION_LOG.md) records approved interpretations, deviations, and decisions that refine or supersede part of the directive.
4. [`TASK_BOARD.md`](./TASK_BOARD.md) records execution status, dependencies, ownership, testing, and deployment requirements.

## Conflict handling

Existing INPOLOR plans and specifications remain useful historical or supporting references. Where an older document conflicts with the target direction in the master directive, the master directive and any later approved decision-log entry take precedence.

No material deviation may be introduced silently. It must be documented in the decision log with evidence, trade-offs, reversibility, owner, and follow-up date.

## Execution posture

- Complete Phase 0 audit and dependency mapping before large relaunch implementation.
- Keep product, trust, data, frontend, analytics, growth, and QA workstreams coordinated through explicit handoffs.
- Do not publish fabricated reviews, misleading aggregates, or demo data as real evidence.
- Do not expose reviewer identity or verification evidence to institution roles.
- Prefer reversible, feature-flagged, tested changes.
- Keep the existing critical-platform hardening PR separate; adoption of this directive does not automatically broaden that PR's scope.

## Required progress report

After every major phase, report in Bahasa Melayu using the structure required by the master directive: completed phase, concrete output, decisions, changed files, tests, risks, outstanding work, and next phase.
