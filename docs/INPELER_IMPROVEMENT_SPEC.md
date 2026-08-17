# INPELER Improvement — Version 1 Product Specification

**Status:** Approved direction from founder deep-interview  
**Date:** 15 August 2026  
**Target:** Minimum 30 private higher-education institutions complete and verified by 15 November 2026  
**Owner/operator:** Founder (solo, >20 hours/week)  
**Related product:** INPOLOR Public Launch Product Specification

---

## 1. Outcome

INPELER Version 1 must make it fast and credible for private institutions to publish a complete public profile, while giving INPOLOR a clear source of official institutional information.

An institution is **verified** when at least one representative proves control of an approved institutional email domain. An institution is **complete** only when every required profile component has been supplied and published.

Once both conditions are met, the institution immediately receives official-response rights in INPOLOR.

## 2. Product decisions and boundaries

- Verification is based on institutional-domain email. MQA is a reference for accuracy, not a gate to verification.
- Public email providers (for example Gmail and Yahoo) are rejected automatically.
- Approved domain exceptions can be managed manually for shared or group-education domains.
- Several representatives may manage one institution when they use an approved domain.
- A transferable institution-admin role controls sensitive actions and may be handed to another representative.
- Published changes are public immediately.
- Every change must still create an immutable internal audit/version record.
- The first release includes analytics, data import, mobile-ready experience, and MQA reference integration; these are not deferred from Version 1.
- Manual operations are acceptable for the first 30 institutions.

## 3. Users and roles

| Role | Required capability |
| --- | --- |
| Institution representative | Verify institutional email, complete wizard, edit profile, upload assets, publish, view history |
| Institution admin | All representative actions plus invite/remove representatives, transfer admin, change identity data, suspend verification |
| INPEL founder/admin | Manage institutions, approved-domain exceptions, escalations, audit history, support status, and MQA references |
| Public visitor | Read the current published institution profile |
| INPOLOR system | Consume the current verified institution profile and official-response entitlement |

## 4. Required institution profile

The completion gate requires all components below:

1. Institution identity and official name
2. Program/course catalogue
3. Fees and relevant cost information
4. Facilities and amenities
5. Location and official contact details
6. Gallery and institution assets
7. Accuracy attestation

The wizard must show completion state per component, validate required fields, preserve drafts, and prevent a false “complete” state when any component is missing.

## 5. Verification and access workflow

### 5.1 Self-registration

1. Representative enters an email address.
2. The system rejects public providers and checks the domain against the approved-domain list or the institution-domain mapping.
3. The system sends a verification link/code to the institutional email.
4. Successful verification grants the representative verified status and associates the domain with the institution.
5. If the institution does not exist, the representative may create a pending institution record for completion.

### 5.2 Team invitation

An INPEL admin may invite a representative. The invitee must still complete institutional-email verification before receiving access. A verified domain may have multiple representatives.

### 5.3 Admin transfer

The current institution admin can transfer the admin role to another verified representative. The transfer must be confirmed, logged, and leave at least one active admin unless the founder/admin intervenes.

### 5.4 Domain invalidation

Founder/admin can suspend a domain or institution verification. Suspension blocks new publishing and official INPOLOR rights while preserving all profile versions, representatives, and audit records.

## 6. Guided wizard and languages

- The wizard is available in Bahasa Melayu and English from the first release.
- Users can switch language without losing draft data.
- Each step has plain-language guidance, required-field validation, save-and-resume, and a visible completion indicator.
- The wizard supports manual entry and Version 1 data import from a documented file/template format.
- The interface must be usable on mobile screens even though the primary editor is a web portal.

## 7. Publishing and version history

- A complete profile can be published by an authorised representative/admin.
- Published changes appear publicly immediately after a successful save.
- Each publish creates a version with author, timestamp, changed fields, and source (manual/import/system).
- Previous versions are retained for audit and recovery; they are not publicly exposed by default.
- Founder/admin can restore a previous version and the restoration itself creates a new version event.

## 8. INPOLOR integration

When `verified = true` and `profile_complete = true`:

- the institution receives official-response rights immediately;
- official responses are published without pre-moderation;
- every institution-authored comment or information item receives a blue badge with an appropriate icon;
- the badge must be visually distinct and accessible, but does not require a bilingual label or tooltip;
- INPOLOR must show the current published institution identity and avoid granting rights to suspended institutions.

The integration must be server-authoritative. Client-only flags are not sufficient for entitlement or badge rendering.

## 9. Notifications and support operations

For an institution with an incomplete profile, send both email and dashboard notifications:

| Timing | Purpose |
| --- | --- |
| Day 3 | Helpful completion reminder |
| Day 7 | Reminder with a soft warning that students may be entering sensitive or inaccurate information about the institution and that official information should be supplied first |
| Day 14 | Same soft warning, with a clear completion call to action |

After Day 14 without meaningful progress:

- mark the institution `needs_help`;
- create a founder/admin follow-up item;
- target human contact within 3 working days;
- record contact status and next action in the audit/support log.

Notifications must be idempotent, respect opt-out/legal requirements where applicable, and never reveal private reviewer identity or data.

### Approved soft-warning copy

Use this copy for the Day 7 and Day 14 messages (with normal product proofreading/localisation before release):

> Ada pelajar yang sedang masukkan maklumat sensitif tentang universiti/kolej awak. Berikan maklumat lengkap sebelum mereka memasukkan maklumat tidak tepat.

## 10. Admin dashboard

The dashboard must show at minimum:

- invitations sent;
- institutional emails verified;
- institutions currently completing;
- profiles complete;
- profiles published;
- institutions needing help;
- time from invitation to verification and completion;
- domain exceptions and suspended domains;
- pending support follow-ups.

Filters must include status, institution, domain, date, and assigned follow-up state. Export is required for the founder's operating workflow.

## 11. Analytics, import, and MQA reference

Version 1 includes:

- funnel analytics from invitation → email verification → wizard progress → completion → publication;
- import from the agreed institution/profile template with validation and an error report;
- MQA reference fields or links attached to the institution record for accuracy review, without making MQA a verification gate.

Analytics must not expose sensitive student or reviewer data to institution representatives.

## 12. Security and data requirements

- All verification, entitlement, publication, and suspension decisions are server-authoritative.
- Institution representatives can access only institutions associated with their verified domain and role.
- Audit/version history is append-only to representatives.
- Removing a representative immediately revokes their access while preserving their historical authorship.
- Domain suspension removes INPOLOR official rights until reinstated.
- Uploads must enforce institution ownership and permitted file types/size limits.
- Personal data, support notes, and internal audit data must not be exposed in public profiles.

## 13. Success metrics

The launch target is at least 30 private institutions with:

- verified institutional email;
- every required profile component complete;
- a current published profile;
- an active admin and at least one reachable representative.

Operational health is measured through funnel conversion, reminder response, support resolution within 3 working days, publication failures, suspended domains, and audit completeness.

## 14. Acceptance criteria

Version 1 is ready when all of the following can be demonstrated in staging:

1. A Gmail/Yahoo address cannot register as an institution representative.
2. A valid institutional email can verify and receive representative access.
3. A shared approved domain can support multiple representatives.
4. Admin transfer, representative removal, and domain suspension work and are logged.
5. The wizard works in BM and English, preserves drafts, validates all seven required components, and supports the agreed import template.
6. An incomplete profile cannot become complete or receive official INPOLOR rights.
7. A complete verified profile publishes immediately and creates a version/audit record.
8. INPOLOR grants official rights immediately, renders the blue institutional badge, and removes rights when the institution is suspended.
9. Day 3/7/14 notifications are sent once through email and dashboard; Day 14 creates `needs_help` and a 3-working-day follow-up task.
10. Dashboard metrics reconcile with the underlying institution and audit records.
11. Analytics, import, MQA reference, responsive editor behavior, and the core security/RLS checks pass.

## 15. Delivery note

This is a Version 1 product specification, not a promise that every capability already exists in the repository. Implementation should preserve existing INPEL/INPOLOR security boundaries and update the current PRD, release runbook, database contracts, UI tests, and browser verification evidence as each requirement is delivered.
