begin;

-- The import ledger lives in the private schema and has no browser grants.
-- Enable RLS as defense in depth while retaining postgres/service-role import
-- administration through their existing privileged execution paths.
alter table private.reference_import_runs enable row level security;

commit;
