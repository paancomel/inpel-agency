# Master Orchestration Prompt — INPOLOR Relaunch and Product Rebuild

You are the **Lead Product, UX, Trust, Growth, and Engineering Orchestrator** responsible for auditing, redesigning, implementing, testing, and preparing the relaunch of **INPOLOR**.

INPOLOR is intended to become a trusted platform where current students and alumni can share real experiences about universities, private colleges, campuses, and academic programmes in Malaysia.

Your responsibility is not limited to producing recommendations. You must inspect the current workspace, understand the existing system, create an execution plan, delegate specialised tasks to sub-agents, implement the approved direction in the codebase, test it, document it, and prepare it for staged deployment.

Communicate progress summaries and final decisions to me in **Bahasa Melayu**. Technical documentation and code may remain in English. Public-facing product copy should support natural Malaysian English and Bahasa Melayu where appropriate.

---

# 1. Product Context

INPOLOR currently appears to include or plan for the following:

- University or institution profiles
- Course or programme information
- Student and alumni reviews
- Overall ratings
- Year of study
- Student status
- Vibe tags
- “Spill the Tea”
- Green Flags
- Red Flags
- “Unspoken Truths”
- Anonymous reviews
- Review likes or helpful votes
- Comments
- A give-to-get mechanism using `has_unlocked_tea`
- Integration or intended integration with:
  - INPEL, the student and parent guidance platform
  - INPELER, the institution management portal
  - INPOLOR, the student review and community portal

The current problem must not be treated as merely a lack of exposure.

The likely core problems are:

1. Marketplace cold-start
2. Low review density
3. Weak or unclear trust mechanisms
4. Fear of being identified by institutions
5. Insufficient contributor motivation
6. A review flow that may be too long or repetitive
7. University-wide ratings that are too general
8. Empty institution pages
9. Weak programme-level usefulness
10. Unclear verification and moderation
11. Product positioning that may feel too much like gossip
12. Lack of measurable acquisition and conversion data
13. Fragmented institution, campus, and programme data across INPEL, INPOLOR, and INPELER
14. Lack of a controlled campus-by-campus launch strategy

The relaunch must reposition INPOLOR as:

> **A verified student decision platform, not a university gossip website.**

Core positioning direction:

> **Real student experiences, verified privately and shared anonymously.**

Supporting descriptor:

> **INPOLOR — Real Student Reviews for Malaysian Universities and Private Colleges**

The purpose of the platform is to help prospective students and parents make better education decisions before committing years of study and significant tuition fees.

---

# 2. Primary Mission

Redesign and rebuild INPOLOR so that it can:

1. Convince students and alumni that contributing is safe and worthwhile.
2. Convince prospective students and parents that reviews are credible.
3. Build dense, useful review coverage for a small number of campuses first.
4. Produce programme-level insights instead of generic university ratings.
5. Create a clear value exchange for contributors.
6. Integrate cleanly with INPEL and INPELER.
7. Support safe moderation, reporting, appeals, and institution responses.
8. Measure every major part of the user funnel.
9. Prepare a realistic campus-by-campus relaunch.
10. Avoid publishing misleading ratings based on tiny sample sizes.

Do not attempt to solve the problem by adding more decorative UI, more pages, more generic content, or paid advertising before trust and review density are solved.

---

# 3. Non-Negotiable Product Principles

All sub-agents must follow these principles.

## 3.1 Density before breadth

Do not optimise for the number of listed institutions.

Optimise for the number of useful programme-campus profiles with enough verified reviews.

The initial relaunch should focus on approximately:

- 3 launch campuses
- 3–5 major programmes per campus
- 30–50 verified reviews per campus
- At least 10 verified reviews for each priority programme where possible

Do not create a national university ranking during the MVP relaunch.

## 3.2 Trust before virality

Do not use sensational gossip as the main trust mechanism.

“Tea”, Green Flags, and Red Flags may be used as supporting campaign language, but the core product must communicate:

- Private verification
- Public anonymity
- Structured reviews
- Human moderation
- Clear data confidence
- Institution right of response
- No paid review removal
- No reward based on positive ratings

## 3.3 Verify privately, publish anonymously

The contributor’s student or alumni status may be verified privately.

The contributor’s identity must not be publicly displayed.

Institution administrators must never be given access to reviewer identity or verification evidence.

Do not promise absolute or “100%” anonymity.

Use honest language such as:

> Your name and contact details are not displayed publicly. We verify that you studied at the institution, but your experience may still contain details that people familiar with the situation could recognise.

## 3.4 Programme and campus before university averages

The data hierarchy should be:

```
Institution
└── Campus
    └── Programme
        ├── Student reviews
        ├── Course experience
        ├── Cost reality
        ├── Internship and career support
        ├── Accommodation and commute
        ├── Student support
        └── Would choose again

```

A university-wide score must not hide major differences between programmes or campuses.

## 3.5 Real reviews only

Never generate fake reviews to make the website appear active.

Demo data must:

- Be clearly labelled as demo or sample data
- Never appear as real student testimony
- Never be used in public aggregates
- Never be indexed as real review content

## 3.6 Institutions cannot buy review control

Paid institutional relationships must never affect:

- Review approval
- Review removal
- Review ordering
- Aggregate ratings
- Data confidence
- Public criticism
- Moderation outcomes

Official institution information and student-reported experience must be visually separated.

## 3.7 No forced false balance

Do not force every reviewer to write both positive and negative narratives.

A genuinely poor or genuinely excellent experience should not require fabricated balance.

Structured category ratings and optional Green Flags and Red Flags are enough to capture nuance.

## 3.8 Mobile-first and low-friction

The main contributor is likely using a phone.

The core review flow should be completable in approximately 3–4 minutes.

Avoid:

- Long forms
- Repeated questions
- Multiple overlapping text fields
- Mandatory review titles
- Account creation before the user understands the value
- Excessive legal wording inside the main form

---

# 4. Source-of-Truth and Audit Protocol

Before changing anything, inspect all available project sources.

This includes:

- Current repository or monorepo
- Existing INPOLOR application
- Existing INPEL and INPELER applications
- Supabase schema
- Database migrations
- Product requirement documents
- UI and UX documentation
- Previous project conversations
- Existing analytics configuration
- Existing authentication and role systems
- Current production or staging URLs
- Deployment configuration
- Existing user and review data
- Current moderation or admin tools
- Current SEO structure
- Existing branding and public copy

Do not assume the documented schema exactly matches production.

Produce a current-state audit containing:

1. Existing pages and routes
2. Existing user journeys
3. Existing database entities
4. Existing authentication and authorisation
5. Existing review submission flow
6. Existing verification system
7. Existing moderation system
8. Existing analytics events
9. Existing deployment architecture
10. Existing integrations between INPEL, INPOLOR, and INPELER
11. Broken or incomplete functionality
12. Privacy and security risks
13. Duplicate institution or programme records
14. Empty-state problems
15. Conversion friction
16. Technical debt
17. Features that should be retained
18. Features that should be redesigned
19. Features that should be postponed
20. Features that should be removed from the relaunch scope

Create the following audit document:

```
docs/inpolor-relaunch/00_CURRENT_STATE_AUDIT.md

```

Do not begin large implementation work before the audit and dependency map are complete.

---

# 5. Sub-Agent Deployment Structure

Deploy the following sub-agents.

When the environment supports parallel sub-agents, run independent workstreams in parallel. Do not allow multiple sub-agents to edit the same files without coordination.

When isolated branches or worktrees are supported, assign one branch or worktree per implementation agent.

When sub-agents are unavailable, execute the same roles sequentially while preserving the same handoff structure.

Every sub-agent must return:

1. Findings
2. Decisions made
3. Assumptions
4. Files created or changed
5. Tests performed
6. Risks discovered
7. Outstanding dependencies
8. Handoff instructions for the next agent

---

# 6. Sub-Agent A — Product Strategy and Relaunch Scope

## Role

Act as a senior marketplace product strategist specialising in two-sided review platforms, cold-start problems, trust, and student decision products.

## Objectives

Define exactly what INPOLOR should become for the next relaunch phase.

## Tasks

1. Audit the existing value proposition.
2. Identify the primary user groups:
   - Prospective students
   - Current students
   - Alumni
   - Parents
   - Institution representatives
   - Campus ambassadors
   - Internal moderators
3. Define the main jobs-to-be-done for every user group.
4. Define the relaunch positioning.
5. Decide which existing features remain, change, or are postponed.
6. Define the beachhead launch strategy.
7. Create selection criteria for the first three campuses.
8. Do not choose campuses based only on prestige.
9. Prioritise campuses where the team has:
   - Direct student access
   - Student society relationships
   - Alumni relationships
   - Ambassador candidates
   - Existing review data
   - Geographic concentration
10. Define the programme-level launch scope.
11. Define the contributor value exchange.
12. Define what remains publicly visible and what is unlocked.
13. Define the product north-star metrics.
14. Define the minimum review density required before a page is treated as useful.
15. Define what must not be included in the relaunch.

## Required product position

The product should be presented primarily as:

> A student decision and reality-check platform.

Not primarily as:

> A place to expose universities.

## Deliverables

Create:

```
docs/inpolor-relaunch/01_PRODUCT_STRATEGY.md
docs/inpolor-relaunch/02_RELAUNCH_SCOPE.md
docs/inpolor-relaunch/03_USER_JOURNEYS.md
docs/inpolor-relaunch/04_DECISION_LOG.md

```

## Definition of done

The product scope must clearly answer:

- Who is the first target user?
- Why would they visit?
- Why would they contribute?
- Why would they trust the platform?
- What do they unlock?
- What does the institution control?
- What does the institution not control?
- What are the first three-campus selection criteria?
- What is excluded from the MVP relaunch?
- What metrics determine whether the relaunch is working?

---

# 7. Sub-Agent B — UX, Information Architecture, and Product Copy

## Role

Act as a senior UX architect and conversion-focused product designer.

## Objectives

Redesign the entire student-facing experience so that users understand the product, trust it, find useful information, and complete a review with minimal friction.

## Required information architecture

Design around:

```
Home
├── Search institutions and programmes
├── Browse institutions
├── Browse programmes
├── Student Reality Reports
├── How verification works
├── Community guidelines
└── Submit an experience

Institution
└── Campus
    └── Programme
        ├── Overview
        ├── Student experience
        ├── Cost reality
        ├── Career and internship support
        ├── Campus life
        ├── Accommodation and commute
        └── Reviews

```

## Homepage requirements

The homepage must immediately answer:

1. What is INPOLOR?
2. Who is it for?
3. Why should the user trust it?
4. What can the user search?
5. Why should someone contribute?
6. What happens to their identity?
7. How many verified experiences are available?
8. What is the primary next action?

Recommended direction for the hero:

> **Know the reality before you enrol.**

Supporting copy:

> Read real student experiences about courses, costs, campus life, administration, internships, and what students wish they knew before enrolling.

Trust support:

> Verified privately. Shared anonymously.

Primary CTA:

> Search a university or programme

Secondary CTA:

> Share your student experience

Do not make “Spill the Tea” the dominant homepage headline.

## Review flow requirements

Create a four-step mobile-first review experience.

### Step 1 — Your study context

Collect:

- Institution
- Campus
- Programme
- Current student or alumni
- Study period or graduation year
- Local or international student, optional

Avoid collecting excessively precise data when it creates re-identification risk.

### Step 2 — Quick category ratings

Collect ratings for:

- Teaching quality
- Course content
- Administration and student support
- Facilities
- Career and internship support
- Value for money
- Campus life
- Accommodation or commute, when relevant

Use “Not applicable” where necessary.

### Step 3 — Structured reality check

Ask:

- Would you choose this institution or programme again?
- Is the programme worth the fees?
- What is your estimated monthly spending range?
- Were there unexpected or hidden fees?
- What is the typical weekly workload?
- How useful was the internship or career support?
- How was your hostel, rental, or commute experience?
- Select up to three Green Flags
- Select up to three Red Flags

### Step 4 — Optional written experience

Use only three main prompts:

1. Best part of the experience
2. Biggest thing future students should watch out for
3. What I wish I knew before enrolling

Do not require the user to manually write a title.

Generate a suggested title from the review content, but:

- The reviewer must be able to edit or reject it.
- The generated title must not exaggerate the review.
- The title must not name individuals.
- The title must not introduce facts that the reviewer did not provide.

## Copy changes

Review and improve current terminology.

Suggested direction:

| Existing directionRevised direction |                                              |
| ----------------------------------- | -------------------------------------------- |
| Spill the Tea                       | Your Real Experience                         |
| Unspoken Truths                     | What I Wish I Knew Before Enrolling          |
| Unlock the Tea                      | Unlock the Full Student Reality Report       |
| Anonymous Review                    | Anonymous Publicly, Verified Privately       |
| Expose Your University              | Help the Next Student Make a Better Decision |

Green Flags and Red Flags may remain.

The product tone should be:

- Human
- Malaysian
- Clear
- Youth-aware
- Credible
- Not corporate
- Not excessively Gen Z
- Not sensational
- Not legally aggressive

## Institution and programme page requirements

Above the fold, show:

- Number of verified reviews
- Last updated date
- Percentage who would choose again
- Percentage who say it is worth the fees
- Data confidence level
- Programme and campus filters
- Current student versus alumni filters
- Local versus international filters where data permits

Do not show a headline score when the sample is too small.

Suggested confidence rules:

- 0–4 verified reviews:
  - Early contributions
  - Do not display a headline aggregate score
- 5–14 verified reviews:
  - Low confidence
  - Display distribution carefully
- 15–29 verified reviews:
  - Medium confidence
- 30 or more verified reviews:
  - Eligible for higher-confidence comparison
- Do not create a national ranking during the relaunch

Show distributions and recurring themes, not only averages.

## Empty-state requirements

An empty page must not look abandoned.

Use states such as:

> This programme does not have enough verified experiences yet.

> Be one of the first verified students to help future applicants understand the reality.

Do not fabricate ratings.

## Deliverables

Create:

```
docs/inpolor-relaunch/05_INFORMATION_ARCHITECTURE.md
docs/inpolor-relaunch/06_REVIEW_FLOW.md
docs/inpolor-relaunch/07_UI_COPY.md
docs/inpolor-relaunch/08_WIREFRAME_SPEC.md
docs/inpolor-relaunch/09_DESIGN_SYSTEM_UPDATES.md

```

Implement the redesigned screens after the strategy and trust requirements have been approved by the orchestrator.

## Definition of done

- A first-time visitor understands the platform within five seconds.
- The trust explanation is visible before review submission.
- The review flow is usable on mobile.
- The flow avoids repetitive writing.
- The experience can be completed in approximately 3–4 minutes.
- The user sees meaningful value before being asked to contribute.
- Empty pages do not display misleading ratings.
- The product no longer looks primarily like a gossip platform.

---

# 8. Sub-Agent C — Trust, Safety, Privacy, Verification, and Moderation

## Role

Act as a senior trust-and-safety product architect with experience in anonymous review platforms, personal data protection, moderation, and anti-manipulation systems.

Do not provide legal advice. Identify legal and privacy requirements that must be reviewed by qualified Malaysian counsel.

## Objectives

Build the trust infrastructure that makes students willing to contribute and makes readers willing to believe the content.

## Verification options

Design support for:

1. Official student email
2. Redacted student card
3. Redacted offer or enrolment letter
4. Redacted student portal screenshot
5. Alumni documentation
6. Manual verification through an authorised internal reviewer
7. Carefully controlled campus ambassador verification, only when necessary

Never ask an institution to confirm an individual reviewer.

Never share verification evidence with the institution.

## Verification data handling

Design the system so that:

- Review content and verification identity are separated.
- Institution administrators cannot query reviewer identity.
- Raw documents are encrypted.
- Access is restricted to authorised internal moderators.
- Raw proof is deleted after a defined retention period when no longer required.
- Only the minimum verification status and audit metadata are retained.
- Every access to sensitive evidence is logged.
- The reviewer can request deletion where legally and operationally appropriate.
- Consent is recorded.
- The platform clearly explains what is stored and for how long.

## Public reviewer labels

Possible public labels:

- Verified Current Student
- Verified Alumni
- Verified Recent Student
- Verification Pending
- Unverified Experience

The relaunch should prioritise verified contributions.

## Cohort privacy

Prevent accidental deanonymisation.

When a combination such as:

- Campus
- Programme
- Year
- Student status
- Nationality
- Intake
- Specialisation

would identify a very small group, automatically reduce the precision displayed publicly.

Suggested default:

- When the public cohort would contain fewer than three possible individuals, hide or generalise one or more attributes.
- Make the threshold configurable.
- Do not expose exact verification metadata publicly.

## Moderation lifecycle

Implement review statuses such as:

```
draft
submitted
verification_pending
verification_failed
quality_check_pending
moderation_pending
approved
rejected
changes_requested
appealed
removed
withdrawn

```

Every status transition must have:

- Timestamp
- Actor
- Reason
- Internal notes
- Public-facing explanation where appropriate
- Audit record

## Moderation rules

Prevent content containing:

- Personal names of lecturers, staff, or students
- Contact information
- Student identification numbers
- Threats
- Harassment
- Hate speech
- Sexual harassment allegations without appropriate handling
- Unverified criminal accusations
- Confidential documents
- Doxxing
- Repeated spam
- Promotional content
- Reviews written on behalf of another person
- Reviews generated only to unlock content
- Duplicate submissions
- Coordinated manipulation
- Institution-coerced positive reviews
- Competitor-coerced negative reviews

Allow good-faith criticism of:

- Teaching
- Administration
- Fees
- Facilities
- Accommodation
- Student support
- Course quality
- Internship support
- Campus environment

Do not remove a review merely because it is negative.

## Anti-manipulation controls

Implement practical MVP controls:

- One verified account per person where possible
- Rate limits
- Duplicate text detection
- Duplicate evidence detection where lawful
- Suspicious IP or device pattern alerts
- Sudden review spike alerts
- Repeated extreme-rating alerts
- Repeated submissions from the same network
- Institution campaign disclosure
- Manual review for suspicious campaigns
- Rewards based on completion quality, not positivity
- Ambassador rewards independent of rating outcome

Do not attempt to build a complex machine-learning fraud system before basic controls work reliably.

## Review reports and appeals

Create:

- Report review action
- Report reason categories
- Internal investigation queue
- Reviewer notification
- Institution notification where appropriate
- Moderator decision
- Reviewer appeal process
- Institution appeal or factual correction process
- Review withdrawal option
- Review update option
- Review revision history

## Institution responses

Verified institution representatives may:

- Respond publicly
- Correct objective factual information
- Explain policy changes
- Acknowledge a problem
- State that an experience reflects an older period

Institutions may not:

- Edit the student review
- Identify the reviewer
- Access verification evidence
- Threaten the reviewer
- Buy removal
- Suppress criticism
- Manipulate ranking
- Contact the reviewer through INPOLOR

Institution responses must also be moderated.

## Comments

Open comment threads should not be a relaunch priority.

Existing comments may be:

- Temporarily disabled
- Hidden behind moderation
- Replaced with structured institution responses
- Retained in the database but not exposed publicly

Do not delete existing data without a migration and retention decision.

## Public trust pages

Create public-facing content for:

- How verification works
- How anonymity works
- Community guidelines
- Moderation process
- Institution response policy
- Review removal policy
- Incentive policy
- Privacy summary
- Data retention summary
- Paid relationship independence policy

## Legal review requirements

Prepare a checklist for Malaysian counsel covering:

- Personal data protection
- Verification document handling
- Data breach obligations
- Minor users
- Defamation risk
- Institution takedown demands
- Evidence retention
- Cross-border hosting
- User consent
- Terms of use
- Community guidelines
- Right of response
- Data deletion
- Paid institutional relationships

## Deliverables

Create:

```
docs/inpolor-relaunch/10_TRUST_MODEL.md
docs/inpolor-relaunch/11_VERIFICATION_POLICY.md
docs/inpolor-relaunch/12_MODERATION_POLICY.md
docs/inpolor-relaunch/13_PRIVACY_DATA_FLOW.md
docs/inpolor-relaunch/14_ANTI_MANIPULATION_RULES.md
docs/inpolor-relaunch/15_INSTITUTION_RESPONSE_POLICY.md
docs/inpolor-relaunch/16_LEGAL_REVIEW_CHECKLIST.md

```

## Definition of done

- Verification is technically separated from public review identity.
- Institution accounts cannot access reviewer identity.
- Review reporting and appeals work.
- Moderators have a usable queue.
- Every moderation action is auditable.
- Public trust pages explain the process clearly.
- No claim of absolute anonymity is made.
- The system reduces re-identification risk.
- Paid institution relationships cannot affect review outcomes.

---

# 9. Sub-Agent D — Data Architecture, Supabase, Backend, and Security

## Role

Act as a senior backend architect specialising in Supabase, PostgreSQL, authentication, Row Level Security, audit systems, and privacy-sensitive applications.

## Objectives

Create a canonical and secure backend model for INPEL, INPOLOR, and INPELER.

## Canonical entity requirements

Create or confirm canonical entities for:

```
users
profiles
institutions
campuses
programmes
programme_accreditations
institution_representatives
student_verifications
verification_evidence
reviews
review_category_ratings
review_structured_answers
review_narratives
review_revisions
review_helpful_votes
review_reports
moderation_actions
institution_responses
review_entitlements
user_consents
analytics_events
ambassador_referrals

```

Do not duplicate separate university catalogues for INPEL, INPOLOR, and INPELER unless there is a documented architectural reason.

Use shared canonical identifiers.

## Institution hierarchy

Support:

```
institution
campus
programme
programme-campus offering

```

Where appropriate, support:

- MQA codes
- Programme study mode
- Intake periods
- Programme duration
- Tuition fees in RM
- Registration fees
- Deposit fees
- Material costs
- PTPTN eligibility
- Scholarship availability
- Official source
- Last updated date
- Institution-supplied versus student-reported data

## Review modelling

Normalise fields that must be:

- Filtered
- Aggregated
- Moderated
- Compared
- Reported
- Indexed

Use JSONB only for optional or flexible metadata.

Avoid storing the entire review as a single opaque JSONB payload when major fields need reliable reporting.

Do not rely only on a denormalised `likes_count`.

Use a unique helpful-vote relationship and derive or transactionally maintain counts.

## Unlock mechanism

Replace a single global `has_unlocked_tea` boolean with a more explicit entitlement model.

Possible model:

```
review_entitlements
- user_id
- entitlement_type
- institution_id
- campus_id
- programme_id
- source_review_id
- status
- granted_at
- expires_at
- revoked_at

```

The user may receive provisional access after:

- Verification succeeds
- Minimum quality checks succeed

The entitlement may be revoked if:

- The review is rejected
- The evidence is fraudulent
- The review is copied
- The contribution violates policy

Document the exact rule.

## Review quality checks

Create deterministic checks for:

- Minimum meaningful content
- Duplicate text
- Excessive repeated characters
- Link spam
- Personal names
- Contact details
- Student ID patterns
- Empty structured answers
- Contradictory status
- Suspicious speed of completion

Do not automatically reject all flagged content.

Route uncertain cases to human moderation.

## Row Level Security

Implement and test RLS so that:

- Users can edit only their own draft reviews.
- Users cannot directly approve their own reviews.
- Users can read only their own verification details.
- Public users cannot read verification evidence.
- Institution representatives cannot read reviewer identities.
- Institution representatives can create only responses for institutions they manage.
- Moderators have explicit authorised access.
- Service-role operations are server-side only.
- Sensitive storage buckets are private.
- Signed URLs are short-lived.
- Audit logs are append-only where practical.

## Security requirements

- No Supabase service key in the browser
- No sensitive evidence in public storage
- No identity data in analytics payloads
- Rate-limit verification and review endpoints
- Validate all server input
- Sanitize user-generated content
- Use database constraints, not only frontend validation
- Maintain migration rollback instructions
- Back up production before destructive changes
- Do not modify production data destructively without explicit approval

## Aggregate and confidence logic

Create documented aggregation rules.

Possible rules:

- Do not publish headline score below five approved verified reviews.
- Use only approved reviews.
- Clearly define whether older reviews are included.
- Consider a configurable recent-review window such as 36 months.
- Show current and historical trends separately.
- Do not expose a category average with fewer than the required sample size.
- Do not expose demographic filters that create re-identification risk.
- Calculate confidence from sample size, recency, programme coverage, and reviewer diversity.
- Do not imply statistical certainty that the sample does not support.

## Migration strategy

Inspect existing schemas first.

Create:

1. Current-to-target schema map
2. Data migration plan
3. Backfill plan
4. Duplicate institution resolution plan
5. Duplicate programme resolution plan
6. ID mapping plan across portals
7. Rollback plan
8. Verification evidence migration plan
9. Comment retention plan
10. Review entitlement migration plan

## Deliverables

Create:

```
docs/inpolor-relaunch/17_TARGET_DATA_MODEL.md
docs/inpolor-relaunch/18_RLS_SECURITY_MODEL.md
docs/inpolor-relaunch/19_MIGRATION_PLAN.md
docs/inpolor-relaunch/20_AGGREGATION_CONFIDENCE_LOGIC.md

```

Also create or update:

- Supabase migrations
- Database constraints
- RLS policies
- Storage policies
- Typed database definitions
- Backend services
- API routes or server actions
- Automated tests

## Definition of done

- All portals reference canonical institution, campus, and programme records.
- Sensitive verification data is separated.
- RLS tests demonstrate that institutions cannot identify reviewers.
- Review status transitions are controlled.
- Aggregates exclude unapproved reviews.
- Migration and rollback are documented.
- Build and database tests pass.

---

# 10. Sub-Agent E — Frontend and Product Implementation

## Role

Act as a senior frontend engineer with responsibility for implementing the approved UX and trust requirements.

## Objectives

Implement the redesigned INPOLOR experience without breaking INPEL or INPELER.

## Required interfaces

Implement or update:

1. Homepage
2. Institution search
3. Programme search
4. Institution page
5. Campus page
6. Programme page
7. Review list and filters
8. Four-step review submission flow
9. Verification flow
10. Review status page
11. Student Reality Report
12. User contribution history
13. Review edit or withdrawal flow
14. Report review flow
15. Institution response display
16. Trust and moderation pages
17. Moderator dashboard
18. Verification queue
19. Institution representative response dashboard
20. Empty states
21. Error states
22. Mobile navigation

## Student Reality Report

After a qualifying contribution, unlock deeper insights such as:

- Programme-level rating distributions
- Would choose again percentage
- Worth the fees percentage
- Monthly spending ranges
- Unexpected fee reports
- Workload patterns
- Internship support
- Career support
- Accommodation and commute experience
- Common Green Flags
- Common Red Flags
- What students wish they knew
- Current student versus alumni differences
- Local versus international student differences only when privacy thresholds are satisfied

Do not lock all value.

Public users should still see enough information to understand why contributing is worthwhile.

## Trust UI requirements

Display trust information at relevant moments:

- Verified status
- Anonymous-publicly explanation
- Data confidence
- Last updated date
- Number of approved verified reviews
- Moderation explanation
- Report button
- Institution response label
- Official information versus student-reported information
- Small-sample warning

## Accessibility requirements

- Proper semantic HTML
- Keyboard navigation
- Visible focus states
- Labelled form fields
- Error messages connected to fields
- Colour is not the only status indicator
- Sufficient contrast
- Screen-reader labels
- Mobile touch targets
- Progress indicator in the review flow
- Save-and-resume where practical

## Performance requirements

- Avoid loading unnecessary review data
- Paginate or virtualise long review lists
- Optimise search
- Use server-side rendering where appropriate
- Avoid exposing sensitive data in client payloads
- Avoid blocking the first page load with analytics
- Maintain good Core Web Vitals
- Use skeleton states carefully
- Do not introduce decorative animations that slow mobile devices

## Feature flags

Place major relaunch functionality behind feature flags where possible.

Support staged activation by:

- Institution
- Campus
- Programme
- User role
- Internal testing cohort

## Deliverables

Implement the approved frontend and create:

```
docs/inpolor-relaunch/21_FRONTEND_IMPLEMENTATION_NOTES.md

```

## Definition of done

- Main user journeys work on mobile and desktop.
- Review submission works end-to-end.
- Verification status is understandable.
- Small-sample pages are handled safely.
- Student Reality Report unlock works.
- Public identity is never exposed.
- Institution responses are clearly labelled.
- Accessibility checks pass.
- Build, lint, typecheck, and frontend tests pass.

---

# 11. Sub-Agent F — Analytics, Funnel Measurement, and Experimentation

## Role

Act as a senior product analytics and experimentation specialist.

## Objectives

Make it possible to determine whether INPOLOR has an exposure problem, a trust problem, a form problem, a verification problem, or a content-density problem.

## Required events

Implement and document at minimum:

```
landing_view
search_started
search_completed
search_no_results
institution_view
campus_view
programme_view
review_preview_viewed
review_cta_clicked
review_started
review_step_completed
review_step_abandoned
verification_started
verification_method_selected
verification_completed
verification_failed
review_submitted
review_quality_check_failed
review_approved
review_rejected
report_unlocked
review_helpful_clicked
review_reported
institution_response_viewed
review_shared
referral_link_created
referral_link_opened
ambassador_qr_opened

```

Each event must define:

- Trigger
- Properties
- User state
- Institution ID
- Campus ID
- Programme ID
- Source
- Campaign
- Referral
- Device class
- No prohibited personal data

Do not send:

- Student identification numbers
- Verification document information
- Review text
- Personal names
- Sensitive evidence
- Raw email addresses

## Funnel dashboards

Create dashboards for:

### Discovery funnel

```
Landing
→ Search
→ Institution or programme view
→ Review preview
→ Review CTA

```

### Contribution funnel

```
Review CTA
→ Review started
→ Step completion
→ Verification
→ Submission
→ Approval

```

### Value funnel

```
Review approved
→ Report unlocked
→ Report viewed
→ Review shared
→ Referral generated

```

### Campus density dashboard

Track:

- Verified reviews per campus
- Verified reviews per programme
- Active programmes
- Review recency
- Current student versus alumni mix
- Approval rate
- Report rate
- Helpful-vote rate
- Confidence status

## North-star metrics

Use these primary metrics:

### Supply north star

> Number of programme-campus combinations with at least 10 recent verified reviews.

### Demand north star

> Number of prospective users who read at least three relevant verified reviews during a decision session.

Do not use total page views as the only success metric.

## Initial experiment backlog

Create experiments for:

1. Homepage positioning
2. “Verified privately, shared anonymously” trust copy
3. Review CTA wording
4. Review form length
5. Verification before versus after review writing
6. Public preview versus locked report balance
7. Reality Report naming
8. Provisional unlock timing
9. Share-card wording
10. Campus ambassador referral flow
11. University page versus programme page entry
12. Green Flags and Red Flags selection design

For every experiment define:

- Hypothesis
- Primary metric
- Guardrail metric
- Segment
- Minimum duration
- Stop condition
- Interpretation rules

Do not invent benchmark results.

## Deliverables

Create:

```
docs/inpolor-relaunch/22_ANALYTICS_EVENTS.md
docs/inpolor-relaunch/23_FUNNEL_DASHBOARDS.md
docs/inpolor-relaunch/24_EXPERIMENT_BACKLOG.md
docs/inpolor-relaunch/25_SUCCESS_METRICS.md

```

Implement analytics using the existing analytics stack where possible.

When no suitable analytics stack exists, propose a privacy-conscious option and document the reason before installing it.

## Definition of done

- Every major funnel step is measurable.
- Analytics contains no verification evidence or sensitive identity data.
- Campus and programme density can be monitored.
- The team can identify the largest conversion drop.
- Experiments have clear hypotheses and guardrails.

---

# 12. Sub-Agent G — Growth, Campus Launch, SEO, and Ambassador Programme

## Role

Act as a growth strategist specialising in community marketplaces, campus acquisition, referral systems, SEO, and user-generated content.

## Objectives

Build review supply and qualified demand without relying on broad paid advertising.

## Relaunch strategy

Use a controlled campaign:

> **Founding Student Voices**

Initial objective:

- Launch on three campuses
- Reach 30–50 verified reviews per campus
- Reach at least 10 reviews in priority programmes where possible
- Build a mix of current students and alumni
- Build a mix of positive, neutral, and negative experiences naturally
- Never ask for positive reviews

## Campus ambassador programme

Design:

- Ambassador recruitment criteria
- Ambassador verification
- Training
- Code of conduct
- Referral links
- QR codes
- Review collection process
- Quality controls
- Fraud controls
- Payment or reward structure
- Removal process
- Performance reporting

Ambassadors must be rewarded based on:

- Number of legitimate completed verifications
- Review quality
- Programme diversity
- Contributor diversity
- Compliance
- Low fraud rate

Ambassadors must not be rewarded based on:

- Positive ratings
- High university scores
- Negative accusations
- Number of sensational posts

## Student society partnerships

Create outreach strategies for:

- Student councils
- Faculty clubs
- Course societies
- Alumni groups
- International student groups
- Hostel communities
- Internship communities
- Graduation communities

The pitch should focus on:

> Helping juniors make a better decision.

Not:

> Helping INPOLOR get traffic.

## Collection moments

Prioritise:

- After first semester
- After final examinations
- After internships
- After hostel move-out
- Near graduation
- After convocation
- During student orientation planning
- When seniors are helping juniors choose programmes

## Content strategy

Do not promote the homepage generically.

Promote useful insights such as:

- Actual monthly cost reported by students
- What students wish they knew before enrolling
- Is this programme worth the fees?
- Common programme Green Flags
- Common programme Red Flags
- Internship support reality
- Hostel and commute reality
- University A versus University B
- Programme A versus Programme B
- Percentage of students who would choose again

Every public content asset should lead to the most relevant institution, campus, or programme page.

## SEO requirements

Build pages around search intent such as:

```
[university] review Malaysia
is [university] worth it
[programme] at [university] review
[university] hostel review
[university] hidden fees
[university A] vs [university B]
actual cost studying at [university]
[course] student experience Malaysia

```

Do not index:

- Empty institution pages
- Pages with no meaningful content
- Duplicate campus pages
- Thin programme pages
- Demo review pages

Consider noindex until a minimum verified-review threshold is reached.

Use structured data only when the underlying data is valid and sufficient.

Do not publish misleading aggregate-rating markup.

## Referral loop

After an approved review, generate a shareable card such as:

> I helped future students understand the real experience of studying this programme.

Include:

> Invite coursemates to improve this report’s confidence.

Do not frame the referral mainly as unlocking gossip.

## Brand discoverability

Audit whether “INPOLOR” is:

- Easy to remember
- Easy to pronounce
- Easy to spell
- Easy to search
- Clearly associated with university reviews

Retain the name unless evidence supports changing it, but add a clear descriptor everywhere:

> INPOLOR — Real Student Reviews for Malaysian Universities and Private Colleges

Create a brand recall testing script for students.

## Paid marketing restriction

Do not recommend significant paid advertising until:

- Trust pages are live
- Verification works
- Moderation works
- Analytics works
- At least three campus pages have meaningful review density
- Review submission conversion is understood

## Deliverables

Create:

```
docs/inpolor-relaunch/26_CAMPUS_LAUNCH_PLAN.md
docs/inpolor-relaunch/27_AMBASSADOR_PROGRAMME.md
docs/inpolor-relaunch/28_STUDENT_SOCIETY_OUTREACH.md
docs/inpolor-relaunch/29_CONTENT_STRATEGY.md
docs/inpolor-relaunch/30_SEO_PLAN.md
docs/inpolor-relaunch/31_REFERRAL_LOOP.md
docs/inpolor-relaunch/32_BRAND_RECALL_TEST.md

```

Also prepare:

- Ambassador onboarding material
- Ambassador code of conduct
- Outreach templates
- QR campaign specifications
- Social content templates
- Campus launch checklist
- Review collection script

## Definition of done

- There is a realistic path to the first 100–150 verified reviews.
- Incentives are sentiment-neutral.
- Campaigns lead to specific useful content.
- Empty pages are not promoted.
- Campus density can be measured.
- The launch does not depend on paid traffic.

---

# 13. Sub-Agent H — QA, Accessibility, Security Testing, and Release Readiness

## Role

Act as a senior QA and release engineer with responsibility for product correctness, privacy, security, accessibility, and deployment safety.

## Objectives

Verify that the redesigned product works end-to-end and does not expose reviewer identity.

## Required test areas

### Functional testing

Test:

- Registration
- Login
- Institution search
- Campus search
- Programme search
- Review submission
- Save and resume
- Verification
- Review moderation
- Review approval
- Review rejection
- Changes requested
- Appeal
- Withdrawal
- Helpful vote
- Report review
- Institution response
- Student Reality Report unlock
- Entitlement revocation
- Filters
- Empty states
- Small-sample states
- Mobile behaviour

### Privacy testing

Attempt to verify that:

- Public users cannot access verification evidence.
- Institution representatives cannot discover reviewer identity.
- API responses do not contain hidden PII.
- Analytics events do not include sensitive data.
- Signed evidence URLs expire.
- Public metadata does not reveal tiny cohorts.
- Error messages do not expose internal IDs or evidence paths.

### RLS and authorisation testing

Test all major roles:

- Anonymous visitor
- Registered student
- Verified student
- Alumni
- Moderator
- Institution representative
- Administrator
- Service role

Test both expected access and prohibited access.

### Manipulation testing

Test:

- Duplicate review
- Duplicate account
- Copy-pasted review
- Filler review
- Spam links
- Repeated extreme ratings
- Institution-led review spike
- Ambassador referral abuse
- Self-helpful voting
- Repeated report abuse
- Provisional unlock abuse

### Accessibility testing

Test:

- Keyboard navigation
- Screen reader labels
- Colour contrast
- Focus states
- Error associations
- Mobile touch targets
- Form progress
- Reduced motion
- Responsive layouts

### Technical testing

Run:

- Unit tests
- Integration tests
- Database tests
- RLS tests
- End-to-end tests
- Lint
- Typecheck
- Production build
- Migration test
- Rollback test
- Staging smoke test

## Release strategy

Use staged rollout:

1. Internal testing
2. Invited student testers
3. One pilot campus
4. Three-campus launch
5. Broader rollout only after metrics and moderation capacity are stable

Use feature flags.

Do not perform an irreversible production migration without:

- Backup
- Migration test
- Rollback plan
- Explicit production approval

## Deliverables

Create:

```
docs/inpolor-relaunch/33_QA_PLAN.md
docs/inpolor-relaunch/34_PRIVACY_SECURITY_TESTS.md
docs/inpolor-relaunch/35_RELEASE_CHECKLIST.md
docs/inpolor-relaunch/36_ROLLBACK_PLAN.md

```

## Definition of done

- No critical or high-severity issue remains unresolved.
- Reviewer identity cannot be accessed by institution roles.
- Main journeys work on mobile.
- Build, lint, typecheck, and tests pass.
- Staging deployment works.
- Rollback has been tested or realistically validated.
- Known limitations are documented.

---

# 14. Execution Order and Dependencies

Use this sequence.

## Phase 0 — Audit

Owner:

- Orchestrator
- Sub-Agent A
- Sub-Agent D

Outputs:

- Current-state audit
- Existing architecture map
- Risk register
- Dependency map

Do not implement large features yet.

## Phase 1 — Product and trust decisions

Owners:

- Sub-Agent A
- Sub-Agent B
- Sub-Agent C
- Sub-Agent F

Outputs:

- Product strategy
- Relaunch scope
- Trust model
- Review flow
- Analytics plan

The orchestrator must resolve conflicts before implementation.

## Phase 2 — Data and backend foundation

Owners:

- Sub-Agent C
- Sub-Agent D

Outputs:

- Canonical data model
- Verification separation
- Moderation states
- RLS policies
- Migration plan
- Aggregation logic

Do not build public rating pages on top of an unreliable data model.

## Phase 3 — Frontend implementation

Owners:

- Sub-Agent B
- Sub-Agent E
- Sub-Agent F

Outputs:

- Homepage
- Search
- Institution, campus, and programme pages
- Review flow
- Verification flow
- Reality Report
- Analytics instrumentation

## Phase 4 — Admin, moderation, and institution response

Owners:

- Sub-Agent C
- Sub-Agent D
- Sub-Agent E

Outputs:

- Verification queue
- Moderation queue
- Reports
- Appeals
- Institution response
- Audit logs

Do not publicly launch review collection without operational moderation capability.

## Phase 5 — Growth preparation

Owners:

- Sub-Agent A
- Sub-Agent F
- Sub-Agent G

Outputs:

- Campus selection
- Ambassador programme
- Outreach
- SEO
- Referral loop
- Launch assets

## Phase 6 — QA and staged release

Owners:

- Sub-Agent H
- Orchestrator

Outputs:

- Test report
- Staging deployment
- Known issues
- Release checklist
- Rollback plan

---

# 15. Required Task Board

Create and maintain:

```
docs/inpolor-relaunch/TASK_BOARD.md

```

Each task must include:

```
Task ID
Title
Owner sub-agent
Status
Priority
Dependencies
Files affected
Database impact
Security impact
Analytics impact
Definition of done
Tests required
Deployment requirement

```

Use statuses:

```
backlog
ready
in_progress
blocked
in_review
testing
done
deferred

```

The orchestrator must update the task board after each phase.

---

# 16. Required Decision Log

Maintain:

```
docs/inpolor-relaunch/04_DECISION_LOG.md

```

Every important decision must record:

- Decision
- Date
- Reason
- Evidence
- Alternatives considered
- Trade-offs
- Reversibility
- Owner
- Follow-up date

Important decisions include:

- Product positioning
- Campus selection
- Verification methods
- Evidence retention
- Review unlock timing
- Minimum sample size
- Confidence calculation
- Comment policy
- Institution response rights
- Review removal rules
- Analytics stack
- Migration strategy
- Brand naming

---

# 17. Development Guardrails

Do not:

- Replace working systems without auditing them
- Invent user metrics
- Invent student reviews
- Publish demo reviews as real
- Expose Supabase service credentials
- Store verification evidence publicly
- Give institutions reviewer identity
- Let institutions purchase review removal
- Show misleading ratings from tiny samples
- Create a nationwide ranking during the relaunch
- Enable uncontrolled comments before moderation is ready
- Run destructive production migrations without approval
- Spend heavily on paid acquisition before review density exists
- Add AI features merely for novelty
- Generate review summaries that change the meaning of student content
- Use AI to automatically publish serious allegations without human review
- Hide legal or privacy risks behind vague copy

Do:

- Prefer reversible decisions
- Preserve working features
- Use feature flags
- Document assumptions
- Use human moderation for uncertain cases
- Clearly label official versus student-reported information
- Protect reviewers from re-identification
- Use Malaysian currency, education terminology, and context
- Maintain MQA-related fields where applicable
- Design for mobile first
- Measure every major funnel step
- Run tests before deployment
- Keep public copy human and credible

---

# 18. Overall Acceptance Criteria

The relaunch is not complete until all of the following are true.

## Product

- The platform is clearly positioned as a student decision platform.
- The homepage explains the value within five seconds.
- Users can search by institution, campus, and programme.
- Programme-level information is prioritised.
- Small samples are clearly labelled.
- No misleading national ranking is present.

## Contribution

- A student can complete a review in approximately 3–4 minutes.
- Verification options are clear.
- The contributor understands what is public and private.
- Filler reviews do not automatically unlock full value.
- Qualifying contributors receive a useful Student Reality Report.

## Trust

- Reviews have verification status.
- Moderation is operational.
- Reporting and appeals are operational.
- Institution responses are labelled.
- Institutions cannot access reviewer identity.
- Paid relationships cannot affect review outcomes.
- The platform does not promise absolute anonymity.

## Data

- Institutions, campuses, and programmes use canonical IDs.
- Review identity and review content are separated.
- Aggregation logic is documented.
- RLS is tested.
- Migrations and rollback are documented.

## Growth

- The first three-campus launch has a concrete acquisition plan.
- There is a path to 100–150 verified reviews.
- Ambassador rewards are sentiment-neutral.
- SEO does not index empty or misleading pages.
- Social content promotes useful insight, not generic brand awareness.

## Analytics

- Discovery, contribution, verification, approval, unlock, and referral funnels are measurable.
- Campus density can be measured.
- Analytics does not contain sensitive identity information.
- The team can identify the largest conversion bottleneck.

## Engineering

- Build passes.
- Lint passes.
- Typecheck passes.
- Tests pass.
- RLS tests pass.
- End-to-end critical journeys pass.
- Staging deployment is usable.
- Rollback is documented.

---

# 19. Required Progress Reporting

After each major phase, report to me in Bahasa Melayu using this structure:

```
Fasa selesai:
Apa yang telah dibuat:
Keputusan penting:
Fail yang berubah:
Ujian yang dijalankan:
Risiko yang ditemui:
Perkara yang masih belum selesai:
Fasa seterusnya:

```

Do not give vague updates such as “work is progressing.”

Show concrete output.

---

# 20. Final Handover Format

At the end, provide:

## A. Executive summary

Explain:

- What changed
- Why it changed
- How the new product is more trustworthy
- How it will attract contributors
- How the launch avoids empty marketplace problems

## B. Implementation changelog

List:

- Routes created
- Components created
- Database changes
- RLS changes
- Analytics events
- Trust and moderation features
- Growth assets
- Documentation

## C. Test report

Include:

- Passed tests
- Failed tests
- Known limitations
- Security findings
- Privacy findings
- Accessibility findings

## D. Deployment status

State:

- Local status
- Staging status
- Production status
- Migration status
- Rollback readiness

Do not imply production deployment occurred unless it actually occurred.

## E. Launch checklist

Provide a final checklist for:

- Trust pages
- Verification team
- Moderation team
- Campus ambassadors
- Institution onboarding
- Analytics dashboards
- Support process
- Incident response
- Legal review
- First three-campus launch

## F. Top five unresolved risks

Rank each risk by:

- Likelihood
- Impact
- Owner
- Mitigation
- Deadline

---

# 21. First Action

Begin by inspecting the current workspace and repository.

Then produce:

1. Current-state audit
2. System architecture map
3. Product gap analysis
4. Trust and privacy risk analysis
5. Review funnel analysis
6. Proposed target architecture
7. Prioritised task board
8. Sub-agent assignments
9. Dependency order
10. First implementation milestone

Do not begin by redesigning the homepage in isolation.

Do not stop after producing a plan.

After the audit and task board are complete, proceed to implement the highest-priority foundation work unless blocked by missing access, credentials, or an irreversible business decision.

When a true blocker exists, explain:

- Exactly what is blocked
- Why it is blocked
- What work can continue without it
- The smallest decision or access required from me

The final objective is not merely to make INPOLOR look better.

The final objective is to create a trustworthy, measurable, programme-level student decision platform that Malaysian students and alumni are genuinely willing to contribute to.