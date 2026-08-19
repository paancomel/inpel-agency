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
