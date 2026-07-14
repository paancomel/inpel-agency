# `@repo/database`

Central, browser-safe Supabase client and public-schema contract for all three portals.

## Public API

- `supabase`: initialized `SupabaseClient<Database>` singleton
- `createSupabaseClient(environment?)`: typed factory for isolated runtimes and tests
- `getSupabaseConfig(environment)`: strict public-environment validation
- `Tables<"table_name">`, `TablesInsert<"table_name">`, and `TablesUpdate<"table_name">`: table helpers
- Individual row, insert, update, status, role, UUID, timestamp, and JSON types
- `DATABASE_CONSTRAINTS`: unique and cascading-delete metadata not expressible in Supabase's generated table types

## Blueprint translation rules

- PostgreSQL `uuid`, `timestamp`, `numeric`, `integer`, and `jsonb` map to `string`, `string`, `number`, `number`, and recursive `Json` respectively.
- Primary keys are always non-null. IDs with `default(uuid_v4())` are optional on insert; `profiles.id` remains required because it comes from `auth.users.id` and has no declared default.
- A column is non-null only when the blueprint says `Not Null` (or it is a primary key). A default alone does not make a PostgreSQL column non-null.
- Text values whose blueprint explicitly lists a closed set are represented as unions: `ProfileRole`, `SessionStatus`, and `PaymentStatus`.
- All documented foreign keys are present in `Database.public.Tables.*.Relationships`.
- Unique and `ON DELETE CASCADE` constraints are preserved in `DATABASE_CONSTRAINTS`; TypeScript cannot enforce either behavior at runtime.

The blueprint describes `jsonb` contents in prose but does not define their exact properties, so those columns intentionally use recursive `Json` rather than guessed object shapes. Likewise, RLS descriptions are authorization requirements for future SQL policies; client-side types cannot enforce them.
