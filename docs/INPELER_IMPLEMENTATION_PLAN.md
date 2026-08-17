# INPELER Version 1 — Implementation Plan

**Parent goal:** Upgrade INPELER to the approved Version 1 specification  
**Source specification:** `docs/INPELER_IMPROVEMENT_SPEC.md`  
**Target outcome:** 30 complete and verified private institutions by 15 November 2026  
**Execution model:** One founder/operator; implementation and operations may be manual where that reduces risk.

## 1. Delivery strategy

Build from the server-authoritative boundary outward. Database contracts, role/domain rules, publication/audit records, and INPOLOR entitlements must be stable before expanding UI and automation. Existing local draft recovery remains useful for resilience but never becomes the source of truth for verification, publishing, or rights.

All Version 1 capabilities are in scope. “Phased” below describes implementation order and verification gates, not features deferred from the first release.

## 2. Workstreams and exit gates

### Workstream A — Data and security foundation

**Scope**

- institution status fields: verification, completeness, suspension, support state;
- institution-domain mapping and manually approved domain exceptions;
- institution representatives and transferable admin role;
- append-only publication versions and audit events;
- server-side completion and INPOLOR entitlement functions;
- RLS, indexes, and ownership checks for all new tables/functions.

**Exit gate:** SQL contract tests prove cross-institution isolation, domain verification, admin transfer, suspension, append-only history, and entitlement revocation.

### Workstream B — Verification and onboarding

**Scope**

- institutional-email verification flow;
- automatic rejection of public email providers;
- self-registration and founder invitation paths;
- shared-domain multi-representative access;
- admin transfer, removal, and recovery;
- BM/English language selection retained across auth and wizard.

**Exit gate:** Browser test demonstrates a new representative from a valid domain, a rejected Gmail/Yahoo attempt, a second representative, transfer, removal, and suspended-domain behavior.

### Workstream C — Guided profile wizard and import

**Scope**

- seven required profile components;
- step-level validation and completion indicators;
- save/resume draft behavior;
- mobile-responsive editor;
- documented import template, validation, preview, and error report;
- MQA reference fields/links without verification gating.

**Exit gate:** A test fixture can be entered manually and imported, both produce the same validated domain model, and incomplete profiles cannot publish.

### Workstream D — Immediate publishing and history

**Scope**

- publish all required components as one server-authoritative operation;
- immediate public projection update;
- version snapshot, field-level change log, author, timestamp, and source;
- restore previous version as a new audited event;
- asset ownership and rollback preservation.

**Exit gate:** Publish, edit, publish again, inspect history, restore, and verify that the public projection changes immediately without partial writes.

### Workstream E — Operations dashboard and reminders

**Scope**

- funnel metrics: invited, verified, completing, complete, published;
- needs-help queue, domain exceptions, suspensions, and follow-ups;
- email + dashboard notifications on days 3, 7, and 14;
- idempotent scheduled delivery;
- Day 14 `needs_help` and three-working-day follow-up target;
- export for founder operations.

**Exit gate:** A controlled clock/test fixture receives each reminder once, transitions to `needs_help`, and appears in the correct dashboard queue.

### Workstream F — INPOLOR official integration

**Scope**

- entitlement derived from verified + complete + unsuspended state;
- immediate official-response rights;
- direct publication of institution-authored content;
- blue institutional badge with appropriate icon;
- entitlement removal on suspension;
- server-authoritative tests across both portals.

**Exit gate:** A complete verified institution can publish an official response with a badge; an incomplete or suspended institution cannot; historical content remains auditable.

### Workstream G — Analytics, quality, and release

**Scope**

- funnel and time-to-completion analytics;
- privacy-safe aggregation;
- unit, integration, RLS/pgTAP, component, and browser tests;
- BM/English accessibility and responsive checks;
- staging release runbook, evidence capture, rollback and support rehearsal;
- update PRD, README, legal/data-collection audit, and release documents.

**Exit gate:** All quality gates pass and the staging checklist can be repeated for 30 institution records without manual data repair.

## 3. Suggested execution sequence

1. Freeze the new contract in migration/types tests and map every existing table/RPC that will be reused.
2. Implement Workstream A and prove RLS/entitlement behavior before UI changes.
3. Implement Workstream B and connect it to the existing auth/session gates.
4. Refactor the existing profile editor into Workstream C’s seven-step wizard and add import.
5. Replace insert-oriented publishing with Workstream D’s versioned publish operation.
6. Build the founder dashboard and reminder worker in Workstream E.
7. Wire Workstream F to the existing INPOLOR publication path and badge rendering.
8. Finish Workstream G, run staging rehearsal, and update all source-of-truth documents.

## 4. Operating cadence for a solo owner

- Daily: clear verification/publishing errors and review the needs-help queue.
- Weekly: inspect funnel metrics, domain exceptions, failed reminders, and audit events.
- Every workstream: add the smallest regression test before changing the next boundary.
- Every release: capture browser evidence for representative, admin, public, and suspended states.

## 5. Stop conditions

Do not mark Version 1 ready if any of these remain unresolved:

- rights are granted from client state only;
- a public email can pass verification;
- an incomplete profile can publish;
- a representative can access another institution;
- version history cannot explain or restore a public change;
- reminders duplicate or silently fail;
- INPOLOR shows an official badge for a suspended/unverified institution.

## 6. First implementation slice

The next concrete slice is Workstream A: add the domain/representative/status/version/audit contract and its security tests. This creates the stable backend boundary needed by every subsequent workstream and is the highest-leverage change for the 30-institution target.
