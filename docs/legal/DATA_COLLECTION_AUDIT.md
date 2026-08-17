# Code-Based Personal Data Inventory

**Audit date:** 16 August 2026  
**Scope:** `apps/portal-universiti`, `apps/portal-student`, `apps/portal-parent`, `packages/database` and the Supabase schema

## 1. Portal naming map

The folder names do not describe the live user roles accurately. Legal and consent copy should use the product purpose, not the directory name.

| Code folder | Product and actual users | Main processing |
| --- | --- | --- |
| `apps/portal-universiti` | INPEL parent and student matching portal | Family profile, student academic and psychometric assessment, recommendations, account authentication and report tier |
| `apps/portal-student` | INPELER institutional portal | University representative authentication and publication of university, course, fee, facility and contact information |
| `apps/portal-parent` | INPOLOR student review portal | Reviews, ratings, tags, comments, likes, anonymous choice and magic-link email authentication |

## 2. Exact form and generated-data inventory

### INPEL parent data

- Parent email.
- Preferred study location: Malaysian state or federal territory, or open to anywhere.
- Monthly household income band: below RM3,000 through RM20,000 and above.
- Campus type preference.
- Main concern: academic quality, safety, mental-health support or industry network.
- Desired outcome: employment, network, leadership or international pathway.
- Parent's assessment of the student's independence and support needs.
- Family session ID, created time, lifecycle status and notification time.
- Parent or guardian consent choice, consent timestamp and the linked family-session/account identifier where available. This is an audit record, not proof of guardian identity or authority.

### INPEL student data

- Student email and Supabase user ID when authenticated.
- Password submitted to authentication but deliberately excluded from browser persistence.
- Authentication provider: password, Google or Facebook, plus authentication time.
- Sixteen five-point personality answers.
- Five 0–100 self-ratings: analytical, creative, social, practical and enterprising.
- Up to 20 SPM subject and grade pairs.
- Six Vibe Check choices: social setting, campus setting, team style, schedule style, learning style and local/global future.
- Calculated career suggestions and strength profile.
- Assessment progress, draft, submitted time and completion status.
- Recommendation match score, ROI and career data.
- Report tier and pending/success/failed one-time payment state. Intended launch report prices are RM18, RM28 and RM48 in Malaysian Ringgit; no recurring subscription is intended.
- Checkout currently asks for billing country but does not persist or transmit it in the audited code.

### INPELER university representative and publication data

- Representative email, password authentication, user ID and role (`university_rep` or `admin`).
- Institution name, city/state, address, website, public contact email and telephone.
- Logo URL, gallery image URL and image category.
- Tuition fees, living costs and acceptance rate.
- Facility flags: 24-hour library, laboratories, accommodation, sports, career centre and counselling.
- Course name, MQA code, total tuition, duration, study mode, overview and entry requirements.
- Accuracy attestation, publication result and timestamps.

### INPOLOR reviewer data

- Magic-link email and authenticated user ID, where signed in.
- Date of birth, server-side age-check result, age declaration and declaration timestamp; INPOLOR is restricted to users aged 18 or older.
- Course or major and year of study.
- Rating, green flags, red flags, candid review text and up to five vibe tags.
- Anonymous or identified publication choice.
- Author label, time, likes and comments.
- Quick-review course, year and rating without identity details.
- Anonymous database payloads explicitly remove user ID and email, although technical logs may still exist at infrastructure level.

### Technical and browser data

- `localStorage` family sessions and student drafts under session-specific keys.
- A versioned assessment authentication draft with a 24-hour expiry; passwords and OAuth tokens are excluded.
- A versioned institutional draft.
- Versioned locally stored review content.
- Supabase authentication and database requests.
- Private invitation URLs and parent handoff URLs.
- Standard hosting, authentication and database logs are not defined in the frontend types but should be included in the production privacy inventory.

## 3. Third parties visible in code and approved for launch planning

- Supabase for authentication and database services.
- Google OAuth, if configured.
- Facebook OAuth, if configured.
- The user's email client through a `mailto:` parent notification link.
- External university image and website URLs submitted by university representatives.
- Planned Cloudflare domain/DNS/CDN or security services, limited to the services actually enabled.
- Planned Exabytes SMTP email delivery for transactional email.
- Planned official Meta WhatsApp Business Platform communications.
- Planned Stripe payment processing, once live payments are enabled.
- Planned Google Analytics, Meta Pixel and TikTok Pixel, only after opt-in consent controls and vendor configuration are live.
- Planned DeepSeek AI safety and image redaction for INPOLOR images and content; the internal INPEL moderation team makes final moderation, takedown and review-dispute decisions.

No Meta Pixel, TikTok Pixel, analytics tag manager or live card processor was found in the audited frontend code. The policies describe those services as planned and consent-gated. Before activation, name the vendor, verify the data fields and transfer location, confirm the consent mechanism, and change the public notice from planned to active wording.

## 4. High-risk processing

- Users are likely to include minors.
- SPM results, household income and detailed preference profiles can materially affect educational opportunities.
- The Platform performs automated profiling and ranking.
- The parent and student contribute information about each other.
- When a parent or student actively makes the separate university-sharing choice, the full INPEL profile is designed to be shared with the selected or matched university: contact details, SPM results, raw and derived assessment information, household income range, preferences, recommendations, report outputs and enquiry history.
- Reviews can create defamation, privacy and identification risks.
- Advertising pixels can create regular and systematic behavioural monitoring and cross-border transfers.
- Sensitive assessment drafts are stored in the browser and some current records have no automatic expiry.

## 5. Policy-to-code truth checks

- Do not state that passwords are stored by the Platform; the audited design excludes them from browser storage.
- Do not state that payment cards are collected; the checkout is currently a no-card demo.
- Do not call INPELER's contact and programme information confidential; it is intended to be public.
- Do not promise that an anonymous review is impossible to identify. Public identity is removed, but infrastructure logs or the text itself may identify someone.
- Do not fire or claim active Meta/TikTok pixels before a consent platform and vendor configuration exist.
- Do not send raw assessment answers, grades, income or review text in advertising events.
- Do not rely only on a student's checkbox for under-18 consent; verify the parent's role through the existing parent-led session and email flow.
- The intended retention choice for active accounts and completed assessments is until a user requests deletion, subject to deletion or de-identification once a record is no longer necessary and to lawful payment, security, dispute or compliance retention.
