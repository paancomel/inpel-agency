#!/usr/bin/env python3
"""Build resumable Supabase CLI SQL batches from the reviewed diploma workbook.

The output can be executed with `supabase db query --linked --file <batch>`.
Each batch is idempotent and records the immutable workbook checksum, so a
failed run can be resumed without creating duplicate catalogue records.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import uuid
from pathlib import Path

from prepare_diploma_reference import REQUIRED_COLUMNS, normalise, read_first_sheet


def literal(value: str | None) -> str:
    if value is None or value == "":
        return "null"
    return "'" + value.replace("'", "''") + "'"


def chunks(items: list[dict[str, str]], size: int) -> list[list[dict[str, str]]]:
    return [items[index:index + size] for index in range(0, len(items), size)]


def write_sql(directory: Path, number: int, label: str, statements: list[str]) -> None:
    content = "begin;\n" + "\n".join(statements) + "\ncommit;\n"
    (directory / f"{number:03d}_{label}.sql").write_text(content, encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("workbook", type=Path)
    parser.add_argument("--output-dir", type=Path, required=True)
    parser.add_argument("--batch-size", type=int, default=250)
    args = parser.parse_args()
    if args.batch_size < 1:
        raise ValueError("--batch-size must be positive")

    source = args.workbook.read_bytes()
    sha256 = hashlib.sha256(source).hexdigest()
    import_id = uuid.uuid5(uuid.NAMESPACE_URL, f"agency-web:diploma:{sha256}")
    rows = read_first_sheet(args.workbook)
    if not rows or rows[0] != REQUIRED_COLUMNS:
        raise ValueError("Workbook does not match the approved diploma header contract")
    records = [dict(zip(REQUIRED_COLUMNS, row + [""] * (len(REQUIRED_COLUMNS) - len(row)))) for row in rows[1:] if any(row)]

    args.output_dir.mkdir(parents=True, exist_ok=True)
    for stale in args.output_dir.glob("*.sql"):
        stale.unlink()

    write_sql(args.output_dir, 0, "import_run", [
        "insert into private.reference_import_runs (id, source_filename, source_sha256, source_row_count, status, imported_at) values "
        f"({literal(str(import_id))}::uuid, {literal(args.workbook.name)}, {literal(sha256)}, {len(records)}, 'prepared', null) "
        "on conflict (source_sha256) do update set status = 'prepared', imported_at = null;"
    ])

    classifications: dict[str, tuple[str, str]] = {}
    institutions: dict[str, tuple[str, str | None]] = {}
    institution_aliases: dict[tuple[str, str], str] = {}
    programme_aliases: dict[tuple[str, str], str] = {}
    collaborations: dict[tuple[str, str], str] = {}
    for record in records:
        institution_name = record["institution_name"].strip()
        institution_key = normalise(institution_name)
        institutions.setdefault(institution_key, (institution_name, record["institution_previous_name"].strip() or None))
        code = record["nec_code"].strip()
        classifications[code] = (record["nec_description"].strip(), record["nec_broad_area"].strip())
        if record["institution_previous_name"].strip():
            alias = record["institution_previous_name"].strip()
            institution_aliases[(institution_key, normalise(alias))] = alias
        if record["qualification_previous_name"].strip():
            alias = record["qualification_previous_name"].strip()
            programme_aliases[(record["canonical_record_id"].strip(), normalise(alias))] = alias
        if record["collaboration_partner"].strip():
            partner = record["collaboration_partner"].strip()
            collaborations[(record["canonical_record_id"].strip(), normalise(partner))] = partner

    number = 1
    classification_rows = [{"code": code, "description": value[0], "broad_area": value[1]} for code, value in sorted(classifications.items())]
    for batch in chunks(classification_rows, args.batch_size):
        values = ",\n  ".join(f"({literal(row['code'])}, {literal(row['description'])}, {literal(row['broad_area'])}, {literal(str(import_id))}::uuid)" for row in batch)
        write_sql(args.output_dir, number, "classifications", [
            "insert into public.nec_classifications (code, description, broad_area, first_import_id) values\n  " + values +
            "\non conflict (code) do update set description = excluded.description, broad_area = excluded.broad_area;"
        ])
        number += 1

    institution_rows = [{"normalized_name": key, "source_name": value[0], "previous_name": value[1]} for key, value in sorted(institutions.items())]
    for batch in chunks(institution_rows, args.batch_size):
        values = ",\n  ".join(f"({literal(row['source_name'])}, {literal(row['normalized_name'])}, {literal(row['previous_name'])}, {literal(str(import_id))}::uuid)" for row in batch)
        write_sql(args.output_dir, number, "institutions", [
            "insert into public.reference_institutions (source_name, normalized_name, previous_name, first_import_id) values\n  " + values +
            "\non conflict (normalized_name) do update set source_name = excluded.source_name, previous_name = coalesce(excluded.previous_name, public.reference_institutions.previous_name), updated_at = current_timestamp;"
        ])
        number += 1

    for batch in chunks(records, args.batch_size):
        statements = []
        for row in batch:
            institution_key = normalise(row["institution_name"])
            statements.append(
                "insert into public.reference_programmes (canonical_record_id, reference_institution_id, source_bil_first, source_bils_all, reference_no, reference_family, qualification_name, normalized_qualification_name, previous_qualification_name, nec_code, import_id) "
                f"select {literal(row['canonical_record_id'].strip())}, id, {row['source_bil_first'].strip()}::integer, {literal(row['source_bils_all'].strip())}, {literal(row['reference_no'].strip())}, {literal(row['reference_family'].strip())}, {literal(row['qualification_name'].strip())}, {literal(normalise(row['qualification_name']))}, {literal(row['qualification_previous_name'].strip() or None)}, {literal(row['nec_code'].strip())}, {literal(str(import_id))}::uuid from public.reference_institutions where normalized_name = {literal(institution_key)} "
                "on conflict (canonical_record_id) do update set reference_institution_id = excluded.reference_institution_id, source_bil_first = excluded.source_bil_first, source_bils_all = excluded.source_bils_all, reference_no = excluded.reference_no, reference_family = excluded.reference_family, qualification_name = excluded.qualification_name, normalized_qualification_name = excluded.normalized_qualification_name, previous_qualification_name = excluded.previous_qualification_name, nec_code = excluded.nec_code, import_id = excluded.import_id, updated_at = current_timestamp;"
            )
        write_sql(args.output_dir, number, "programmes", statements)
        number += 1

    for batch in chunks([{"institution_key": key[0], "normalized_alias": key[1], "alias": value} for key, value in institution_aliases.items()], args.batch_size):
        statements = [
            "insert into public.reference_institution_aliases (reference_institution_id, alias, normalized_alias, alias_kind) "
            f"select id, {literal(row['alias'])}, {literal(row['normalized_alias'])}, 'previous_name' from public.reference_institutions where normalized_name = {literal(row['institution_key'])} on conflict (reference_institution_id, normalized_alias) do update set alias = excluded.alias;"
            for row in batch
        ]
        write_sql(args.output_dir, number, "institution_aliases", statements)
        number += 1

    for batch in chunks([{"record_id": key[0], "normalized_alias": key[1], "alias": value} for key, value in programme_aliases.items()], args.batch_size):
        statements = [
            "insert into public.reference_programme_aliases (canonical_record_id, alias, normalized_alias, alias_kind) values "
            f"({literal(row['record_id'])}, {literal(row['alias'])}, {literal(row['normalized_alias'])}, 'previous_name') on conflict (canonical_record_id, normalized_alias) do update set alias = excluded.alias;"
            for row in batch
        ]
        write_sql(args.output_dir, number, "programme_aliases", statements)
        number += 1

    for batch in chunks([{"record_id": key[0], "normalized_partner_name": key[1], "partner_name": value} for key, value in collaborations.items()], args.batch_size):
        statements = [
            "insert into public.reference_programme_collaborations (canonical_record_id, partner_name, normalized_partner_name) values "
            f"({literal(row['record_id'])}, {literal(row['partner_name'])}, {literal(row['normalized_partner_name'])}) on conflict (canonical_record_id, normalized_partner_name) do update set partner_name = excluded.partner_name;"
            for row in batch
        ]
        write_sql(args.output_dir, number, "collaborations", statements)
        number += 1

    write_sql(args.output_dir, number, "complete", [
        f"update private.reference_import_runs set status = 'applied', imported_at = current_timestamp where id = {literal(str(import_id))}::uuid;"
    ])
    manifest = {"import_id": str(import_id), "source_sha256": sha256, "record_count": len(records), "batch_count": number + 1}
    (args.output_dir / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(manifest, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
