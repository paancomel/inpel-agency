# INPOLOR Public Launch — Product Specification

**Status:** Approved product direction from founder discovery

**Date:** 14 August 2026

**Launch target:** 30 November 2026

**Product:** INPOLOR — anonymous, community-led university experience reviews

**Market at launch:** Kuala Lumpur and Selangor

**Implementation note:** This specification defines the approved target product. It intentionally supersedes conflicting INPOLOR product behaviour in the older prototype blueprint. It is not evidence that the features are already implemented.

---

## 1. Purpose and launch outcome

INPOLOR helps prospective students make better education decisions through real, structured experiences from students and alumni. It is not a university directory built from marketing copy, nor an official ranking.

The first launch proves two things:

1. Students and alumni will submit useful, detailed experiences.
2. A credible student-review community can begin around private higher-education institutions.

### 30-day launch metrics

| Metric | Target |
| --- | ---: |
| Submitted reviews | 1,000 |
| Published reviews | 600 |
| Seed institutions | 20 |
| Minimum reviews before an institution enters ranking | 5 |
| Review moderation capacity baseline | 20 reviews/day |
| Reward campaign budget | RM10,000 |

Acquisition is expected from Threads, TikTok, and Meta paid ads, each targeting 300–400 submissions. Attribution must be recorded from campaign landing through submission, approval, and payment.

## 2. Non-negotiable product principles

- All public reviewer content is anonymous. Public review cards show only course and year of study.
- Public content is never published without manual approval by an authorised content moderator.
- A reward is an incentive, not a promise. It is conditional on campaign availability and approval.
- A university never receives reviewer identity, email, date of birth, eWallet data, device/IP signals, or fraud status.
- Only redacted, metadata-stripped photos are stored for publication.
- INPOLOR is mobile-first, bilingual (Bahasa Malaysia and English), and meets WCAG 2.2 AA.
- INPOLOR launches before the full public INPELER portal, but a closed minimum INPELER claim-and-publish workflow is required for official university replies.

## 3. Users and access

| User | Access |
| --- | --- |
| Visitor | Read directory, institution profiles, published reviews, public gallery, and blurred *Unspoken Truth* teasers. Cannot save, compare, react, comment, ask, answer, report, or submit. |
| Community user | Logged in using email magic link or Google. Must be 18+. Can submit, save, compare, like, comment, ask/answer anonymously, report, and manage their own review/reward status. |
| Approved reviewer | Community user with at least one approved review. Receives the system label `Approved reviewer` in Q&A where applicable. |
| University representative | Separate role/account. Gains only public-facing official-response rights after complete INPELER profile publication and manual approval. |
| Content moderator | Reviews, photos, comments, Q&A, reports, *Unspoken Truth* classification, and official replies. No unnecessary payment access. |
| Payment moderator | Reward claim and payment records only. |
| Primary admin | Founder. Manages roles, institution approval, escalations, privacy requests, and policy decisions. |

Community users select a date of birth at account creation. It cannot be changed in self-service; verified support can correct a genuine error. Users under 18 cannot use INPOLOR.

## 4. Public pages and navigation

### Home / directory

The home page leads with the mission: **“Bantu pelajar lain buat keputusan lebih baik.”** The primary CTA is **“Tulis review dan dapat RM10”**; the reward remains secondary to the community benefit.

The directory covers private institutions in Kuala Lumpur and Selangor. It supports:

- search by institution name or course;
- filters for community-rating range and monthly living-cost range;
- sort modes: highest rating (default), most reviews, newest review, and lowest living cost;
- institution cards showing location, rating/sample label, review count, and living-cost data where available.

Location is shown on cards but is not a launch filter.

### Institution profile

The profile is the public decision page. The header shows the total score and all eight rating dimensions. Its content order is:

1. Community strengths and weaknesses;
2. Review feed;
3. Estimated monthly living cost;
4. Anonymous university Q&A;
5. Curated community photo gallery;
6. Basic institution information.

Basic institution information consists of official name, short area/address, official website, institution type, and map link. Seed facts are curated from verifiable sources. Their provenance and update history are moderator-only.

### Review feed and cards

The feed defaults to **Most helpful** and can be sorted by newest, highest rating, or lowest rating. It can be filtered by course and study year. A `Complete review` badge identifies reviews that fulfilled the comprehensive contribution standard, but standard reviews are not treated as less credible.

Each public card exposes course and study year only. Users may like approved reviews, save them, comment in a three-level thread, and report them. Review comments are text-only and require login; all are manually approved before public display.

### Community Q&A

Questions belong to an institution, not a single review. Logged-in users can ask and answer anonymously. Answer context is labelled as one of:

- `Approved reviewer` (system-assigned);
- `Current student` (self-declared);
- `Alumni` (self-declared);
- `Community member` (self-declared).

Answers support a single reversible upvote per account and default to **Most helpful**. Q&A supports a maximum of three reply levels and is text-only. Every question and answer requires manual approval.

### Community gallery

The gallery contains only photos from approved reviews. Institution profiles show a curated selection of the best photos for each category; users can open the complete gallery. Selection combines automatic quality/clarity signals, community engagement, and moderator curation.

### Compare universities

Logged-in users can compare up to three institutions, including institutions with fewer than five reviews. The comparison shows total and eight-dimension ratings, monthly living cost, review count, and strengths/weaknesses. Limited samples are always labelled.

### Account pages

The account menu provides:

- **Saved items:** tabs for institutions, reviews, and questions/answers;
- **Notifications:** replies, likes, review status, reward status, and reports;
- **My reviews:** drafts, submitted reviews, correction requests, published reviews, rejected reviews, edits, *Unspoken Truth* access, and reward status;
- **RM10 claim:** private eWallet claim and payment status;
- **Settings and privacy:** login method, immutable DOB display, support, and privacy requests.

In-app notifications cover all relevant interaction/status events. Email is for magic links, account/security events, important review/reward changes, and community replies; it is not a newsletter or marketing channel at launch.

## 5. Review submission

### Entry and drafts

Campaign traffic lands directly on the `Tulis review dan dapat RM10` experience. A user may begin without logging in. Their draft is stored locally; login is mandatory before submission. After login, the draft synchronises to the account and can be continued on another device. Drafts remain until the user deletes them.

The five-step review wizard is:

1. **Background:** institution, course, study year, and contributor context.
2. **Ratings:** eight 1–10 scores.
3. **Daily experience:** structured written answers.
4. **Photos and reward:** standard versus reward review, photo requirements, and reward eligibility.
5. **Review and submit:** anonymity, content/photo rights, terms, privacy, and age declarations.

Courses use a curated list when available, with a `My course is not listed` free-text fallback. Study year is a calendar year from 1990 through the current year.

### Rating model

Every submitted review—standard or reward—must score all eight dimensions from 1 to 10:

1. Facilities and equipment;
2. Teaching quality and lecturers;
3. Timetable and class experience;
4. Safety;
5. Cost and value for money;
6. Transport and location;
7. Campus life;
8. Career prospects.

The institution score is the arithmetic mean of these equally weighted ratings, displayed to one decimal place. Standard and reward reviews both contribute to the rating after approval.

### Standard review

A standard review requires institution, course, study year, all eight ratings, and at least one substantive written answer. It receives no RM10 by default. It can still be published, can count toward rating and strengths/weaknesses, and can later be expanded by editing.

### Reward review

A reward review must provide every structured experience answer and all photo evidence. Each mandatory narrative answer is at least 30 words, except structured entries such as the three food-place names. Required experience topics are:

- nearby transport;
- three affordable places to eat;
- timetable and learning/class sessions;
- daily travel to and from class;
- enjoyable nearby activities;
- advantages and disadvantages;
- living cost;
- safety;
- hostel curfew;
- job-entry prospects;
- part-time work opportunities;
- lecturers who are good;
- classes that are boring;
- places to spend time between classes.

Reward reviews also require a monthly living-cost amount from RM300 to RM10,000. The corresponding narrative response is required. The numeric cost is optional for a standard review.

### Photo evidence

Reward reviews require two to five photos in each category:

1. In or around classes;
2. Library or study spaces;
3. Affordable food;
4. Daily routes or transport;
5. Campus area;
6. Hostel or living area;
7. Between-class hangout areas;
8. Nearby activities or places of interest.

This means 16–40 photos per reward review. Photos accept JPEG, WebP, or PNG only, up to 5 MB each. Before retention, the system strips EXIF—including GPS, device, and timestamp metadata—and detects/redacts faces, number plates, documents, and other identifiers. The contributor must confirm the redacted output. The original file is then discarded; only the redacted version is retained.

Users must confirm that their text and photos are lawful, theirs to submit, free from sensitive information, and suitable for anonymous publication. Additional, explicit consent is required before approved review excerpts or photos are used outside INPOLOR in marketing.

### Submission, correction, and edit lifecycle

All content first passes automated screening for completeness, harmful/illegal content, sensitive data, low-quality answers, duplicate patterns, and image privacy. If a problem is found, the user is asked to repair the affected section; the content is not public.

Every review then waits for manual content approval. A moderator can publish, request correction, reject, edit *Unspoken Truth* classification, mark a reward issue, or save a private moderator draft. Rejected content retains an auditable decision trail; routine queue actions do not permanently delete it.

One account may have only one active review for an institution. An author may propose an edit, but it is moderated as a new version. The previously published version remains public until the revision is approved and replaces it.

## 6. RM10 reward campaign

The campaign is limited and truthful. Public copy states that eligibility depends on complete requirements, approval, and available campaign budget; INPOLOR may end or change the campaign at any time. The product visibly shows `Reward available`, `Reward nearly full`, or `Campaign ended`, and tells submitters that payment is not guaranteed until approval.

An individual can receive RM10 **only once for their lifetime on INPOLOR**, regardless of how many institutions, email accounts, or eWallet numbers they use. A single Touch ’n Go eWallet number may receive only one reward.

After an approved reward review, the private claim flow is:

1. Enter Touch ’n Go eWallet number;
2. Confirm ownership and one-claim rule;
3. Submit claim;
4. See `Waiting for payment`;
5. Payment moderator transfers RM10 manually;
6. User sees `Paid`, payment date, and transaction reference.

The claim screen includes a payment-problem form. eWallet and anti-fraud records are retained for 24 months after payment for duplicate-claim and dispute handling, then deleted or de-identified according to the privacy policy.

Fraud screening uses the verified account as its primary identity, with IP address, device/browser, timing, eWallet re-use, and duplicate-content signals as risk indicators—not as conclusive proof. Suspect users are asked to improve/complete their submission rather than automatically banned.

## 7. Unspoken Truths

*Unspoken Truths* remains a platform-wide locked layer. It is unlocked immediately, permanently, and across all INPOLOR content after a user submits a full review. Access is not revoked if that review is later rejected or left incomplete; it rewards the contribution effort, not publication.

Only excerpts from a review with total score **4.0/10 or lower** may be classified as *Unspoken Truths*. Automated classification identifies possible excerpts/topics; a moderator reviews and can correct every classification. Locked users see a blurred teaser and a CTA to submit a full review.

## 8. Moderation, reports, and official replies

### Content reports

Any logged-in user, including an approved university representative, can report public content. A single report immediately hides the item from public view and replaces it with **“Content is under review.”** The reporter sees only **“Report received.”**

Reports are audited. Repeated false reporting can remove report privileges or suspend an account. Content moderators make the final decision.

### Moderator queues

The admin workspace has separate queues for:

1. New reviews;
2. Corrections requested;
3. Community reports;
4. *Unspoken Truth* classification;
5. Official university replies;
6. RM10 claims;
7. Privacy/removal requests.

The dashboard tracks submissions by acquisition source, funnel conversion, queue age, published reviews per institution, reward budget, reports, and photo redaction/rejection counts.

### Official university responses

An institution may respond to a particular review, university Q&A, and its institution profile only after:

1. a representative completes the full INPELER institution profile, programmes, facilities, contacts, gallery/assets, and accuracy attestation; and
2. the primary admin manually approves the institution claim.

Official replies are labelled clearly, cannot change or remove community content, and always wait for content-moderator approval before publishing.

## 9. Aggregation and data confidence

| Public element | Rule |
| --- | --- |
| Published review feed | Available from one approved review. |
| Institution rating / eight dimensions | Available from one approved review, labelled `Limited data — based on X reviews` until five reviews. |
| Directory ranking | Institution needs at least five approved reviews. |
| Living-cost estimate | Available after at least five approved numeric cost answers. |
| Strengths/weaknesses | Available after at least five relevant approved reviews. |
| Comparison | Institutions with fewer than five reviews may be compared, with clear limited-data labels. |

Living cost is a community-derived monthly estimate, not an institution claim. It aggregates reported total monthly amounts only.

## 10. Privacy, content, and retention

- Reviewers are always anonymous publicly.
- Photos must not contain faces, licence plates, documents, private personal data, or unlawful/harmful material; detected identifiers are redacted before the user confirms.
- Text, photos, and derived moderation signals may be processed by an external AI provider for safety, moderation, and publication; this is disclosed in the privacy notice and submission flow.
- A user seeking ordinary review removal/edit must use the support channel and provide a reasonable explanation and written request. The platform may retain anonymised content while removing study-year context when appropriate.
- A separate privacy-request channel handles lawful access, correction, objection, and deletion obligations. The content-removal process cannot override those rights.
- Paid reward is not clawed back following an approved content-removal request; it is a marketing cost.
- Public support uses an in-app help form, with an email fallback for privacy matters.

Legal counsel in Malaysia must approve the final terms, privacy notice, campaign rules, anti-fraud practice, user-generated-content policy, and data-retention design before beta/public release.

## 11. Authentication, localisation, and accessibility

- Launch authentication methods: email magic link and Google only.
- The initial language follows the browser; a clear BM/English switcher is always available and the selection is stored.
- Reviews remain in the language written by their authors; system copy is translated.
- All public and authenticated flows must meet WCAG 2.2 AA, including keyboard/focus support, screen-reader labels, semantic forms, error messages, contrast, and responsive layout.

## 12. Closed beta and public-release gates

### Closed beta

- **Start:** approximately 9 November 2026.
- **Participants:** 30 current students/alumni, concentrated on the easiest campuses to reach.
- **Mode:** real authentication, real review submission, real moderation, real *Unspoken Truth* unlock, and real RM10 payment.

### Beta pass criteria

- At least 20 of 30 participants submit without assistance.
- Draft recovery survives authentication redirect.
- No public identity leakage occurs.
- Photo redaction and metadata removal work correctly.
- At least one complete reward claim is paid and has a correct user-visible transaction record.

### Public release gate — 30 November 2026

Release requires beta pass criteria, all critical paths tested on mobile, legal sign-off, secure role access, working moderation queues, a verified payment workflow, and 20 seed institutions ready for the directory. The first public 30-day measurement period then begins.

## 13. Current implementation delta

The current `apps/portal-parent` prototype is intentionally much narrower: local-first review data, a three-step wizard, a lightweight quick-review gate, and routes limited to `/`, `/submit-review`, and `/quick-review`. This specification requires a server-authoritative public product with new account, directory, institution, comparison, moderation, reward, privacy, notification, and controlled-INPELER capabilities.

Implementation must preserve the monorepo rule that only `@repo/database` owns the Supabase client and data contracts. Sensitive records (identity, DOB, eWallet, fraud signals, moderator actions, and claim records) must never be exposed in public projections or to university representatives.

## 14. Deliberately deferred technical choices

The following require an implementation decision, but do not alter the approved product behaviour:

- AI/provider selection for text moderation, image detection, and redaction;
- exact database schema, private tables, server functions, RLS policies, and storage buckets;
- campaign URL/UTM attribution format;
- exact visual design system and final public copy;
- list of the first 20 qualifying private institutions;
- operational staffing timing and moderator tooling details beyond the approved role boundaries.

These choices must be made source-faithfully during implementation and validated against Malaysian legal advice before public release.
