# INPELER Institutional Portal

React/Vite frontend for university representatives to maintain the institution data shown in INPELER. The implementation follows `_blueprints/3-blueprint-inpeler.md` and lives in the existing `apps/portal-student` workspace slot.

## Routes

| Route | Purpose |
| --- | --- |
| `/login` | Institutional representative sign-in |
| `/dashboard/global-profile` | University profile, logo upload, facility image uploads, contacts, and gallery |
| `/dashboard/courses` | Programme catalogue and empty state |
| `/dashboard/courses/form` | Add a programme |
| `/dashboard/courses/form?course=<id>` | Edit an existing programme |
| `/dashboard/review` | Consolidated read-only review, attestation, and publish |
| `/dashboard/success` | Publication confirmation and live record counts |

Unauthenticated dashboard requests redirect to `/login`. In development, the login page exposes a clearly labelled preview action so the interface can be reviewed without production credentials. A temporary verification build can opt in with `VITE_ENABLE_DEMO_MODE=true`; production builds must leave it unset.

## Data boundary

- `@repo/database` is the only Supabase entry point. This app does not create a Supabase client.
- Authentication verifies that the signed-in profile has the `university_rep` or `admin` role.
- Refreshes restore the verified shared session with `auth.getUser()`; signing out revokes the shared Supabase session before returning to `/login`.
- Publishing writes typed payloads to `universities`, `gallery_images`, and `courses`.
- Institution logos and facility images are uploaded only during the attested publish action. They use the public `university-assets` bucket and owner-scoped paths in the form `<representative-id>/<university-id>/<asset-kind>/<generated-id>.<extension>`.
- Files are restricted to PNG, JPEG, or WebP and 5 MB in both the UI and the Supabase bucket. Original filenames are never used as storage object paths.
- Public asset URLs are written to `universities.logo_url` and the matching entry in `universities.facilities_flags`, so other portals can render them without sharing credentials.
- If an asset link, gallery, or programme write fails after the institution insert, uploaded storage objects and the new institution are removed so cascade rules cannot leave a partial publication.
- Passwords are held only in the login form state, cleared after successful sign-in, and never written to the portal draft.
- Draft data uses the `inpeler:institution-draft:v1` local-storage key. Stored values are schema-checked before reuse; malformed data is ignored safely.

Copy `.env.example` to `.env` and supply browser-safe public Supabase values. Secret or service-role keys are rejected by `@repo/database`.

## Validation and publishing

- The MQA message is preserved exactly: `MQA Accreditation Code is required.`
- The programme editor groups the complete requirement set into Academic, Financial Aid, and Outcomes sections.
- Publishing is blocked when there are no programmes.
- Publishing is blocked until the Institution Accuracy Attestation is checked.
- The publish button enters a loading state and ignores double submissions.
- Optional empty values are rendered as `Empty` or `Not Specified` in review.

## Commands

```powershell
pnpm --filter @repo/portal-student dev
pnpm --filter @repo/portal-student test
pnpm --filter @repo/portal-student typecheck
pnpm --filter @repo/portal-student lint
pnpm --filter @repo/portal-student build
```

The test suite covers protected routing, the complete add-programme flow, every required course field, file validation, owner-scoped storage paths, upload rollback, publish blockers, exact validation copy, legacy draft hydration, and shared-schema payload mapping.

## Database migrations

The storage bucket, representative ownership column, row-level policies, and Data API grants are defined in:

- `supabase/migrations/20260717153000_university_management_assets.sql`
- `supabase/migrations/20260719231138_university_management_grants.sql`

Matching rollback scripts and pgTAP schema coverage live under `supabase/rollback` and `supabase/tests/database`. Apply migrations through the normal reviewed Supabase release process; the frontend never uses a service-role key.
