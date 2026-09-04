# Canonical Supabase environment

## Non-negotiable boundary

All Supabase work for this repository uses exactly one project:

| Purpose | Canonical value |
| --- | --- |
| Supabase project ref | `xrmrhjgkttxzvwdsjazs` |
| Project name | `inpel-agency` |
| Region | `ap-southeast-1` |
| Environment role | Disposable staging and canonical schema source |

Do not connect to, inspect, write to, or substitute any other Supabase project.

## Execution policy

- Do not use Docker Desktop or a local Supabase stack for this repository.
- Use the project-scoped Supabase MCP connection and/or an authenticated Supabase CLI linked to `xrmrhjgkttxzvwdsjazs`.
- Before every remote operation, verify the project ref and stop if it does not match the canonical value.
- Never use `supabase migration repair`, `db reset`, or a rollback that broadens access as a way to conceal migration drift.
- Treat the live migration history and schema in this staging project as the source of truth until the repository migration files have been reconciled and verified.

## Current reconciliation state

The repository and canonical staging project each contain the same 35 migration IDs in the same order. The canonical evidence record is [the staging schema audit](audits/STAGING_SCHEMA_AUDIT_2026-09-04.md). Preserve that history; do not rewrite it with `migration repair`, a reset, or a rollback merely to resolve future drift.
