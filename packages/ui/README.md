# `@repo/ui`

Shared React UI for the INPEL portals.

## Cookie consent

Render `CookieConsent` once inside a React Router provider. The three portal
applications mount it at their application roots.

The component records one of two values under `inpel_cookie_consent`:

- `all`: essential storage and advertising/analytics tracking are permitted.
- `essential`: only essential storage is permitted.

Wrap every optional vendor loader in `OptionalTrackingGate`. The gate fails
closed, reads an existing choice on startup, reacts to choices made in the
current tab, and reacts to cross-tab storage changes:

```tsx
<OptionalTrackingGate>
  <ConfiguredAnalyticsAndAdvertisingLoaders />
</OptionalTrackingGate>
```

Do not render Google Analytics, Meta Pixel, TikTok Pixel, or any other
non-essential script outside this gate. Vendor IDs and loaders belong in the
applications' environment-specific configuration; this package deliberately
does not provide keys or inject third-party scripts.

The persistent `Cookie settings` control lets a user reopen the banner.
Choosing `Essential Only` after `Accept All` immediately closes the gate and
unmounts its children. Each vendor loader must therefore return an effect
cleanup that disables the vendor and removes any script element it created.

For non-React integrations, use `hasOptionalTrackingConsent()` for the initial
check and listen for `inpel:cookie-consent-changed`. Its `CustomEvent.detail`
contains `{ choice, optionalTrackingAllowed }`. Compatibility events
`consentGranted` and `consentRevoked` are also emitted. The exported
`withdrawOptionalTrackingConsent()` API records `essential` and emits the same
withdrawal notifications.

Choosing `essential`, an invalid stored value, server-side rendering, or
unavailable browser storage must never initialize optional trackers.

The component must remain inside the router because its privacy-policy link is
a React Router link to `/legal`.
