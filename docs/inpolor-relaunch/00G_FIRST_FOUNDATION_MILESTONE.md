# First Foundation Milestone — Source-of-Truth Convergence and Working Standard Review Lifecycle

**Milestone ID:** REL-007  
**Priority:** P0  
**Owner:** Orchestrator, Backend/Data, Frontend, Trust/QA  
**Deployment posture:** Feature-flagged/internal staging only  
**Production data changes:** Prohibited in this milestone without separate explicit approval

## 1. Objective

Establish one coherent, tested contract across:

- current `main`;
- versioned Supabase migrations;
- live staging schema and migration history;
- INPOLOR catalogue identity;
- review payload declarations;
- standard review submission;
- moderation publication;
- public review projection and summary;
- CI and disposable integration tests.

The milestone is complete only when one isolated standard review can move through:

```text
linked product institution
  → authenticated 18+ contributor
  → valid standard review submission
  → moderator publication
  → identity-free public projection
  → updated summary/confidence input
  → complete fixture cleanup
```

No fake public university or review data may be retained to satisfy the test.

## 2. Why this milestone comes first

Current evidence shows:

1. the frontend declaration version/keys differ from the live RPC;
2. the frontend uses reference institution IDs, while the RPC requires `universities.id`;
3. main migrations do not reconstruct live staging;
4. PR #3 contains useful fixes but is based on an older main and differs from live policies;
5. public product/review supply is zero;
6. no future campus, verification, analytics, or UX work can be trusted while the base review lifecycle is broken.

This is a convergence milestone, not the full relaunch architecture.

## 3. Decision: supersede PR #3 rather than merge it wholesale

### Preserve from PR #3

Port or reproduce only changes that are revalidated against current main and live staging, including:

- canonical product university ID use in INPOLOR;
- safe published-review mapping;
- `mainExperience` public projection compatibility;
- explicit ranking eligibility and unknown-cost handling;
- onboarding DOB durability and error visibility;
- missing-university wizard validation fix;
- report queue target validation without automatic takedown;
- publish-time unlock behaviour pending entitlement replacement;
- INPELER pending facility-asset readiness;
- updated pgTAP contracts and critical regression tests;
- appropriate view/RLS hardening after comparing live policies.

### Do not inherit blindly

- broad `USING (true)` catalogue policies proposed in PR #3;
- migration timestamps/history that conflict with live execution records;
- duplicated manual staging reconciliation;
- declaration constants that still do not match live staging;
- any change whose authorisation intent is not covered by role tests.

### Closure path

After the new milestone PR contains equivalent or better tested fixes:

1. document which PR #3 changes were ported, replaced, or deferred;
2. close PR #3 as superseded;
3. preserve links and attribution in the new PR description.

## 4. In scope

### 4.1 Repository/live migration reconciliation

- Capture the live staging schema/function/policy state required by the milestone.
- Add a versioned, additive reconciliation migration on current main.
- Avoid recreating already-applied objects with incompatible definitions.
- Document live migration-history mapping and safe future deployment command sequence.
- Ensure a clean local database produces the intended final contract.
- Do not use blind `supabase db push` until the reconciliation check passes.

### 4.2 Shared declaration contract

Choose one canonical declaration schema and version. Recommended form:

```ts
type ReviewDeclarationsV1 = {
  version: "inpolor-review-v1";
  adult: true;
  rights: true;
  terms: true;
  privacy: true;
};
```

The exact version string may preserve the live version instead, but the following must be true:

- one shared constant/type exists in application code;
- the RPC validates exactly the same keys/version;
- old unsupported payloads receive a clear error;
- declaration receipt stores the accepted version;
- unit and database tests cover missing, false, extra-version, and valid cases;
- legal copy is not falsely treated as final—the staging acceptance remains internal until legal approval.

### 4.3 Canonical review target during transition

Use separate fields:

```ts
type CatalogueInstitution = {
  referenceInstitutionId: string;
  universityId: string | null;
};
```

Rules:

- public review submission requires a non-null product `universityId`;
- reference ID remains provenance only;
- INPOLOR public directory reads the curated `inpolor_catalog_institutions` view, not the unrestricted reference catalogue;
- a reference-only record may be searchable internally but cannot receive public reviews;
- summaries and published reviews are keyed by product university ID;
- tests reject a reference ID masquerading as a product ID.

### 4.4 Standard review payload alignment

Define a typed server contract covering:

- product university ID;
- optional product course ID;
- course display name during transition;
- study year or approved study-period representation;
- eight current ratings during the transitional milestone;
- optional monthly cost;
- structured content including `mainExperience`;
- acquisition source/campaign allow-list;
- declarations.

The milestone does not redesign the full four-step relaunch form yet. It makes the current standard path correct, explicit, and recoverable.

### 4.5 Error and idempotency behaviour

- Do not return “demo” or “local” for a real cloud failure.
- Distinguish offline draft, authentication required, validation failure, retryable server failure, and submitted status.
- Preserve local draft only as recovery, not as false success.
- Avoid duplicate active review creation on retries.
- Return stable review ID and status from the RPC.
- Log or surface a correlation-safe error code without PII.

### 4.6 Moderation and public projection

- Standard review remains private until moderator publication.
- Moderator publication records an audit action.
- Public projection uses `mainExperience` and current structured ratings.
- Projection contains no reviewer ID, email, DOB, evidence, or internal notes.
- Hidden/rejected/removed reviews do not appear publicly.
- One ordinary report does not automatically hide content.
- Global unlock may remain temporarily for compatibility only if granted after publish and clearly marked for replacement by scoped entitlements.

### 4.7 Catalogue/RLS hardening

Review and test:

- curated public catalogue views as `security_invoker`;
- source table policies needed for those views;
- public base `universities/courses` access;
- `private.reference_import_runs` RLS;
- anonymous institution-entitlement function grant;
- raw review owner/moderator policies;
- institution member boundaries.

Do not blanket-revoke authenticated RPCs that are legitimate API boundaries. Test their internal authorisation instead.

### 4.8 INPELER readiness correction

Count a selected pending facility file as evidence for frontend readiness before upload, while keeping the server authoritative after upload.

This is included because a linked product institution cannot be prepared reliably if first-time facility uploads are permanently blocked.

## 5. Out of scope

- final campus/programme-offering schema;
- student/alumni verification evidence;
- scoped entitlement implementation;
- four-step relaunch UX redesign;
- homepage redesign;
- analytics provider/instrumentation;
- moderator dashboard;
- appeals and withdrawal UX;
- reward payment/photo relaunch;
- Q&A/comments;
- campus selection;
- production launch;
- destructive legacy-table retirement.

## 6. Proposed implementation lanes

### Lane 1 — Contract and migration reconciliation

Files likely affected:

- new `supabase/migrations/20260820..._review_contract_convergence.sql`;
- migration reconciliation notes;
- generated/hand-maintained database types;
- pgTAP tests.

Outputs:

- final RPC/function definitions;
- final grants and policies;
- migration-history mapping;
- rollback instructions.

### Lane 2 — INPOLOR frontend contract

Files likely affected:

- `apps/portal-parent/src/lib/community-data.ts`;
- `apps/portal-parent/src/lib/review-data.ts`;
- `apps/portal-parent/src/lib/types.ts`;
- `apps/portal-parent/src/lib/storage.ts`;
- `apps/portal-parent/src/components/AuthModal.tsx`;
- `apps/portal-parent/src/components/ReviewWizard.tsx`;
- `apps/portal-parent/src/components/PortalExperience.tsx`;
- targeted tests.

Outputs:

- canonical product ID flow;
- shared declaration constant;
- explicit submission errors;
- durable onboarding draft;
- ranking/cost correctness.

### Lane 3 — INPELER readiness

Files likely affected:

- `apps/portal-student/src/lib/validation.ts`;
- `apps/portal-student/src/routes/ReviewPage.tsx`;
- tests.

### Lane 4 — Integration and release verification

Files likely affected:

- `packages/database/audit-flow.test.ts` or a dedicated lifecycle test;
- `.github/workflows/local-quality.yml` only if necessary;
- staging audit workflow/runbook;
- release evidence documentation.

## 7. Required test matrix

### Unit/component

- catalogue mapper preserves `referenceInstitutionId` and `universityId` separately;
- unlinked institutions cannot be selected for review;
- review payload matches declaration contract exactly;
- missing university shows field error without crash;
- cloud failure is not reported as success/demo;
- onboarding state survives the expected auth return path and expires safely;
- unknown living cost fails numeric cost filters;
- ranking appears only when eligible;
- pending INPELER facility file satisfies frontend readiness.

### Database/pgTAP

- valid declaration accepted and receipt recorded;
- each missing/false declaration rejected;
- unsupported declaration version rejected;
- anonymous submit denied;
- authenticated under-18/no-DOB submit denied;
- reference institution ID rejected as product target;
- valid product university accepted;
- owner can read raw review; another contributor cannot;
- institution member cannot read reviewer profile/raw review;
- moderator can publish through RPC but contributor cannot self-publish;
- published projection omits identity and displays `mainExperience`;
- hidden/rejected content is absent from public projection;
- report target must be publicly available;
- RLS state for reference import and curated catalogue is explicit.

### Isolated integration

Create disposable fixtures in an authorised non-production environment:

1. create test Auth users for contributor, moderator, institution member, and intruder;
2. create product institution, reference link, portal visibility, and optional course;
3. onboard contributor as 18+;
4. submit a standard review through the public RPC;
5. prove intruder/institution cannot read raw ownership data;
6. moderate and publish as moderator;
7. read public projection as anonymous;
8. verify summary inputs;
9. submit a report without automatic takedown;
10. clean every review, link, institution, profile, and Auth fixture;
11. verify cleanup.

Fixtures must be clearly prefixed, isolated, and removed even after test failure.

### Browser/deployed smoke

When protected preview access is available:

- directory loads without fake rows;
- only linked/published institution is selectable;
- authentication callback restores onboarding state;
- current review can be completed without runtime error;
- explicit failure and success states render;
- published review appears after moderation fixture step;
- no identity is present in page/network payloads;
- mobile layout and keyboard navigation receive a basic smoke check.

## 8. Definition of done

- Current main, clean local database, and staging expose the same reviewed contract for the milestone.
- Migration history is documented and a safe deployment sequence exists.
- Standard review submission succeeds against the intended RPC.
- Reference IDs and product IDs cannot be confused by types or tests.
- Declarations are versioned and identical on client/server.
- Cloud failures are explicit and recoverable.
- Moderator publication creates an identity-free public projection.
- Institution and unrelated users cannot access reviewer identity/raw review.
- All application checks and pgTAP tests pass.
- Isolated integration test passes and proves cleanup.
- No synthetic product/review data remains after verification.
- PR #3 is documented as superseded or reduced to any genuinely independent remainder.
- Known legal/verification limitations remain clearly flagged; the milestone does not claim public-launch readiness.

## 9. Deployment sequence

1. Build and test on the fresh foundation branch.
2. Rebuild local Supabase from all migrations.
3. Run pgTAP and application quality checks.
4. Run isolated remote integration against authorised staging.
5. Review migration diff and rollback instructions.
6. Apply the additive reconciliation migration to staging only.
7. Re-run contract queries and advisors.
8. Deploy preview applications.
9. Run browser smoke with disposable fixtures.
10. Merge only when evidence is attached to the PR.
11. Do not deploy production or retain fixtures.

## 10. Rollback plan

- Keep all new schema changes additive where possible.
- Preserve old RPC signature temporarily only if required for rollback, but revoke browser access to unsafe legacy variants.
- Feature-flag new catalogue/review behaviour default-off until staging passes.
- Store previous function/view definitions in the migration rollback note.
- If submission fails after staging migration, disable the new UI flag and restore the prior RPC/view definition.
- Do not drop legacy columns/tables in this milestone.
- Clean test fixtures independently from migration rollback.

## 11. Success evidence to attach to the implementation PR

- application CI run;
- pgTAP run;
- isolated integration run and cleanup proof;
- migration list before/after;
- function signatures and grants before/after;
- RLS policy summary;
- anonymous public projection sample containing no PII;
- browser screenshots or automated trace for the staged journey;
- Supabase advisor findings and accepted follow-ups;
- PR #3 supersession mapping.

## 12. Handoff after completion

After this milestone passes, Phase 1 may finalise:

- product strategy and relaunch scope;
- four-step review UX;
- verification methods and retention;
- scoped Reality Report entitlement;
- confidence thresholds;
- privacy-safe analytics;
- first-three-campus selection rubric and evidence collection.
