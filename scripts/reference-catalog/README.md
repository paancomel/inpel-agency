# Reference diploma catalogue preparation

This workflow prepares the source workbook for a reviewed Supabase import. It
does **not** connect to a database, create institutions, publish any catalogue
row, or modify `universities`/`courses`.

Run the bundled Python runtime against the source workbook:

```powershell
& 'C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' scripts/reference-catalog/prepare_diploma_reference.py 'C:\path\to\Senarai Diploma.xlsx' --output-dir .tmp/reference-diploma
```

Review `dry-run-report.json` and every produced CSV before an administrator
runs the transactional loader. It creates/updates one
`private.reference_import_runs` record, upserts the reference tables by their
stable natural keys, and never creates `universities`, `courses`, reviews, or
visibility rows.

After review, run the loader with a privileged database connection. Supply the
absolute CSV paths emitted by the preparation command as psql variables; the
same source checksum can be run again safely.

```powershell
psql $env:SUPABASE_DB_URL -v source_filename='Senarai Diploma.xlsx' -v source_sha256='<checksum from dry-run-report.json>' -v source_row_count=6302 -v institutions_csv='C:\absolute\reference_institutions.csv' -v classifications_csv='C:\absolute\nec_classifications.csv' -v programmes_csv='C:\absolute\reference_programmes.csv' -v institution_aliases_csv='C:\absolute\institution_aliases.csv' -v programme_aliases_csv='C:\absolute\programme_aliases.csv' -v collaborations_csv='C:\absolute\programme_collaborations.csv' -f scripts/reference-catalog/load_diploma_reference.psql
```

When only Supabase CLI project access is available, build batch files and run
each file with `supabase db query --linked --file <file>`. The batch builder is
resumable and does not require a database password:

```powershell
& 'C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' scripts/reference-catalog/build_diploma_import_sql.py 'C:\path\to\Senarai Diploma.xlsx' --output-dir $env:TEMP\reference-diploma-sql
Get-ChildItem $env:TEMP\reference-diploma-sql\*.sql | Sort-Object Name | ForEach-Object { supabase db query --linked --file $_.FullName }
```

Publishing an INPOLOR institution requires all of the following:

1. a verified reference-institution link;
2. an existing `universities` record that is verified, complete, and not
   suspended;
3. an explicit `portal_catalog_visibility` row for `inpolor` with status
   `published` and a `published_at` timestamp.

The importer must be run in dry-run mode and signed off before any privileged
database write. Never upload the workbook through a browser client or place a
service-role key in the script or an app environment file.
