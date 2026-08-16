# INPOLOR Institution Seed and Import Checklist

Purpose: create the initial 20-institution Kuala Lumpur and Selangor catalog without mixing verified institution facts with community content.

## 1. Source dataset contract

Prepare one reviewed row per institution with:

- stable internal slug/import key;
- official institution name;
- institution type;
- state (`Kuala Lumpur` or `Selangor`) and short public location/address;
- official website URL;
- map URL;
- evidence that the campus is in the launch geography;
- evidence that active student population is greater than 100;
- private source URLs, capture date, verifier, and notes for moderator provenance;
- catalog status (`draft`, `verified`, `published`);
- curated course/program names and search aliases when available.

Public rows expose only the approved institution facts. Source URLs, student-count evidence, verifier identity, and import notes remain moderator-only.

## 2. Source rules

- [ ] Prefer official institution sites, MQA/MOHE records, official maps/listings, and official social accounts for corroboration.
- [ ] Use social media only for verifiable basic facts; do not copy posts, photos, captions, reviews, or user comments.
- [ ] Record at least one authoritative source and one corroborating source for location and operating status where practical.
- [ ] Reject unverifiable, stale, conflicting, or campus-ambiguous rows until manually resolved.
- [ ] Obtain legal review if automated scraping is used; respect platform terms, access controls, and applicable law.
- [ ] Do not infer active student count from follower count, likes, reviews, or venue traffic.

## 3. Data quality rules

- [ ] Exactly 20 approved, active institutions at launch.
- [ ] Every institution has a unique normalized name, slug/import key, official URL, and location.
- [ ] URLs use HTTPS where supported and resolve without unexpected redirects.
- [ ] Map links point to the correct campus, not a similarly named institution or headquarters outside the launch geography.
- [ ] Course aliases are normalized for search but preserve the official display name.
- [ ] No personal contact details, scraped photos, copyrighted descriptions, community ratings, or inferred costs are imported.
- [ ] No production aggregate is precomputed from zero reviews.
- [ ] Institutions remain searchable with fewer than five approved reviews but are excluded from rating ranking until the threshold is met.

## 4. Import implementation rules

The repository currently configures `supabase/seed.sql`, but the file was absent at the 16 August 2026 audit. Create a reviewed seed/import artifact only when the final schema is stable.

- [ ] Make the importer idempotent using stable keys and conflict handling that cannot create duplicates.
- [ ] Separate institution facts, course aliases, and moderator-only provenance into the appropriate protected tables.
- [ ] Use a transaction and fail the entire import on a validation/count mismatch.
- [ ] Never use a service-role/secret key in a browser script.
- [ ] Never run `supabase db reset` against production.
- [ ] Prefer migration-safe catalog upserts or a reviewed server-side import job with a dry-run mode.
- [ ] Produce a dry-run report of creates, updates, unchanged rows, rejected rows, and conflicts.
- [ ] Require human approval of the dry-run before the production write.
- [ ] Record import version, source dataset checksum, operator, UTC time, production project ref, and result.

## 5. Production verification queries/checks

After import, prove without exposing moderator provenance:

- [ ] published institution count is exactly 20;
- [ ] every row is in Kuala Lumpur or Selangor and has approved required fields;
- [ ] no duplicate slug, normalized name, official URL, or campus mapping exists;
- [ ] anonymous users can read only approved public institution/course fields;
- [ ] anonymous/authenticated users cannot read private provenance or draft rows;
- [ ] search finds institutions by official name, common alias, course display name, and approved course alias;
- [ ] default ranking excludes institutions with fewer than five approved reviews;
- [ ] rating/cost/strength/weakness aggregates show a data-limited or unavailable state until their sample thresholds are met;
- [ ] public pages contain no sample/fabricated reviews from `apps/portal-parent/src/lib/seed-data.ts` when the production database is empty or unavailable.

## 6. Prohibited production seed content

Do not seed any of the following as if contributed by real users:

- reviews, eight-category ratings, strengths/weaknesses, or Unspoken Truths;
- monthly living-cost submissions or aggregate costs;
- likes, upvotes, saves, comments, Q&A, reports, or notifications;
- review photos or community gallery selections;
- reward eligibility, eWallet numbers, claims, payments, or transaction references;
- user profiles, dates of birth, device/IP/fraud signals, moderator decisions, or institution responses.

Designated test fixtures may exist only in non-production or during an approved production smoke test with clear test identifiers and guaranteed cleanup.

## 7. Sign-off

| Check | Owner | Evidence | Status |
| --- | --- | --- | --- |
| Exact 20 institutions approved |  |  | Pending |
| Geography and >100 active students evidenced |  |  | Pending |
| Course aliases reviewed |  |  | Pending |
| Provenance private and public projection verified |  |  | Pending |
| Dry run approved |  |  | Pending |
| Production import count/integrity verified |  |  | Pending |
| Search and threshold behavior verified |  |  | Pending |
| No fabricated community content exposed |  |  | Pending |
