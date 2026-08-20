# REL-007 Supersession of PR #3

PR #3 is not merged wholesale. REL-007 ports only verified fixes onto a fresh branch based on the current audited `main`.

## Ported and retained

- canonical product `university_id` for INPOLOR routes, saves, summaries, and review submissions;
- reference institution ID retained only as provenance;
- structured `mainExperience` projection with legacy fallback;
- durable, expiring cross-tab DOB onboarding draft;
- visible authentication/onboarding errors;
- missing-institution validation fix;
- honest empty, cost, and ranking states;
- standard review unlock only after moderator publication;
- reports enter moderation without immediate auto-hide;
- strict parent preference validation using the values actually sent by the portal;
- INPELER pending-facility readiness fix;
- current-schema pgTAP expectations and focused regression coverage.

## Rejected from PR #3

- broad catalogue policies using `USING (true)`;
- the obsolete `inpolor-review-v1` declaration contract;
- direct use of reference catalogue IDs as review foreign keys;
- local or demo fallbacks that can be mistaken for successful production writes;
- any wholesale migration push that ignores remote migration history;
- synthetic institutions, reviews, links, moderator accounts, or publication rows.

## Closure condition for PR #3

Close PR #3 as superseded only after:

1. REL-007 application and database checks pass;
2. migration history has a clean dry run;
3. the staging convergence migration is verified;
4. the replacement PR links this document and lists every intentionally unported file.
