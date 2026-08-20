# Phase 0 Trust, Privacy, and Moderation Risk Register

**Audit date:** 20 August 2026  
**Scope:** INPOLOR relaunch, shared Supabase backend, and cross-portal dependencies.  
**Legal posture:** This document identifies product, privacy, security, and operational risks. It is not legal advice.

## 1. Rating method

### Likelihood

- **High:** expected to occur or already evidenced.
- **Medium:** plausible under current design or operating conditions.
- **Low:** possible but requires uncommon conditions.

### Impact

- **Critical:** blocks core operation, can expose sensitive identity/evidence, or creates material legal/security harm.
- **High:** seriously harms trust, product correctness, or launch safety.
- **Medium:** degrades conversion, operations, or data quality.
- **Low:** limited or recoverable impact.

## 2. Priority risks

| ID | Risk | Likelihood | Impact | Evidence/current state | Mitigation | Owner | Dependency/status |
|---|---|---:|---:|---|---|---|---|
| R-001 | Review declaration contract mismatch | High | Critical | Frontend sends `inpolor-review-v1` and different keys from live RPC | Define one shared versioned contract; frontend/server tests; reject unsupported versions clearly | Backend + Frontend | First foundation milestone |
| R-002 | Reference institution ID used as product review target | High | Critical | UI uses `reference_institution_id`; RPC requires `universities.id` | Separate provenance ID from product ID; publish only reviewed links; test submit target | Data + Frontend | First foundation milestone |
| R-003 | No private student/alumni verification architecture | High | Critical | No verification case/evidence entities; DOB only proves age | Private schema/bucket, methods, consent, retention, access audit, public status projection | Trust + Backend | Phase 1/2 |
| R-004 | Public anonymity is overstated | High | High | UI says “Always anonymous”; detailed context can identify a small cohort | Honest copy, cohort generalisation, prohibited fields, moderator guidance | Trust + UX | Phase 1 |
| R-005 | Draft legal notices are rendered as user contracts | High | Critical | Privacy notice says “Do not publish”; legal controller and placeholders unresolved | Gate public consent routes; complete entity details; Malaysian counsel review; version consent | Product + Legal | External blocker |
| R-006 | `private.reference_import_runs` has RLS disabled | Medium | High | Live Supabase inventory flags the table | Determine intended callers; enable RLS with explicit service/admin policy; test before apply | Backend + Security | First foundation or dedicated hardening |
| R-007 | Public base-table reads bypass curated catalogue visibility | Medium | High | `universities` and `courses` use public `SELECT USING (true)` | Restrict public reads to published-safe projections or safe row conditions | Backend + Security | Phase 2 |
| R-008 | Single global profile role causes cross-portal privilege conflict | High | High | `profiles.role` permits only one role | Add capabilities/memberships; preserve identity separately; migrate additively | Backend | Phase 2 |
| R-009 | Global `has_unlocked_tea` is overbroad and inconsistently granted | High | High | Reward submit and moderation can grant global access; no scope/revocation | Scoped `review_entitlements`; explicit provisional/approved/revoked states | Product + Backend | Phase 1/2 |
| R-010 | Sensitive browser drafts persist indefinitely | Medium | High | INPOLOR/INPEL use localStorage without coordinated TTL/clear-device control | Versioned schemas, TTL, clear-device action, minimum local data, server save-and-resume | Frontend + Privacy | Phase 2/3 |
| R-011 | Repository/live migration drift creates unsafe deployment | High | Critical | Live includes reconciliation migrations not present/aligned in main | Reconcile history and final schema; additive idempotent migration; prohibit blind push | Backend + Release | First foundation milestone |
| R-012 | Appeals, withdrawal, and revision operations are incomplete | High | High | Backend statuses/UX do not support complete lifecycle | Add policy, status transitions, audit, user notifications, queues | Trust + Backend + Frontend | Phase 2/4 |
| R-013 | Future analytics may leak identity or review evidence | Medium | Critical | No analytics boundary exists | Typed allow-list events; prohibit raw text/email/evidence; automated payload tests | Analytics + Security | Phase 1/3 |
| R-014 | Photo Edge Function relies on manual auth while `verify_jwt=false` | Medium | High | Deployed function manually validates token and ownership | Keep fail-closed; function integration tests; rate limits; observability; review config | Backend + Security | Phase 2 |
| R-015 | Exact context can re-identify small cohorts | High | High | Course/year plus narrative detail is publicly useful but potentially identifying | Configurable k-threshold, generalisation, suppression, moderator prompts | Trust + Data | Phase 1/2 |
| R-016 | Reward-review burden and payment surface invite fraud/abandonment | Medium | High | 13 long narratives, 16–40 photos, payment tables/RPCs | Postpone; retain behind internal flag; redesign incentives as sentiment-neutral | Product + Trust | Deferred from MVP |
| R-017 | Candidate duplicate catalogue records can fragment density | High | Medium | 816 programme-name candidate groups; 86 repeated reference numbers | Source-aware reconciliation, campus/effective-period context, manual review | Data | Phase 2 |
| R-018 | No verified moderation or verification operating capacity | High | Critical | No live profiles/moderators, no dashboard, no staffing evidence | Name owners, train moderators, capacity model, incident escalation, pilot limits | Operations + Product | Public-launch blocker |
| R-019 | Review failure may be shown as local/demo success | High | High | Auth/RPC errors are caught and downgraded | Typed error states, retries, idempotency, no false success | Frontend + Backend | First foundation milestone |
| R-020 | Tiny samples may produce misleading scores or SEO markup | High | High | UI can show score with one review; no dynamic noindex/confidence service | Enforce thresholds in server projections and UI; no rating schema below gate | Data + UX + SEO | Phase 1/2/3 |
| R-021 | Institution record/public asset rights may be unclear | Medium | Medium | Public URLs/uploads accepted; no complete rights/approval workflow | Attestation, upload source audit, asset replacement/removal policy | INPELER + Legal | Phase 2/4 |
| R-022 | Anonymous entitlement RPC exposes a privileged surface | Medium | Medium | `get_institution_entitlement` is anonymous and security-definer | Make invoker/public view or narrowly justify and test output | Backend + Security | First foundation/hardening |
| R-023 | Unconfirmed auth account without profile indicates incomplete onboarding | Medium | Low | One live unconfirmed user; no profiles | Cleanup/expiry policy, onboarding observability, no public assumption | Auth + Operations | Phase 2 |
| R-024 | External redaction-provider dependency may fail or mishandle data | Medium | High | Photo processing sends data to an external provider | Vendor security/DPA review, minimal transfer, fail-closed, deletion and audit | Privacy + Backend + Legal | Before photo reward relaunch |

## 3. Existing controls worth preserving

### Identity and content separation

- Raw `reviews` are owner/moderator-readable rather than public.
- `published_reviews` omits reviewer identity.
- Institution members do not receive broad profile access.
- Moderator/admin checks are implemented in private helper functions.

These controls are a good base, but they protect account identity only. They do not yet separate verification evidence because that subsystem is absent.

### Moderation and audit

- Review moderation transitions are server-controlled.
- `moderation_actions` records actor, action, content, note, and timestamp.
- Ordinary reports enter a queue without one report automatically hiding content.
- Institution responses have a moderation status.

### Photo privacy

- Review photos use a private bucket.
- File signatures and declared MIME are checked.
- Redaction is fail-closed.
- metadata is stripped;
- originals are deleted before acceptance;
- signed preview URLs expire after ten minutes;
- public previews require a published projection.

### Catalogue provenance

- External source records are separate from product universities/courses.
- Link records have pending/verified/rejected status.
- Portal publication state is separate.

## 4. Verification risk model

The target verification subsystem must keep three domains separate:

```text
Identity domain
  auth user, email, consent, account security

Verification domain (private)
  method, evidence path, reviewer, status, retention, access log

Public contribution domain
  anonymous label, generalised cohort, review content, moderation state
```

### Required restrictions

- Institution roles must never query verification cases or evidence.
- Public projections must never include evidence metadata, raw email, reviewer ID, exact verification time, or internal notes.
- Evidence bucket must be private; URLs must be short-lived and issued only after explicit role checks.
- Access to evidence must be audited.
- Raw evidence must have an approved retention/deletion period.
- Verification status must be revocable without deleting the audit trail.
- Manual verification decisions require reason codes and reviewer identity.

### Verification methods requiring policy decisions

- official student email;
- redacted student card;
- redacted offer/enrolment letter;
- redacted portal screenshot;
- alumni evidence;
- authorised manual review;
- controlled ambassador verification.

No method should be enabled until required fields, redaction, retention, fraud checks, and user explanation are approved.

## 5. Cohort privacy model

### Risk

A public combination such as institution + campus + programme + exact year + international status + specialisation can narrow to one or two individuals even when the name is hidden.

### Required approach

1. Store only context necessary for product value and fraud/moderation.
2. Separate private context from public display fields.
3. Calculate a configurable public cohort size.
4. When below threshold, generalise or suppress one or more attributes.
5. Avoid exact evidence/verification timestamps publicly.
6. Include narrative moderation prompts for self-identifying details.
7. Prevent analytics segmentation that recreates tiny cohorts.

### Initial design default

Use a configurable threshold equivalent to at least three plausible people for public combinations. This is a product design default requiring privacy/legal review, not a legal guarantee.

## 6. Moderation lifecycle gap

### Current review states

```text
draft
submitted
pending
needs_correction
published
rejected
hidden_under_review
removed
```

### Missing explicit states/operations

- verification pending/failed;
- quality-check pending/failed;
- moderation pending;
- appealed;
- withdrawn;
- revision pending;
- evidence expired/deleted;
- entitlement revoked.

### Required transition controls

Every transition must record:

- previous state;
- next state;
- actor;
- timestamp;
- reason code;
- internal note;
- public explanation where appropriate;
- linked verification/version/report;
- notification result;
- entitlement consequence.

## 7. Report and appeals risks

Current reports use a generic polymorphic `content_type/content_id` relationship. The database cannot enforce a foreign key to every target table. Therefore:

- target existence must be validated server-side;
- duplicate active reports should be idempotent;
- report abuse needs rate limiting;
- institutions must not use reporting as a takedown shortcut;
- serious allegations require separate escalation handling;
- reviewer and institution appeal rights need distinct workflows;
- removal must preserve an internal audit record and public-safe explanation.

## 8. Institution-response risks

Institutions may be allowed to:

- correct objective facts;
- explain policy changes;
- acknowledge an issue;
- provide context about review age.

Institutions must not be allowed to:

- see reviewer identity/evidence;
- contact reviewers through the platform;
- edit reviews;
- order reviews;
- buy removal;
- publish unmoderated threats or accusations;
- use membership access to infer raw review ownership.

Institution-response permissions must be tied to verified active membership for the specific institution, not the global `university_rep` role alone.

## 9. Legal and policy review requirements

Qualified Malaysian counsel should review at minimum:

- legal data controller identity;
- PDPA notice and consent structure;
- student-verification evidence processing;
- evidence and account retention;
- deletion/access/correction requests;
- defamation and serious-allegation handling;
- institution takedown and response rights;
- minors and the 18+ INPOLOR gate;
- cross-border hosting and redaction vendors;
- security-incident and breach obligations;
- reward/ambassador terms;
- paid institution independence;
- community guidelines and appeal rules;
- terms versioning and proof of acceptance.

The current draft notices cannot serve as approved public contracts because they explicitly say not to publish and do not identify a completed controller.

## 10. Security-advisor interpretation

### Immediate review

- leaked-password protection disabled;
- anonymous `SECURITY DEFINER` institution-entitlement RPC;
- RLS disabled on `private.reference_import_runs`;
- public base-table reads;
- many authenticated-callable privileged RPCs.

### Do not remediate blindly

Some private tables intentionally use RLS with no policies to deny client access. Some authenticated `SECURITY DEFINER` RPCs are legitimate API boundaries and already perform internal role/ownership checks. Each function must be reviewed and tested individually rather than blanket-revoked.

Performance advisor findings, including unused indexes, are low-confidence while the product tables contain almost no usage. Missing foreign-key indexes and duplicate permissive policies should be assessed against planned query paths during Phase 2.

## 11. Launch blockers

Public review collection must remain blocked until:

- student/alumni verification exists;
- legal notice/terms are approved;
- moderation and escalation owners are named;
- report/appeal/withdrawal processes are usable;
- identity/evidence access tests pass;
- source-of-truth convergence is complete;
- one campus pilot is feature-flagged;
- analytics event payloads pass privacy tests;
- no critical/high security issue remains unresolved or explicitly accepted by the appropriate owner.

## 12. Risk handoff

The first foundation milestone should close R-001, R-002, R-011, and R-019, and should either remediate or explicitly scope R-006 and R-022. Phase 1/2 must then design the verification, entitlement, cohort-privacy, moderation, and legal-control architecture before public acquisition begins.
