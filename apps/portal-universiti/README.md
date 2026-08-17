# INPEL University Portal

React single-page application for the parent-guided university matching journey defined in `_blueprints/2-blueprint-inpel.md`.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Parent priorities, parent-account confirmation, and student invitation creation |
| `/email-notification/:id` | Invitation email preview |
| `/student/:id` | Resumable personality, psychometric, dynamic SPM, Vibe Check, and authentication journey |
| `/auth/callback?sessionId=:id` | OAuth/email-confirmation callback that restores and commits the cached assessment |
| `/parent/:id` | Assessment-complete parent notification handoff |
| `/checkout/:id` | No-charge report tier simulation |
| `/results/:id` | University matches, comparison, ROI, career outlook, and PDF report |
| `/guide/:guideId` | Scholarship instructions and document checklist |

Unknown routes, malformed UUIDs, and unknown sessions return to the parent portal. Checkout and results require both a completed assessment and an authenticated student session; results additionally require a successful checkout.

## Local development

From the monorepo root:

```sh
pnpm install
pnpm --filter @repo/portal-universiti dev
```

The assessment draft can remain in validated local persistence before secure submission, but university and programme catalogue records are never replaced with local samples. Copy `.env.example` to `.env.local` in this directory and supply the browser-safe public values to read the shared live catalogue.

The Vite configuration deliberately maps the established `NEXT_PUBLIC_SUPABASE_*` contract into the browser bundle. Do not add a service-role key.

## Shared database boundary

All client access and schema types come from `@repo/database`. `src/lib/portal-data.ts` dynamically loads its exported singleton at the moment data is read or written; the app never calls `createClient` and never creates its own Supabase client.

The parent journey keeps family priorities only in the current browser for up to 24 hours until the parent authenticates. After email/password, Google, or Facebook authentication, the parent explicitly confirms the account before the authenticated invitation RPC runs. Email confirmation can restore this draft only in the same browser/device.

Writes and authentication target:

- `sessions` for parent email, preferred location, monthly household income, four structured preferences, and lifecycle status;
- `student_assessments` for dynamic SPM rows, the 16 Likert values, six structured Vibe Check answers, and the compatibility aggregate;
- `payments` for the no-charge checkout result.
- Supabase Auth for parent and student email/password sign-up or login plus Google and Facebook OAuth when the shared client and providers are configured.

University and programme catalogue reads target the public `shared_catalog_institutions` and `shared_catalog_programmes` views. If Supabase or either catalogue view is unavailable, the results page displays an explicit unavailable state and does not substitute mock data.

## Privacy and resilience

- Student passwords are passed directly to the shared Supabase Auth client when configured, then immediately discarded.
- No authentication token or card number is stored in `localStorage`.
- Before email signup/login or an OAuth redirect, the complete validated wizard state is cached under a dedicated `localStorage` key with a 24-hour expiry so email confirmation can safely reopen in another tab. Passwords and provider tokens are excluded.
- Callback completion is ordered: restore draft, upsert the student/profile records, mark the session complete, persist the local session, clear the draft, then enter the parent view. A failed cloud write keeps the draft for an idempotent retry.
- Persisted session records are schema-validated on every read; corrupted data returns a safe redirect.
- Parent email and student assessment data remain scoped to the generated session.
- PDF capture has a 12-second timeout and restores hidden report sections after success or failure.
- Database failures surface as an offline/demo state rather than blanking the application.

## Quality gates

```sh
pnpm --filter @repo/portal-universiti test
pnpm --filter @repo/portal-universiti typecheck
pnpm --filter @repo/portal-universiti lint
pnpm --filter @repo/portal-universiti build
```

The test suite covers the full Malaysian location/income form, all four parental preferences, exact database payload serialization, the 16-question personality test, dynamic SPM subjects, the six-card Vibe Check, password non-persistence, versioned redirect drafts, successful and failed callback hydration, authentication route guards, parent notification handoff, checkout navigation, corrupted storage, sparse catalogue normalization, and ROI calculations.

For hosted OAuth, enable Google and Facebook in Supabase Auth and allow the deployed portal's `/auth/callback` URL. Email confirmation uses the same callback URL. Never place provider secrets in Vite environment files.
