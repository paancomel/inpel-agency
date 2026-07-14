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

Copy `.env.example` into each future portal's supported local environment file and provide the project's public values:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

The anonymous key is intended for browser use and is protected by Supabase Row Level Security. Never expose a service-role key through a `NEXT_PUBLIC_` variable.

After `@repo/database` has been built, applications can import the shared singleton, factory, helpers, and schema types from the package root:

```ts
import { supabase, type Tables } from "@repo/database";

type University = Tables<"universities">;
```

`packages/database/types.ts` mirrors the 11 tables in `_blueprints/1-Supabase-Schema.md`. Only fields explicitly marked `Not Null` (plus primary keys) are non-nullable. Columns with database defaults are optional during inserts but remain nullable in returned rows unless the blueprint also specifies `Not Null`.
