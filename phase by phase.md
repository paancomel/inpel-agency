# Agency Web — Phase by Phase Go-Live Plan

Last reviewed: 2026-07-22

This file is the working source of truth for the go-live preparation of the Agency Web / Inpel platform.

Before making any future change, Codex must:

1. Read this file completely.
2. Inspect the current repository files before assuming this document is still accurate.
3. Preserve the portal names, routes, contracts, validation copy, security boundaries, and user-approved scope described here.
4. Explain which phase the requested change belongs to.
5. Avoid unrelated changes, speculative features, migrations, remote writes, dependency installation, or production deployment unless explicitly requested.
6. Update this file only when the user explicitly asks for the plan or status document to be updated.

This document is a planning and context file. It does not grant permission to run destructive actions, connect to production, push migrations, expose secrets, or deploy.

---

## 1. User operating rules

The user wants this project handled step by step and source-faithfully.

Important rules:

- Do not hallucinate missing requirements.
- Search and read the relevant files before proposing or implementing changes.
- Do not create a new Supabase client inside an app.
- Use `@repo/database` as the only Supabase client and database type boundary.
- Do not run `supabase link`, `supabase db push`, or other remote writes without explicit authority and a safe isolated configuration.
- Never expose or request production secrets.
- Do not treat static checks, builds, or browser smoke tests as proof of production readiness when RLS, local database execution, legal controls, or live integration remain unvalidated.
- Preserve exact route paths, validation messages, request shapes, field names, and blueprint contracts unless the user explicitly changes them.
- Do not modify unrelated existing user work.

---

## 2. What the project is

Agency Web is a pnpm/Turborepo monorepo for the Inpel education platform.

It contains three React/Vite portals and shared Supabase/database/UI packages.

### 2.1 INPEL — university matching portal

Actual folder:

`apps/portal-universiti`

Purpose:

- Parent enters family priorities and creates a student invitation/session.
- Student completes a personality test, psychometric profile, SPM academic record, and Vibe Check.
- Student authenticates by email/password, Google, or Facebook when configured.
- The system produces university matches and career/ROI information.
- Checkout and report access are currently simulated/no-charge flows.

Routes:

- `/`
- `/email-notification/:id`
- `/student/:id`
- `/auth/callback?sessionId=:id`
- `/parent/:id`
- `/checkout/:id`
- `/results/:id`
- `/guide/:guideId`

Important behavior:

- Wizard progress is stored locally.
- Authentication drafts are cached before an auth redirect.
- Passwords and OAuth tokens must never be stored in browser drafts.
- Callback completion should follow this order: restore draft, authenticate, upsert records, mark session complete, persist local session, clear draft, navigate.
- A failed cloud write should preserve the draft for retry.
- The app can run in a local/demo fallback mode when Supabase is unavailable.

### 2.2 INPELER — institutional university portal

Actual folder:

`apps/portal-student`

Purpose:

- University representatives maintain institutional information.
- Representatives create university profiles, programmes, facilities, contacts, gallery images, and assets.
- Representatives review and publish the institution.

Routes:

- `/login`
- `/dashboard/global-profile`
- `/dashboard/courses`
- `/dashboard/courses/form`
- `/dashboard/courses/form?course=<id>`
- `/dashboard/review`
- `/dashboard/success`

Important behavior:

- Dashboard routes require authentication.
- Only `university_rep` and `admin` profiles may access the portal.
- The exact MQA validation message is: `MQA Accreditation Code is required.`
- Publishing is blocked when there are no programmes.
- Publishing is blocked until the Institution Accuracy Attestation is checked.
- Uploads accept PNG, JPEG, and WebP only, with a 5 MB limit.
- Uploaded paths are owner-scoped and must not use original filenames.
- If a later publish step fails, uploaded objects and the new university record must be removed to avoid partial publication.

Note: the folder name `portal-student` is historically misleading. It currently contains the university/course publishing portal. Do not rename it or reinterpret it without explicit instruction.

### 2.3 INPOLOR — student review portal

Actual folder:

`apps/portal-parent`

Purpose:

- Public university review feed.
- Multi-step review submission.
- Anonymous review support.
- Quick Review flow that unlocks `The Unspoken Truth` content.

Routes:

- `/`
- `/submit-review`
- `/quick-review`
- Unknown routes redirect to `/`.

Important behavior:

- Reviews are saved to versioned local storage first.
- Malformed local storage and quota errors must not crash the app.
- Anonymous submissions remove user identity before local persistence or database payload creation.
- The locked `The Unspoken Truth` CTA belongs inside each review card, beside the gated content.
- The redundant sidebar CTA should not be reintroduced.
- Cloud sync and magic-link authentication use the shared database client only when configured.

Note: the folder name `portal-parent` is historically misleading. It currently contains INPOLOR. Do not rename it or reinterpret it without explicit instruction.

---

## 3. Shared architecture

### 3.1 Monorepo

- Package manager: pnpm `11.7.0`
- Node requirement: Node.js `20+`
- Build orchestration: Turborepo
- Frontend: React, Vite, React Router v6, Tailwind CSS
- Workspace folders: `apps/*`, `packages/*`

### 3.2 Shared database boundary

The only Supabase client boundary is:

`packages/database`

Apps must import from `@repo/database`.

Never:

- call `createClient` inside an app;
- put a service-role or secret key in a `NEXT_PUBLIC_*` or `VITE_*` variable;
- bypass the shared TypeScript database contracts;
- invent a local duplicate of a shared payload type.

Main files:

- `packages/database/supabase.ts`
- `packages/database/types.ts`
- `packages/database/index.ts`
- `packages/database/audit-flow.test.ts`
- `packages/database/audit-flow.fixtures.ts`

### 3.3 Shared UI

Shared UI is in:

`packages/ui`

The shared cookie component is:

`packages/ui/src/CookieConsent.tsx`

Required contract:

- storage key: `inpel_cookie_consent`
- valid values: `all` and `essential`
- `Accept All` dispatches `consentGranted`
- invalid storage values fail closed
- storage failures fail closed
- non-essential trackers must not load before valid `all` consent

The component is mounted in all three portals.

---

## 4. Supabase schema currently represented

The initial schema defines 11 public tables:

- `profiles`
- `universities`
- `gallery_images`
- `courses`
- `sessions`
- `student_assessments`
- `recommendation_results`
- `payments`
- `reviews`
- `comments`
- `review_likes`

Migration files:

- `supabase/migrations/20260714024203_initial_schema.sql`
- `supabase/migrations/20260714050000_expand_portal_assessment_payloads.sql`
- `supabase/migrations/20260717153000_university_management_assets.sql`
- `supabase/migrations/20260719231138_university_management_grants.sql`

Rollback files exist under:

`supabase/rollback`

Database tests exist under:

`supabase/tests/database`

The expand migration keeps legacy JSONB columns while adding more explicit portal fields. This is an additive/dual-write compatibility strategy. Do not remove legacy columns without a deliberate migration plan.

---

## 5. Integration test result — 2026-07-22

The user ran:

```powershell
pnpm test:integration
```

Observed result:

- TypeScript integration compilation passed.
- Vitest started successfully.
- One integration test was discovered.
- The test failed in `requireAuditEnvironment()` at `audit-flow.test.ts:59`.
- Error: `Supabase integration audit credentials are incomplete.`

Required values were missing:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` or the accepted publishable-key alias
- `SUPABASE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY`

Interpretation:

- This was a preflight/environment failure.
- It was not an RLS failure.
- It was not a schema failure.
- It was not an application payload failure.
- The audit stopped before creating Auth users or inserting fixtures.
- No integration audit database writes should have occurred from this run.

Do not report the live integration audit as passed until the command connects to an isolated database and completes all assertions.

---

## 6. Current progress

### Built

- Three portal frontends with the main blueprint journeys.
- Shared Supabase client and typed database contracts.
- INPEL auth redirect draft persistence and hydration.
- INPELER university/course publishing flow.
- INPELER image validation, owner-scoped paths, and rollback handling.
- INPOLOR local-first review submission.
- INPOLOR anonymous identity scrubbing.
- Shared cookie consent UI in all portals.
- Unit and component test coverage across the portals and shared packages.
- Supabase schema migrations and pgTAP test files.
- A runnable three-portal integration audit.
- Browser assurance scripts and screenshots under `output`.

### Not yet proven for production

- Complete RLS behavior for every sensitive table.
- Live Supabase integration audit.
- Local Supabase/pgTAP execution in the current environment.
- Full browser journey matrix for every required route and role.
- Production legal publication and operational privacy workflows.
- Real payment gateway integration.
- Production monitoring, backup, retention, deletion, and incident response.

---

## 7. Phase-by-phase go-live plan

## Phase 1 — Safe audit environment

Goal: allow the integration audit to connect without touching production.

Recommended order:

1. Use local Supabase with Docker, or an empty disposable staging project.
2. Configure the required integration variables using a local ignored file.
3. Confirm the URL points to local/staging, not production.
4. Run `pnpm test:integration`.

Rules:

- Never commit credentials.
- Never use production service-role credentials for audit fixtures.
- Remote staging requires explicit `SUPABASE_AUDIT_ALLOW_REMOTE=true`.
- The service key is only for isolated Auth setup, constraint probes, and cleanup.

Exit gate:

- The test passes the credentials preflight and reaches actual Supabase operations.

Expected effort: 15–30 minutes if Docker or staging is already available.

## Phase 2 — Database contracts, grants, and RLS

Goal: prove that each role can perform only its authorized operations.

Roles:

- anonymous
- parent
- student
- university representative
- admin

Tables requiring explicit review:

- `profiles`
- `universities`
- `gallery_images`
- `courses`
- `sessions`
- `student_assessments`
- `recommendation_results`
- `payments`
- `reviews`
- `comments`
- `review_likes`
- `storage.objects`

Required questions:

1. Can a parent read only the parent-owned session?
2. Can a student read/update only the student-owned assessment?
3. Can one user access another user's assessment or session?
4. Can anonymous users create only the intended anonymous review shape?
5. Can users edit/delete only their own reviews, comments, and likes?
6. Can university representatives modify only their own university data?
7. Are admin overrides intentional, narrow, and tested?

Exit gate:

- Authorized operations succeed.
- Unauthorized operations fail.
- Foreign key, unique constraint, cascade, and cleanup checks pass.
- No sensitive table is exposed through an accidental broad grant or missing policy.

Expected effort: 1–3 days, depending on policy design and test gaps.

## Phase 3 — Three-portal end-to-end verification

Goal: prove the actual user journeys in real browser sessions.

INPEL checks:

- Parent session creation.
- Student invitation and route guards.
- All assessment steps.
- Auth redirect draft recovery.
- Completion and database persistence.
- Checkout/results guards.
- Report and scholarship routes.

INPELER checks:

- Representative login and refresh recovery.
- Institution profile.
- Course add/edit.
- MQA validation.
- Asset validation and upload.
- Review/attestation blockers.
- Publish and rollback behavior.

INPOLOR checks:

- Review feed and filtering.
- Anonymous review creation.
- Malformed/quota-full local storage.
- Quick Review unlock.
- Auth prompt.
- Cloud sync fallback.
- Refresh and invalid route behavior.

Required viewport checks:

- 320px
- 768px
- 1024px
- 1440px

Exit gate:

- Required route, role, refresh, malformed input, duplicate submission, and responsive checks pass.
- Console errors and failed network requests are reviewed.

Expected effort: 1–2 days.

## Phase 4 — Privacy, legal, and operational controls

Goal: make the product truthful and legally/operationally ready for public users.

Required work:

1. Add working `/legal` routes in all portals.
2. Complete legal entity, registered address, URLs, contacts, and DPO details.
3. Publish English and Bahasa Malaysia privacy notices.
4. Add separate consent for assessment/profiling, university sharing, marketing, and advertising.
5. Implement verifiable parental consent for minors.
6. Implement data access, correction, deletion, withdrawal, and marketing opt-out workflows.
7. Define and enforce retention/deletion schedules.
8. Document vendors, subprocessors, cross-border transfers, breach response, and backups.
9. Activate trackers only after consent gating and legal/vendor review are complete.

Current legal files:

- `docs/legal/DATA_COLLECTION_AUDIT.md`
- `docs/legal/LAUNCH_COMPLIANCE_CHECKLIST.md`
- `docs/legal/PRIVACY_POLICY.md`
- `docs/legal/TERMS_AND_CONDITIONS.md`

Important: these documents contain draft language and placeholders. They are not final legal approval.

Exit gate:

- No bracketed legal placeholders remain.
- `/legal` works.
- Product behavior matches the published notices.
- Legal review has approved the production version.

Expected effort: several days to several weeks, depending on legal review.

## Phase 5 — Release gate and deployment

Goal: make a controlled go-live decision.

Run from the appropriate safe environment:

```powershell
pnpm typecheck
pnpm test
pnpm build
pnpm test:integration
```

Also verify:

- Production public environment variables.
- No service-role key in any frontend build.
- OAuth provider configuration and callback URLs.
- Email confirmation/SMTP.
- Storage bucket and file limits.
- Database backup and rollback plan.
- Monitoring and error tracking.
- Rate limits and abuse controls.
- University/course seed data.
- HTTPS, custom domain, favicon, 404, and legal routes.
- Payment decision: remain simulation or integrate a real provider.
- Clean, reviewed Git diff and intentional tracked files.

Go-live is blocked if any of these remain unresolved:

- RLS is missing or unvalidated.
- Live integration audit has not passed.
- Sensitive data can cross role boundaries.
- Local database tests are assumed rather than run.
- Legal documents contain unresolved placeholders.
- Required routes are broken.
- Production secrets are exposed.
- There is no rollback/backup plan.

---

## 8. Known risks and things Codex must not assume

1. The folder names do not match all portal names.
2. Local/demo fallback is not the same as cloud production behavior.
3. Existing tests do not automatically prove complete authorization security.
4. Existing migrations do not automatically mean the remote database has been migrated.
5. A test that compiles is not a test that connected to Supabase.
6. A browser screenshot is not proof of backend persistence or RLS.
7. The no-charge checkout is not a payment integration.
8. The cookie banner alone does not mean advertising compliance is complete.
9. Legal drafts are not legal approval.
10. Current repository state may change; always inspect actual files before implementation.

---

## 9. Update protocol for future requests

When the user asks for a new update:

1. Read this file.
2. State the current phase.
3. Identify whether the request is planning, diagnosis, implementation, verification, or deployment.
4. Confirm the affected portal/package/database tables.
5. Check the relevant blueprint, source files, tests, migrations, and legal constraints.
6. Do only the requested scope.
7. Report what was verified and what remains unverified.
8. If the request changes the plan, ask before rewriting the plan file unless the user explicitly requests the update.

The default next phase is Phase 1: configure a safe local/staging Supabase environment and rerun the integration audit.
