# INPOLOR Production Release Checklist

Status: **NO-GO until every blocking gate below has evidence**

Target: INPOLOR public production release

App: `apps/portal-parent`

Last audit snapshot: 5 September 2026

This checklist translates the approved INPOLOR product specification into a production release path. It does not authorize production changes by itself. Record the operator, UTC timestamp, commit SHA, target identifiers, command/result, and evidence link for every completed gate.

## 0. Known target state and immediate blockers

At the audit snapshot:

- The current staging implementation was pushed on branch `codex/inpolor-public-launch` at commit `a1f5ede`; it is not a production release candidate. Record a fresh immutable SHA before any production gate.
- Canonical disposable staging is project `xrmrhjgkttxzvwdsjazs`; local and remote migration histories match at 35 migrations. Docker/local Supabase, `db reset`, and `migration repair` are prohibited for this repository.
- `apps/portal-parent/.vercel/project.json` points to Vercel project `inpolor-staging` (`prj_Vn599nhnXy5MssDAzWrmhcopvdlv`). There is no repository evidence of a separately linked production Vercel project.
- The repository is linked to Supabase project ref `xrmrhjgkttxzvwdsjazs`, documented as disposable staging. There is no repository evidence of an approved production Supabase project ref or matching remote migration history.
- `supabase/config.toml` references `supabase/seed.sql`, but that file does not exist.
- The staging catalogue has 756 MQA-source-backed institutions, each linked to a real `universities.id` and published for INPOLOR. This is staging catalogue availability, not approval of a 756-institution production launch.
- An authenticated staging review submission reached `submitted` and its QA account/data were removed. The portal must use `university_id` for review submission; `reference_institution_id` is source/catalogue identity only and is correctly rejected by the RPC.
- Public staging smoke checks passed on the Vercel deployment of `b7d06aa`: the 756-institution INPOLOR directory/search and populated review selector, INPELER representative login boundary, and INPEL parent assessment entry screen were reachable. No credentials or personal data were used. The exact 320px/768px/1024px/1440px responsive and authenticated browser matrix is still required.
- The Vercel CLI is not installed as a global executable in the audited environment. Use a pinned project/dev dependency or a pinned `pnpm dlx vercel@<reviewed-version>` invocation; do not depend on `@latest` during release.
- Supabase CLI access in the restricted desktop environment cannot write its telemetry file. Run database verification in an approved unrestricted release shell or through the project-scoped Supabase MCP connection.

These are release blockers, not post-release tasks.

## 1. Freeze the release candidate

- [ ] Pause source and migration edits long enough to create a stable release candidate.
- [ ] Record `git status --short`, `git diff --check`, branch, and commit SHA.
- [ ] Review every modified and untracked file; exclude unrelated user work.
- [ ] Confirm the committed lockfile matches every package manifest.
- [ ] Push the exact release commit to GitHub and require the local-quality workflow to pass.
- [ ] Protect production from direct deployment of an unreviewed dirty workspace.
- [ ] Tag or otherwise record the release commit that maps to the promoted Vercel artifact and database migration set.

Required evidence:

```powershell
git status --short
git diff --check
git rev-parse HEAD
git log -1 --oneline
```

## 2. Supabase production project gate

Use a production project distinct from `xrmrhjgkttxzvwdsjazs` unless an authorized owner explicitly reclassifies that project after reviewing all existing data and access.

- [ ] Record the approved production project ref, region, organization, plan, and owner.
- [ ] Confirm backups/PITR policy, restore owner, database password custody, and incident contacts.
- [ ] Link the release shell to the exact production ref and independently verify the hostname before any write.
- [ ] Compare the production remote migration history with the ordered local migration files.
- [ ] Review and apply only missing, approved migrations in order; do not use `db reset` in production.
- [ ] After migration, run database security/performance advisors and resolve every critical finding.
- [ ] Confirm every Data API table/view/function has the intended grants in addition to RLS.
- [ ] Confirm all public-schema tables have RLS enabled and ownership predicates; `TO authenticated` alone is not authorization.
- [ ] Confirm public views use `security_invoker = true` or are otherwise protected.
- [ ] Confirm privileged functions are outside exposed schemas where practical, have fixed `search_path`, explicit caller authorization, and revoked default `PUBLIC` execution.
- [ ] Confirm moderator/admin authorization is stored in trusted app metadata or server-owned tables, never user-editable metadata.
- [ ] Confirm browser clients receive only the publishable key. Service-role/secret keys must exist only in tightly scoped server-side jobs/functions and approved CI secrets.
- [ ] Run the database contract tests and an isolated integration run against staging before production promotion.
- [ ] Prove integration fixtures and Auth users are fully removed after the run.

### Required INPOLOR data capabilities

The production schema and trusted operations must support and test, at minimum:

- one active review per user per university, with versioned edit proposals;
- standard and reward review types, eight equal-weight 1–10 category ratings, overall derived score, written sections, calendar study year, course context, and monthly living-cost amount;
- review, comment, answer, official-response, report, and edit moderation state machines with audit history;
- three-level text-only comment/Q&A threading, one reversible upvote per eligible item, and saved universities/reviews/Q&A;
- anonymous public projections that never expose Auth IDs, email, date of birth, eWallet, IP/device/risk signals, or moderator notes;
- reward eligibility, one lifetime reward per person, one reward per eWallet number, claim/payment status, transaction reference, problem report, and 24-month retention controls;
- photo categories, 2–5 accepted photos per each of eight categories for reward reviews, safe/redacted object references only, EXIF removal evidence, and no retained original;
- Unspoken Truth classification and moderator correction for approved review sections with total score `<= 4/10`;
- reports that hide content immediately while preserving a neutral public placeholder and an auditable restoration/rejection decision;
- content moderator, payment moderator, and primary admin roles with least privilege;
- institution claim/completion/approval and moderated official responses at review, Q&A, and profile level;
- in-app notifications, transactional email events, acquisition attribution, reward budget state, and dashboard aggregates;
- account date of birth stored privately, immutable through self-service, correctable only through a verified support/privacy process;
- retention/deletion/anonymization jobs and evidence for eWallet and anti-fraud records after 24 months.

If any of these capabilities is absent from the final migration set and tested server-authorized API, the production database is not ready.

## 3. Supabase Auth and Google configuration

### URL configuration

- [ ] Set Supabase Auth **Site URL** to the exact canonical HTTPS INPOLOR production origin.
- [ ] Add the exact production callback/root URL used by the application to the redirect allow list.
- [ ] Add only required local URLs for development.
- [ ] If preview authentication is required, add the narrow Vercel team preview wildcard `https://*-<team-or-account-slug>.vercel.app/**`; keep the production URL exact.
- [ ] Ensure the application constructs redirects from an explicit canonical production site URL, not an untrusted request header.
- [ ] Test magic-link and Google return paths on a fresh browser, expired link, reused link, blocked popup, cancelled consent, and invalid callback.

Current code sends magic links to `globalThis.location.origin`. The final callback/session recovery implementation must be verified against the exact allowed URL and must restore the pre-login review draft.

### Email magic link

- [ ] Enable email sign-up and the intended confirmation/magic-link behavior.
- [ ] Configure custom SMTP for production delivery, sender domain authentication, bounce handling, and rate limits.
- [ ] Review BM and English templates and links. New Supabase Free projects cannot rely on customizable default SMTP templates.
- [ ] Configure CAPTCHA/attack protection and rate limits appropriate to paid acquisition traffic.
- [ ] Confirm email is never written into public review payloads or browser-persisted review data.

### Google provider

- [ ] Create a Google OAuth **Web application** client for production.
- [ ] Add the canonical INPOLOR origin under Google Authorized JavaScript origins.
- [ ] Add the exact Supabase callback shown by the provider page, normally `https://<production-project-ref>.supabase.co/auth/v1/callback`, under Google Authorized redirect URIs.
- [ ] Store the Google client secret only in Supabase provider configuration/approved secret storage.
- [ ] Enable the Google provider in the production Supabase project with the correct client ID and secret.
- [ ] Use separate OAuth clients for production and non-production where possible.
- [ ] Verify duplicate-email/identity-link behavior before launch so email magic-link and Google sign-in cannot create reward duplicates or account takeover ambiguity.

## 4. Vercel monorepo production project

Create or verify a production Vercel project distinct from `inpolor-staging`.

- [ ] Import the GitHub repository as a separate Vercel project for INPOLOR.
- [ ] Set **Root Directory** to `apps/portal-parent`.
- [ ] Confirm Vercel detects the root `pnpm-lock.yaml` and the workspace dependencies `@repo/database` and `@repo/ui` are available during the build.
- [ ] Framework preset: Vite.
- [ ] Install command: use the repository lockfile with frozen installs (normally Vercel's detected `pnpm install --frozen-lockfile`).
- [ ] Build command: `pnpm build` from the app root, or the equivalent reviewed monorepo filter from repository root.
- [ ] Output directory: `dist` from the app root.
- [ ] Keep the SPA rewrite in `apps/portal-parent/vercel.json` and verify direct refresh of every route.
- [ ] Configure Node `22.13.x` or another repository-compatible Node 22 release; do not release from an unverified Node 24-only local result.
- [ ] Set production and preview environment variables separately.
- [ ] Attach the canonical domain, DNS, HTTPS, and redirect/canonical-host behavior.
- [ ] Enable Git deployment for preview branches; promote the exact tested preview artifact to production rather than rebuilding a different artifact.
- [ ] Configure deployment protection so preview URLs containing production-like user data are not public.
- [ ] Configure error monitoring/log ownership and a tested Vercel rollback procedure.

### Browser-safe Vercel environment variables

Required by the current shared database client:

```text
VITE_SUPABASE_URL=https://<production-project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<production publishable key>
```

Add an explicit canonical site URL variable if the final auth implementation uses one. Never expose a service-role key, Supabase secret key, Google client secret, SMTP secret, image-moderation secret, or payment/moderator credential through `VITE_*`.

A static Vite browser bundle cannot safely perform privileged moderation, payment, anti-fraud, retention, or secret-bearing image-processing operations. Those operations must be implemented as authenticated server-side Supabase functions/RPCs, Edge Functions, or another reviewed backend before release.

## 5. Seed/import gate

Follow [INPOLOR_SEED_IMPORT_CHECKLIST.md](../INPOLOR_SEED_IMPORT_CHECKLIST.md).

- [ ] Approve the exact 20 KL/Selangor private institutions and evidence that each has more than 100 active students.
- [ ] Import verified institution facts and curated course aliases through an idempotent, reviewed process.
- [ ] Do not seed fabricated community reviews, ratings, costs, likes, Q&A, reward claims, or official responses into production.
- [ ] Remove or fail closed on demo-review fallback in a production-connected build.
- [ ] Verify search by institution and course after import.

## 6. Quality and browser gates

Run from a clean checkout of the exact release commit:

```powershell
pnpm install --frozen-lockfile
pnpm typecheck
pnpm lint
pnpm test
pnpm build
git diff --check
```

- [ ] All commands exit zero on Node 22.13+.
- [ ] Database pgTAP contracts pass against a rebuilt disposable local database.
- [ ] Staging integration tests pass with zero fixture residue.
- [ ] A checked-in browser suite covers anonymous discovery and authenticated contribution/moderation/payment journeys.
- [ ] Test at 320px, 768px, 1024px, and 1440px.
- [ ] WCAG 2.2 AA checks cover keyboard order, focus, names/labels, errors, contrast, motion, and screen-reader announcements.
- [ ] BM and English copies have no missing keys, mixed-language system strings, or broken email links.
- [ ] No console errors, failed requests, source maps containing secrets, service keys, private metadata, or raw image originals are present.

### Required end-to-end journeys

1. Browse/search/filter/sort directory; data-limited labels and five-review ranking threshold.
2. University profile aggregates, eight ratings, strengths/weaknesses, feed, cost, Q&A, gallery, and facts.
3. Start review logged out, persist draft locally, authenticate by magic link and Google, sync draft, and resume on another device.
4. Standard review validation, automated pre-screen, manual moderation, publish, edit proposal, and old-version continuity.
5. Reward review full written sections, eight photo categories, 2–5 photos/category, redaction confirmation, EXIF removal, moderation, claim, manual payment, transaction evidence, and payment problem report.
6. Under-18 rejection and verified support-only date-of-birth correction.
7. One active review per user/university; one lifetime reward; duplicate account/eWallet/risk path fails safely without exposing risk signals.
8. Unspoken Truth global unlock on full submission and persistence after later rejection; `<=4/10` classification and moderator correction.
9. Like/upvote toggle, save lists, three-level Q&A/comment threading, notifications, and manual moderation before display.
10. One report immediately hides content and shows the neutral placeholder; moderator restore/remove and false-report enforcement.
11. Completed/approved INPELER institution role submits official review/Q&A/profile responses; every response waits for moderation.
12. Role separation: content moderator cannot access eWallet/payment data; payment moderator cannot access unnecessary private content; primary admin controls roles/privacy/institution approval.
13. Compare up to three universities only when logged in, including data-limited institutions.
14. Acquisition attribution from Threads, TikTok, and Meta without leaking personal data.

## 7. Closed beta and operational gates

- [ ] Run the real 30-person closed beta beginning around 9 November 2026.
- [ ] At least 20 of 30 complete submission without assistance.
- [ ] Prove image redaction/metadata removal, anonymous public projection, and auth/draft recovery.
- [ ] Complete at least one real RM10 payment end to end with evidence and problem-report path.
- [ ] Reconcile reward budget status and claims against the RM10,000 campaign budget.
- [ ] Verify moderator queue age, throughput, escalation, and role access with expected campaign volume.
- [ ] Configure support form queue and privacy fallback email.
- [ ] Obtain Malaysian legal review for BM/English terms, privacy, campaign, anti-fraud processing, UGC moderation, retention, deletion/correction, vendors, and cross-border processing.
- [ ] Rehearse incident response, content takedown, privacy request, backup restore, deployment rollback, and compromised moderator-account response.

## 8. Two-phase production release

1. Freeze and test the exact commit against staging.
2. Back up and verify the exact production Supabase target.
3. Apply reviewed production migrations and verify migrations, advisors, RLS/grants/functions/storage.
4. Import the approved institution/course catalog and verify counts/search.
5. Deploy the same tested commit to a protected Vercel preview with production configuration.
6. Run production-readiness smoke tests using designated test accounts; remove all fixtures.
7. Promote the tested Vercel artifact to production.
8. Verify canonical domain, Auth callbacks, public feed, submission, monitoring, and no secret exposure.
9. Monitor errors, Auth delivery, queue growth, photo failures, and reward budget during the agreed release window.
10. Roll back the Vercel artifact for application regression; use reviewed forward-fix migrations for database/security issues. Never disable RLS or run destructive legacy down migrations as an automatic rollback.

## 9. Final go/no-go record

| Gate | Owner | Evidence | Status |
| --- | --- | --- | --- |
| Clean GitHub release commit and green CI |  |  | NO-GO |
| Approved production Supabase project and migration history |  |  | NO-GO |
| RLS/grants/functions/storage/advisors verified |  |  | NO-GO |
| Auth magic link, SMTP, Google, callbacks, abuse controls |  |  | NO-GO |
| Approved 20-institution seed/import |  |  | NO-GO |
| Production Vercel project/domain/env/rollback/monitoring |  |  | NO-GO |
| Unit, database, integration, browser, mobile, a11y, bilingual gates |  |  | NO-GO |
| 30-person real-flow beta acceptance |  |  | NO-GO |
| Malaysian legal/privacy approval |  |  | NO-GO |
| Operations, support, moderation, payment, and incident rehearsal |  |  | NO-GO |

Do not publish a production URL as complete while any row remains NO-GO.
