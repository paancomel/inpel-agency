# `@repo/database`

Central, browser-safe Supabase client and public-schema contract for all three portals.

## Public API

- `supabase`: initialized `SupabaseClient<Database>` singleton
- `createSupabaseClient(environment?)`: typed factory for isolated runtimes and tests
- `getSupabaseConfig(environment)`: strict public-environment validation
- `Tables<"table_name">`, `TablesInsert<"table_name">`, and `TablesUpdate<"table_name">`: table helpers
- Individual row, insert, update, status, role, UUID, timestamp, and JSON types
- Portal value contracts including `MalaysianStudyLocation`, `MonthlyHouseholdIncome`, `ParentalPreferences`, `AcademicRecord`, `PersonalityTestAnswers`, and `VibeCheckQuiz`
- `DATABASE_CONSTRAINTS`: unique and cascading-delete metadata not expressible in Supabase's generated table types

## Blueprint translation rules

- PostgreSQL `uuid`, `timestamp`, `numeric`, `integer`, and `jsonb` map to `string`, `string`, `number`, `number`, and recursive `Json` respectively.
- Primary keys are always non-null. IDs with `default(uuid_v4())` are optional on insert; `profiles.id` remains required because it comes from `auth.users.id` and has no declared default.
- A column is non-null only when the blueprint says `Not Null` (or it is a primary key). A default alone does not make a PostgreSQL column non-null.
- Text values whose blueprint explicitly lists a closed set are represented as unions: `ProfileRole`, `SessionStatus`, and `PaymentStatus`.
- All documented foreign keys are present in `Database.public.Tables.*.Relationships`.
- Unique and `ON DELETE CASCADE` constraints are preserved in `DATABASE_CONSTRAINTS`; TypeScript cannot enforce either behavior at runtime.

The original aggregate `parent_preferences` and `assessment_data` columns remain recursive `Json` for compatibility. Migration `20260714050000_expand_portal_assessment_payloads.sql` adds typed text/JSONB columns for the amended portal fields, backfills recognized legacy data without deleting unknown shapes, and adds new-row checks. The portal dual-writes both representations during the expand phase. Its matching rollback lives under `supabase/rollback/` and is data-safe while that dual-write remains active.

RLS descriptions are authorization requirements for SQL policies; client-side types cannot enforce them.

## Three-portal integration audit

Run the live audit from the workspace root:

```powershell
pnpm test:integration
```

The command type-checks the audit against both portal source contracts, then connects to Supabase and verifies:

- the institution input flow using `portal-student`'s current Zod schemas and payload mappers;
- the parent/student assessment flow using `portal-universiti`'s current Zod schemas and dual-write payload mappers;
- generated UUIDs, foreign-key rejection (`23503`), uniqueness rejection (`23505`), and catalog cascade deletes;
- anonymous, student, parent, university-representative, and admin RLS behavior through isolated authenticated clients;
- an INPEL-style nested recommendation query joining the session, assessment, university, and programme without dropping fields;
- reverse-order cleanup of all database rows, public profiles, and temporary Auth users, even when an assertion fails.

Copy `integration.env.example` to `packages/database/.env.integration.local` and replace the placeholders. The runner also reads the workspace `.env` as a fallback and accepts `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`/`VITE_SUPABASE_PUBLISHABLE_KEY` as aliases for the public key. It requires one server-only credential (`SUPABASE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY`) solely to create isolated Auth identities, probe SQL constraints independently of RLS, and guarantee cleanup. That key is never logged or exported by the package.

Local Supabase URLs are allowed by default. A remote URL is refused unless `SUPABASE_AUDIT_ALLOW_REMOTE=true`; use that opt-in only for a disposable staging/test project. The suite intentionally fails when grants or RLS policies are missing, when an authorized portal action is blocked, or when an unauthorized action succeeds.
