# INPEL University Portal

React single-page application for the parent-guided university matching journey defined in `_blueprints/2-blueprint-inpel.md`.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Parent priorities form and student invitation creation |
| `/email-notification/:id` | Invitation email preview |
| `/student/:id` | Resumable account, hobbies, psychometric, and academic assessment |
| `/checkout/:id` | No-charge report tier simulation |
| `/results/:id` | University matches, comparison, ROI, career outlook, and PDF report |
| `/guide/:guideId` | Scholarship instructions and document checklist |

Unknown routes, malformed UUIDs, and unknown sessions return to the parent portal. Checkout and results routes also enforce completion and payment prerequisites.

## Local development

From the monorepo root:

```sh
pnpm install
pnpm --filter @repo/portal-universiti dev
```

The UI runs without Supabase values by using validated local persistence and a representative university match set. To enable cross-device session writes and the live university catalogue, copy `.env.example` to `.env.local` in this directory and supply the browser-safe public values.

The Vite configuration deliberately maps the established `NEXT_PUBLIC_SUPABASE_*` contract into the browser bundle. Do not add a service-role key.

## Shared database boundary

All client access and schema types come from `@repo/database`. `src/lib/portal-data.ts` dynamically loads its exported singleton at the moment data is read or written; the app never calls `createClient` and never creates its own Supabase client.

Writes target:

- `sessions` for parent preferences and lifecycle status;
- `student_assessments` for submitted student data;
- `payments` for the no-charge checkout result.

University catalogue reads target `universities`. A local fallback keeps the prototype usable when public environment values or a reachable project are absent.

## Privacy and resilience

- Student passwords are validated in memory and immediately discarded.
- No authentication token or card number is stored in `localStorage`.
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

The test suite covers blueprint validation messages, corrupted storage, password non-persistence, route fallback, parent invitation creation, student step gating, checkout navigation, sparse catalogue normalization, and ROI calculations.
