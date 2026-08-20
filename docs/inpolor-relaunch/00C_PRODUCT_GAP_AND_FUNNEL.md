# Phase 0 Product Gap and Review-Funnel Analysis

## 1. Product diagnosis

The current product is structurally closer to a broad university directory with a community-review layer than to a programme-level student decision platform.

Current public positioning combines:

- “field guide” language;
- university directory and comparison;
- student review contribution;
- legacy “tea” and Unspoken Truth language;
- launch targets rather than measured supply;
- university-level score and rank presentation.

The intended relaunch position is clearer:

> A student decision and reality-check platform where real student experiences are verified privately and shared anonymously.

The main product gap is not visual polish. It is the absence of a trustworthy, useful, measurable exchange between contributors and decision-makers.

## 2. User groups and current coverage

| User group | Primary job to be done | Current coverage | Main gap |
|---|---|---|---|
| Prospective student | Understand the reality of a specific programme and campus before enrolling | University directory, profile, reviews, comparison | No campus/programme pages, no verified supply, no confidence |
| Parent | Understand costs, safety, support, outcomes, and trade-offs | INPEL assessment/report and generic INPOLOR directory | Review evidence is not connected to INPEL recommendations |
| Current student | Share a safe, useful experience and help juniors | Review wizard and account status | No student verification, high form burden, unclear moderation/value |
| Alumni | Share longer-term career/value perspective | Same review form | No alumni status, graduation period, or verification path |
| Institution representative | Maintain official facts and respond to criticism | INPELER publishing backend and official-response table | Insert-only frontend; no response dashboard or canonical links |
| Campus ambassador | Recruit legitimate contributors | Reward/referral concepts in backend | No programme, policy, tracking, fraud controls, or operating owner |
| Moderator | Verify, assess quality, moderate, handle reports/appeals | RPCs and audit tables | No operational queue/UI, verification model, or appeal workflow |
| Product/growth team | Identify discovery and contribution bottlenecks | No analytics | No events, dashboards, cohort data, or experiment framework |

## 3. Current discovery funnel

```text
Landing
  → university directory/search
  → university profile
  → review feed/summary
  → submit-review CTA
```

### Current strengths

- The visitor can browse without creating an account.
- The app does not fabricate reviews when the feed is empty.
- Compare and saved features communicate decision intent.
- The product can display review distributions once real data exists.

### Current breaks

1. **No useful public supply:** public catalogue and review feed have zero eligible live rows.
2. **Wrong information hierarchy:** university is the primary unit; campus and programme are absent.
3. **No confidence contract:** a score may be shown as soon as one review exists.
4. **Misleading ranking treatment:** list position is shown as a rank even when the database says the item is not ranking-eligible.
5. **Unknown cost distortion:** missing cost is treated as RM0 during filtering.
6. **Static SEO:** every SPA route shares one document title and description.
7. **No measurable discovery:** no search, page-view, CTA, or no-result events exist.

## 4. Current contribution funnel

```text
Submit-review CTA
  → review wizard
  → institution/course/year
  → eight ratings
  → narratives and cost
  → declarations
  → sign-in / age gate
  → RPC submission
  → local or submitted status
  → moderation
  → publication
  → global Unspoken Truth unlock
```

### Broken boundary map

| Boundary | Status | Evidence-based issue |
|---|---|---|
| CTA → review start | Unknown | No event instrumentation |
| Study context | Partial | Reference institution ID, free-text course, exact year; no campus/status |
| Ratings | High friction | Eight mandatory ratings, no N/A |
| Written experience | High friction | Main narrative plus fourteen optional prompts |
| Declaration | Broken | Frontend keys/version differ from live RPC |
| Authentication | Fragile | DOB stored in sessionStorage; magic link may open in another tab |
| Submission | Broken | Reference ID sent to RPC requiring product university ID |
| Error feedback | Misleading | Failures can become local/demo state rather than explicit failure |
| Moderation | Backend-only | No operational moderator UI or staffing evidence |
| Unlock | Incorrect model | Global boolean, inconsistent timing, no scope/revocation |
| Measurement | Absent | No step, verification, submission, approval, or unlock events |

## 5. Form-time assessment

The current form cannot reasonably be treated as a 3–4 minute flow for a first-time mobile contributor because it asks for:

- institution;
- free-text course;
- study year;
- eight ratings;
- a main narrative;
- transport;
- food;
- classes;
- commute;
- activities;
- pros/cons;
- living-cost narrative;
- safety;
- curfew;
- career prospects;
- part-time work;
- lecturers;
- boring classes;
- hangouts;
- numeric monthly cost;
- declarations and authentication.

The backend reward path is even heavier: thirteen narratives of at least 30 words and two to five photos in each of eight categories.

No completion-time telemetry exists, so this is a structural assessment rather than a measured duration claim.

## 6. Trust and value-exchange gap

### What the product currently asks contributors to provide

- personal account and DOB;
- detailed academic context;
- ratings and narratives;
- potentially extensive photo evidence;
- acceptance of draft legal documents.

### What contributors currently receive

- local/cloud status;
- a promise of Unspoken Truth access;
- no precise verification outcome;
- no scoped Reality Report;
- no clear moderation timeline;
- no revocation/appeal explanation;
- no evidence that their programme-campus page will become useful.

### Required redesign

The exchange should become:

```text
Understand value and privacy
  → provide a concise structured experience
  → verify privately through an appropriate method
  → pass quality and human moderation
  → receive a scoped, revocable Student Reality Report entitlement
  → invite relevant coursemates to increase confidence
```

Rewards must depend on legitimate completion and quality, never positive or negative sentiment.

## 7. Product-gap matrix

### Retain

| Capability | Why retain |
|---|---|
| Honest empty states | Prevents fake marketplace activity |
| Identity-free public projection | Strong foundation for anonymous public display |
| Raw review owner/moderator boundary | Appropriate trust separation |
| Moderation action log | Required accountability primitive |
| Institution response concept | Supports fairness without giving review control |
| Reference catalogue provenance | Valuable reconciliation source |
| Portal-specific visibility | Supports staged launch |
| Private photo processing | Useful optional evidence pattern |
| Saved/compare intent | Aligns with education decision use case |

### Redesign

| Capability | Current problem | Target direction |
|---|---|---|
| Directory | Breadth-first university list | Three-campus, programme-offering density |
| Review context | Reference ID + free text | Canonical institution/campus/programme offering |
| Review form | Five steps, overlapping prompts | Four steps, structured and optional narratives |
| Verification | DOB only | Private student/alumni verification |
| Anonymity copy | “Always anonymous” | Honest public-hidden / re-identification warning |
| Unlock | Global boolean | Scoped, provisional, revocable entitlement |
| Scores | University averages and list ranks | Confidence-gated programme-campus distributions |
| Role model | One global role | Additive capabilities and memberships |
| Institution publishing | Insert-only | Maintain, version, link, audit, publish |
| Error states | Demo/local fallback | Precise retryable errors and state recovery |
| SEO | Static SPA metadata | Useful-density noindex and programme intent pages |

### Postpone

- open comments;
- Q&A;
- reward payments;
- mandatory large photo sets;
- national comparison/ranking;
- broad institution self-service onboarding;
- AI-generated summaries;
- sophisticated automated fraud scoring;
- paid acquisition.

### Remove from MVP relaunch

- gossip-first hero or “expose your university” framing;
- automatic rankings from directory order;
- tiny-sample headline scores;
- unknown-cost-as-zero logic;
- absolute anonymity promises;
- public demo reviews or synthetic aggregates;
- institution-controlled review outcomes;
- global lifetime access controlled by `has_unlocked_tea`.

## 8. Review-funnel measurement requirements

The current system cannot identify conversion bottlenecks. Phase 1 analytics design should define at minimum:

### Discovery

- `landing_view`
- `search_started`
- `search_completed`
- `search_no_results`
- `institution_view`
- `campus_view`
- `programme_view`
- `review_preview_viewed`
- `review_cta_clicked`

### Contribution

- `review_started`
- `review_step_completed`
- `review_step_abandoned`
- `verification_started`
- `verification_method_selected`
- `verification_completed`
- `verification_failed`
- `review_submitted`
- `review_quality_check_failed`
- `review_approved`
- `review_rejected`

### Value and referral

- `report_unlocked`
- `report_viewed`
- `review_shared`
- `referral_link_created`
- `referral_link_opened`
- `ambassador_qr_opened`

No event may contain raw email, names, review text, verification evidence, student ID, document path, or precise small-cohort attributes.

## 9. North-star readiness

### Supply north star

> Number of programme-campus combinations with at least 10 recent verified reviews.

Current measurable value: **0**, because the canonical programme-campus entity and verified reviews do not exist.

### Demand north star

> Number of prospective users who read at least three relevant verified reviews during a decision session.

Current measurable value: **unknown**, because analytics does not exist.

The team should not substitute page views, reference-catalogue size, or launch targets for these metrics.

## 10. Campus launch readiness

The system has enough reference records to support discovery, but no evidence was supplied for:

- direct student access;
- student society relationships;
- alumni access;
- ambassador candidates;
- existing verified review supply;
- geographic concentration;
- moderation capacity per campus.

Therefore, Phase 0 does not select the first three campuses. Phase 1 should use a scored selection rubric once the product owner supplies relationship/access evidence.

Suggested criteria:

| Criterion | Why it matters |
|---|---|
| Direct current-student access | Faster legitimate supply |
| Alumni access | Outcome and long-term value insight |
| Society/faculty partner | Trust and programme concentration |
| Candidate ambassador owner | Accountable collection process |
| Programme concentration | Enables 10-review threshold |
| Geographic concentration | Operationally manageable pilot |
| Institution diversity | Tests model beyond prestige/private-public assumptions |
| Moderation complexity | Avoids launching where risks exceed capacity |

## 11. Highest-confidence product decisions

1. Position INPOLOR as a decision and reality-check platform.
2. Build density before breadth.
3. Programme-campus offering must become the main review target.
4. Public value must remain visible; not everything should be locked.
5. Full value should unlock only after verification and minimum quality gates, subject to moderation and revocation.
6. Green Flags and Red Flags may remain as structured tags, not forced narratives.
7. Open comments and reward-heavy review paths should not be relaunch priorities.
8. No national ranking should be built during the relaunch.

## 12. Assumptions requiring validation

These are hypotheses, not measured facts:

- form length is likely a material abandonment driver;
- private verification/public anonymity copy will improve trust;
- programme-level pages will be more useful than university averages;
- a scoped Reality Report can motivate contribution;
- campus society and alumni partnerships can create initial supply.

They must be instrumented and tested after the foundation and privacy-safe analytics are operational.

## 13. Product handoff

Before product/UX implementation begins:

1. complete the source-of-truth milestone;
2. confirm the standard review lifecycle;
3. define verification methods and evidence retention;
4. define entitlement timing/scope;
5. define confidence thresholds;
6. receive evidence for first-campus selection;
7. approve public/legal trust copy.
