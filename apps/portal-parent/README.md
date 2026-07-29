# INPOLOR Portal

The `@repo/portal-parent` workspace app implements the student-review experience in `_blueprints/4-blueprint-inpolor.md` using React, Vite, Tailwind CSS, React Router v6, and Lucide icons.

## Routes

- `/` — university header, topic tabs, filters, review feed, comments, and insight sidebar.
- `/submit-review` — the three-step review wizard and success state over the home feed.
- `/quick-review` — the lightweight, gamified flow that unlocks Unspoken Truths.
- Any unknown route redirects safely to `/`.

## Data and security model

- The app imports the shared Supabase client and database types only from `@repo/database`; it never creates a client locally.
- Reviews save to versioned `localStorage` first so the prototype remains usable without cloud configuration. Quota and malformed-data failures are handled without crashing.
- Cloud review sync and magic-link authentication use the shared client when public Supabase configuration is available. The header explicitly shows `Device preview` until a review is successfully synced.
- Anonymous submissions remove the user ID and email before either local persistence or database payload creation. Authentication emails are never persisted in browser storage.
- Client validation improves UX but does not replace Supabase RLS or server-side validation in production.

## Development

```powershell
pnpm --filter @repo/portal-parent dev
pnpm --filter @repo/portal-parent test
pnpm --filter @repo/portal-parent typecheck
pnpm --filter @repo/portal-parent lint
pnpm --filter @repo/portal-parent build
```

Copy `.env.example` to `.env.local` inside this app only when live Supabase behavior is needed. Use a browser-safe anonymous or publishable key—never a service-role or secret key.

## Test coverage

The suite covers blueprint validation messages, anonymous identity scrubbing, corrupted and quota-full storage, responsive route rendering, empty filters, the gated quick-review flow, the full review wizard submission, and authentication prompts.
