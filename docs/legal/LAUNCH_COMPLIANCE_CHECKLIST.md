# Malaysian Privacy and Advertising Launch Checklist

**Prepared:** 17 July 2026

This checklist turns the Terms and Privacy Policy into operational controls. Publishing legal text without implementing these controls would create a mismatch between the notice and the product.

## Must complete before launch

### 1. Fill in and approve the legal identity

- Replace every bracketed field in both documents.
- Identify the actual Malaysian data controller, company number, registered address, support contact, security contact and privacy/DPO contact.
- Decide the product-wide name and the legal relationship between INPEL, INPELER and INPOLOR.
- Obtain final review by Malaysian counsel using the production business model, university contracts and vendor list.

### 2. Publish in Bahasa Malaysia and English

Section 7(3) of the PDPA requires the notice and choice mechanism in the national and English languages. Commission a legally faithful Bahasa Malaysia version and keep both versions equally accessible at every collection point.

### 3. Add layered, recorded consent at the forms

Use separate, unticked controls. Do not bundle optional marketing or advertising into acceptance of the Terms.

Recommended records:

1. **Terms and Privacy acknowledgement** — required to create an account or submit.
2. **Assessment and profiling consent** — explicit consent for SPM, household income, personality, psychometric, Vibe Check, matching and reports.
3. **Under-18 parent/guardian consent** — required if the student is under 18; record guardian identity, relationship, time, notice version and verification method.
4. **University sharing consent** — show the selected universities, fields and purposes before disclosure.
5. **Partner-university marketing consent** — optional and separate from matching/enrolment sharing.
6. **Advertising tracking consent** — optional, controlled by the cookie banner.

Store the notice version, consent text, user/session ID, timestamp, selected purpose, selected recipients, withdrawal and evidence of guardian verification.

### 4. Implement verifiable parental consent

The current parent-led invitation is a strong starting point, but an invitation may be forwarded. Before accepting an under-18 assessment or sharing it:

- verify control of the parent's email through a magic link or one-time code;
- ask the adult to confirm parental or guardian authority and the student's age band;
- provide the adult with the full assessment, profiling and university-sharing notice;
- record approval before the student's final submission; and
- provide an easy guardian withdrawal and deletion route.

Do not collect an identity-card copy by default. Use a lower-data verification method unless stronger evidence is genuinely needed.

### 5. Implement a real cookie consent banner

**Yes—a cookie consent banner is needed before Meta Pixel, TikTok Pixel or optional analytics are enabled.** Although Malaysia does not mirror every feature of the EU ePrivacy cookie regime, these tools process personal data for behavioural advertising and direct marketing. Prior, recorded opt-in is the safest way to meet the PDPA's consent, notice, disclosure and choice requirements.

The banner should:

- block all non-essential tags before consent;
- present **Accept all**, **Reject all** and **Customise** with equal ease and prominence;
- separate strictly necessary, preferences, analytics and advertising;
- identify Meta/Facebook and TikTok and link their privacy information;
- explain targeted advertising, audience building, conversion measurement and retargeting;
- save the consent version, categories and time;
- expose a persistent **Cookie Settings** link on every page;
- make withdrawal as easy as acceptance;
- re-request consent after a material vendor or purpose change and periodically under the adopted policy; and
- synchronise withdrawal across tag manager, client scripts and any server-side conversion APIs.

Do not load an advertising SDK, pixel, iframe, tag-manager rule or server-side event before advertising consent. Browser opt-out alone is not a substitute for blocking the initial load.

### 6. Minimise advertising events

Create an approved event dictionary. Permitted examples may include generic `PageView`, `RegistrationComplete`, `AssessmentComplete`, `UniversityEnquiry` and `ReportPurchase` events with random event IDs.

Prohibit event names, URLs, parameters, custom audiences or advanced matching fields that reveal:

- SPM subject or grade;
- household income band;
- personality answer or psychometric score;
- mental-health or support preference;
- university match reason or report content;
- review text; or
- a minor's assessment status tied to an email or telephone number.

Disable automatic advanced matching unless separately assessed and consented. Test network requests in a clean browser before release.

### 7. Appoint and register a DPO if the threshold applies

The Commissioner's current FAQ says a controller or processor must appoint a DPO where processing involves more than 20,000 data subjects, sensitive data including financial information for more than 10,000 data subjects, **or regular and systematic monitoring such as online user-behaviour tracking**. Meta/TikTok behavioural tracking is likely to engage the third criterion. Obtain advice and, if applicable, appoint the DPO and notify the Commissioner within the required period before running the tracking programme.

### 8. Complete a DPIA and profiling review

Document a Data Protection Impact Assessment covering minors, academic records, household income, psychometric profiling, recommendation logic, university lead sharing, public reviews, browser storage and advertising.

For matching:

- document input fields, weights, rules, training or reference data and outputs;
- test for inaccurate or discriminatory outcomes;
- show users the main factors behind a match;
- offer correction, recalculation and reasonable human review;
- prohibit universities from treating a Platform score as an admission decision; and
- keep assessment data out of unrelated advertising models.

### 9. Contract with universities and vendors

Partner-university agreements should define:

- whether each party is an independent controller or processor;
- exact lead fields and approved purposes;
- prohibition on onward sale and unrelated use;
- separate marketing consent and suppression handling;
- security, retention, correction and deletion duties;
- minor data safeguards;
- breach notification to the Platform without delay;
- outcome reporting and analytics rules; and
- audit, suspension and termination rights.

Put appropriate data-processing and cross-border terms in place with Supabase, hosting, authentication, email, support, analytics, advertising and payment vendors.

### 10. Build data-subject request tools

Provide a visible privacy request page or form for access, correction, withdrawal, direct-marketing objection, portability and deletion. Create a verified workflow that searches:

- Supabase Auth and profiles;
- family sessions and assessments;
- recommendations and payments;
- reviews, comments and likes;
- institutional contact data;
- browser-linked server records;
- support and consent records; and
- partner universities that received the data.

Keep a minimal suppression record after a marketing opt-out. Do not represent deletion as complete until backups, processors and notified recipients are handled under the retention procedure.

### 11. Enforce retention in code

The policy proposes concrete periods, but several browser records currently persist until manually cleared. Add:

- created and expiry timestamps to every local record;
- automatic purge on application start and logout;
- a **Delete saved data on this device** control;
- server jobs for incomplete sessions, inactive accounts and expired marketing data;
- deletion or de-identification of linked recommendations; and
- documented backup expiry.

Confirm the seven-year financial and compliance periods with the accountant and Malaysian counsel before locking the production schedule.

### 12. Prepare breach response

Maintain an incident register, escalation contacts, affected-data assessment and notification templates. Current Commissioner guidance requires qualifying notification to the Commissioner as soon as practicable and generally within 72 hours of the breach, with affected individuals notified without unnecessary delay and generally within seven days after the initial Commissioner notification.

Require processors and universities to notify the Platform early enough for those deadlines. Test the process at least annually.

### 13. Check data-controller registration

Determine whether the operator falls within one of the 13 registrable classes under the applicable Data Controller registration orders—for example because of its education-sector status or another regulated business activity. Register and display the certificate if required. This question depends on the operator's licences and corporate activities, which are not present in the codebase.

## Recommended placement in the frontend

- Link the Terms, Privacy Policy and Cookie Settings in every portal footer.
- Place short just-in-time notices beside household income, SPM, psychometric and review fields.
- Add a consent checkpoint before the student assessment begins and another before university sharing.
- Show named recipients and exact fields in the university-sharing confirmation.
- Keep marketing consent off by default and separate from the **Submit assessment** or **Request information** button.
- Add an age/guardian gate before the first student field.
- Add **Why this match?**, **Correct my data** and **Request human review** actions on results.
- Add **Delete account/data** and **Download my data** in account settings.
- Warn users not to place identifiable third-party or confidential information in reviews.

## Official Malaysian sources used

- [Personal Data Protection Act 2010 (Act 709)](https://www.pdp.gov.my/ppdpv1/wp-content/uploads/2024/07/UNDANG-UNDANG-MALAYSIA_AKTA_PERLINDUNGAN_DATA_PERIBADI_2010_709_MALAY_AND-ENG_V2022.pdf)
- [Personal Data Protection (Amendment) Act 2024 (Act A1727)](https://www.pdp.gov.my/ppdpv1/wp-content/uploads/2024/11/Act-A1727.pdf)
- [2024 amendment commencement Gazette](https://www.pdp.gov.my/ppdpv1/wp-content/uploads/2024/12/PENETAPAN-TARIKH-PERMULAAN-KUAT-KUASA.pdf)
- [Guidance on preparing a Personal Data Protection Notice](https://www.pdp.gov.my/ppdpv1/en/akta/guidance-on-the-preparation-of-personal-data-protection-notices/)
- [Personal Data Protection Standard 2015](https://www.pdp.gov.my/ppdpv1/en/personal-data-protection-standard-2015/)
- [Data Protection Officer FAQ](https://www.pdp.gov.my/ppdpv1/en/faq-on-the-appointment-of-data-protection-officer-dpo/)
- [Cross-Border Transfer Guideline](https://www.pdp.gov.my/ppdpv1/en/akta/personal-data-protection-guidelines-on-cross-border-transfer-of-personal-data-cbpdt/)
- [Data Breach Notification Guideline](https://www.pdp.gov.my/ppdpv1/en/akta/personal-data-protection-guidelines-on-data-breach-notification-dbn/)
- [Automated Decision-Making and Profiling Guideline](https://www.pdp.gov.my/ppdpv1/en/akta/automated-decision-making-and-profiling-guideline-admp/)
- [Data Protection by Design Guideline](https://www.pdp.gov.my/ppdpv1/en/akta/data-protection-by-design-guideline-dpbd/)

## Legal review note

These documents are a detailed drafting and implementation package, not a substitute for advice on the operator's final corporate structure, licences, university contracts, payment model, hosting regions and advertising configuration. A Malaysian advocate and solicitor should approve the completed, bilingual production version before public launch.
