# Agency Web monorepo

University portal workspace with a production-ready INPEL parent/student matching SPA and centralized Supabase access in `packages/database`.

## Workspace layout

```text
apps/
  portal-universiti/   # React/Vite INPEL matching portal
  portal-student/
  portal-parent/
packages/
  database/
```

## Requirements

- Node.js 20 or newer
- pnpm 10 or newer (the lockfile was generated with pnpm 11.7.0)

Install dependencies and run the quality gates from the repository root:

```sh
pnpm install
pnpm typecheck
pnpm test
pnpm build
```

Run the INPEL portal locally:

```sh
pnpm --filter @repo/portal-universiti dev
```

See `apps/portal-universiti/README.md` for its route map, offline behavior, privacy constraints, and app-specific quality gates.

## Supabase configuration

This repository has one and only one Supabase environment: disposable staging
project `xrmrhjgkttxzvwdsjazs` (`inpel-agency`, `ap-southeast-1`). It is the
canonical schema and migration-history source. **Do not use Docker Desktop, a
local Supabase stack, `supabase start`, `supabase db reset`, `migration repair`,
or another project ref.**

Read [the canonical-environment policy](docs/SUPABASE_CANONICAL_ENVIRONMENT.md)
and [the current project state](docs/CURRENT_PROJECT_STATE.md) before any
Supabase operation. The migration history is reconciled: local and staging
each have the same 35 migration IDs in the same order. Use the project-scoped
Supabase MCP connection for inspection; treat every remote write as a reviewed,
forward-only migration against the canonical ref.

Copy `.env.example` to the repository root as `.env` and provide the project's public values. All three Vite portals read their browser-safe configuration from this one file:

```dotenv
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

The publishable key is intended for browser use and is protected by Supabase Row Level Security. Never expose a secret or service-role key through a `VITE_` or `NEXT_PUBLIC_` variable.

After `@repo/database` has been built, applications can import the shared singleton, factory, helpers, and schema types from the package root:

```ts
import { supabase, type Tables } from "@repo/database";

type University = Tables<"universities">;
```

`packages/database/types.ts` is generated/maintained alongside the current
Supabase schema. Validate types against the canonical migration set rather than
assuming the older blueprint table count remains current.
