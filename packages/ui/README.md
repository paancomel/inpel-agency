# `@repo/ui`

Shared React UI for the INPEL portals.

## Cookie consent

Render `CookieConsent` once inside a React Router provider. The three portal
applications mount it at their application roots.

The component records one of two values under `inpel_cookie_consent`:

- `all`: essential storage and advertising/analytics tracking are permitted.
- `essential`: only essential storage is permitted.

Choosing `all` also dispatches the `consentGranted` window event. Meta Pixel,
TikTok Pixel, and other non-essential trackers must not be initialized until
either the stored value is already `all` on application startup or this event
is received. Choosing `essential`, an invalid stored value, or unavailable
browser storage must never initialize those trackers.

The component must remain inside the router because its privacy-policy link is
a React Router link to `/legal`.
