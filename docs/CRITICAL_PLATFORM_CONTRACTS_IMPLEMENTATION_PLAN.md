# Critical Platform Contracts — Phased Implementation Plan

**Branch:** `agent/critical-platform-contracts`  
**Base:** `main@9fb2c1c2919e0cfded7f72a6fa872cffcaccd66a`  
**Target Supabase project:** `xrmrhjgkttxzvwdsjazs` (`inpel-agency`, staging/disposable audit project)  
**Status:** implementation gate — no application or schema patch begins until this plan is committed.

## Objective

Repair the highest-risk cross-system contracts identified in the August 17, 2026 repository audit without expanding product scope. The work is limited to making existing flows truthful, internally consistent, security-preserving, and testable.

The primary success path is:

```text
verified product university
→ authenticated 18+ contributor
→ standard review submission
→ manual moderation
→ redacted public projection
→ university summary and public review render
```

## Non-goals

- Building reward-review UI, payments, notifications, Q&A, or ranking features beyond what is required to secure existing endpoints.
- Inventing legal language or presenting draft legal documents as final legal advice.
- Replacing the matching methodology.
- Migrating all three portals to a new framework.
- Renaming workspaces.

## Agent lanes and boundaries

The repository agent briefs are used as independent review gates. Each lane has a deliberately narrow task and may not silently widen scope.

### 1. Analyst agent — requirements and acceptance criteria

**Task:** turn each audit finding into a pass/fail requirement, identify hidden assumptions, and reject patches that merely hide symptoms.

**Deliverables:**

- canonical institution-ID contract;
- review payload/projection contract;
- onboarding and age-gate contract;
- database access and report-abuse guardrails;
- CI acceptance matrix.

**Stop condition:** every Phase 1–5 item below has measurable acceptance criteria.

### 2. Architect agent — cross-system boundaries

**Task:** verify the boundary between reference catalogue IDs, product university IDs, private review rows, public projections, and frontend models.

**Deliverables:**

- one canonical product ID for all review submissions and summaries;
- source/provenance IDs retained separately;
- backwards-compatible projection strategy;
- no browser access to identity-bearing review rows.

**Stop condition:** architectural status is `CLEAR` or `WATCH`; `BLOCK` prevents execution.

### 3. Database-security agent — Supabase migration and RLS

**Task:** prepare minimal migrations for canonical reviewable institutions, review projection repair, onboarding durability, report handling, unlock rules, and strict parent-profile validation.

**Guardrails:**

- all exposed tables retain RLS;
- grants are explicit and least-privilege;
- privileged helper functions remain outside exposed schemas where possible;
- every `SECURITY DEFINER` endpoint authenticates and authorizes internally;
- public projections contain no user ID, email, date of birth, declaration receipt, or raw moderation data;
- no report from a single ordinary user automatically removes public content;
- migrations are additive or replace functions safely and include rollback notes.

**Stop condition:** migrations apply cleanly, security/performance advisors are reviewed, and focused SQL verification passes.

### 4. Frontend-contract agent — portal data flow

**Task:** update only the frontend files required to consume the corrected contracts.

**Expected scope:**

- `apps/portal-parent/src/lib/community-data.ts`
- `apps/portal-parent/src/lib/review-data.ts`
- `apps/portal-parent/src/components/ReviewWizard.tsx`
- `apps/portal-parent/src/components/PortalExperience.tsx`
- `apps/portal-parent/src/app/App.tsx`
- focused tests for those files;
- INPELER readiness logic only where pending assets currently block legitimate publication.

**Stop condition:** no reference-catalogue ID is sent to a product-university foreign key, public review text survives moderation projection, missing university validation cannot crash, and onboarding failures are visible.

### 5. Test-engineer agent — regression and contract coverage

**Task:** repair stale pgTAP expectations without weakening intentional security and add cross-layer regression tests.

**Required tests:**

- current schema shape and policy names;
- owner/moderator-only raw review reads;
- reference institution to product university mapping;
- review submission → moderation → public projection;
- standard review unlock only after approval;
- report submission queues content without immediate auto-hide;
- existing profile with null birth date can complete INPOLOR onboarding once;
- parent invitation rejects incomplete preference objects;
- pending INPELER image assets satisfy client readiness while server validation remains authoritative.

**Stop condition:** focused tests and the full quality workflow pass.

### 6. Verifier agent — independent completion gate

**Task:** inspect the final diff, rerun fresh checks, query the staging database, review Supabase advisors, and compare runtime claims with actual behavior.

**Stop condition:** evidence exists for every acceptance criterion; unresolved high-severity findings block merge and staging deployment.

## Phases

## Phase 0 — Baseline and evidence

1. Record current GitHub head, failing workflow jobs, Supabase migration history, schema objects, grants, RLS policies, and advisors.
2. Confirm that `xrmrhjgkttxzvwdsjazs` remains the repository’s disposable/staging audit target.
3. Preserve a rollback snapshot of any function/view definition that will be replaced.

**Acceptance criteria:**

- baseline is reproducible;
- no production project is modified;
- migrations and application patches are based on current `main`, not the earlier audit commit.

## Phase 1 — Restore truthful CI contracts

1. Update pgTAP schema expectations for intentionally added columns and foreign keys.
2. Update policy expectations from legacy owner-only names to membership-based policies.
3. Preserve the security assertion that raw reviews are not public; change it to assert scoped owner/moderator reads rather than no authenticated access at all.
4. Add new tests before changing behavior where feasible.

**Acceptance criteria:**

- existing migrations rebuild from zero;
- all pgTAP files reflect intentional current architecture;
- no failing test is deleted merely to obtain green CI.

## Phase 2 — Canonical institution identity and public directory

1. Add a public-safe view that returns both `reference_institution_id` and canonical `university_id` for institutions that are linked, verified, complete, unsuspended, and published for INPOLOR.
2. Make INPOLOR routes, saves, comparison, summaries, reviews, and review targets use `university_id`.
3. Keep `reference_institution_id` only as source provenance.
4. Display unlinked reference records as catalogue-only discovery only when clearly labelled; they must not accept reviews or appear ranked.

**Acceptance criteria:**

- every review target references an existing `public.universities.id`;
- summary lookup keys match `inpolor_university_summaries.university_id`;
- a review cannot fail because a reference-catalogue UUID was supplied as a university foreign key;
- institutions below the minimum sample are labelled unranked.

## Phase 3 — Review payload, moderation, and public projection

1. Standardize the structured content keys used by the frontend, submission RPC, raw review row, and public projection.
2. Preserve existing published records through fallback reads.
3. Populate public main-experience text from `mainExperience`, with legacy fallback to `spillTheTea`.
4. Render strengths/watch-outs only when approved content exists; do not present empty or unaggregated text as a statistical verdict.
5. Unlock Unspoken Truths only after a review is approved/published, and align UI copy with that timing.
6. Stop a single ordinary report from automatically hiding content; reports enter the moderation queue.

**Acceptance criteria:**

- submit → publish produces the same main text and eight ratings in `published_reviews`;
- public projections remain identity-free;
- standard review success copy does not promise immediate unlock;
- one report does not remove public content;
- moderation can still explicitly hide content.

## Phase 4 — Authentication, age gate, and durable onboarding

1. Replace tab-scoped pending date-of-birth storage with a versioned, expiring onboarding draft that survives a magic-link tab change.
2. Allow an existing profile with `date_of_birth IS NULL` to set it exactly once.
3. Reject later birth-date changes unless handled through verified support.
4. Surface onboarding failures to the user instead of swallowing them.
5. Fix the review wizard’s valid-background/missing-university crash path.

**Acceptance criteria:**

- magic-link completion works in a new tab within the TTL;
- expired or malformed onboarding drafts are deleted;
- existing parent/student profiles can join INPOLOR without changing their existing role;
- no submission reaches the review RPC without completed 18+ onboarding;
- missing institution validation returns a field error, not a runtime exception.

## Phase 5 — INPELER readiness and strict parent payload validation

1. Count pending facility files as client-side readiness evidence while retaining upload and server validation at publish time.
2. Require all parent preference keys and valid values in the invitation RPC.
3. Keep reference institution/programme identifiers separate from copied display names so reviewed linking can be implemented safely.

**Acceptance criteria:**

- a legitimate first-time facility upload is not blocked before upload can start;
- empty or partial parent preference objects are rejected server-side;
- no string-name match is treated as a verified catalogue link.

## Phase 6 — Verification, staging deployment, and PR

1. Run typecheck, lint, unit/component tests, build, migration rebuild, and pgTAP.
2. Apply the reviewed migration to the staging Supabase project only after repository tests are green.
3. Run focused SQL verification and Supabase security/performance advisors.
4. Push the branch and open a draft PR with migration order, verification evidence, and remaining non-blocking work.
5. Do not merge while a required check is red.

**Acceptance criteria:**

- GitHub quality workflow is green;
- staging migration history matches the committed migration;
- SQL verification confirms corrected behavior;
- no high-severity advisor finding is introduced;
- the PR documents rollback and unresolved release/legal gates.

## Rollback strategy

- Application changes are reverted through the branch/PR commit history.
- Each database object replacement records the prior definition in review evidence.
- New views/functions are dropped or restored through a companion rollback script where repository conventions require one.
- No destructive data rewrite is allowed in this workstream.
- Public projections may be rebuilt from raw moderated rows after rollback.

## Merge and deployment policy

- All implementation occurs on `agent/critical-platform-contracts`.
- The GitHub PR remains draft until all automated checks pass.
- Supabase changes are applied only to `xrmrhjgkttxzvwdsjazs` during this work.
- Production deployment remains blocked by the repository’s legal and release checklists.
