#!/usr/bin/env python3
"""Convert the diploma workbook into reviewable, import-ready CSV files.

This command never connects to Supabase and never writes SQL.  It is safe to
run repeatedly: outputs are deterministic and include a checksum/report that
must be reviewed before a privileged database import.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import re
import sys
from pathlib import Path
from zipfile import ZipFile
from xml.etree import ElementTree as ET

NS = {"main": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
REQUIRED_COLUMNS = [
    "canonical_record_id", "source_bil_first", "source_bils_all", "institution_name",
    "institution_previous_name", "reference_no", "reference_family", "qualification_name",
    "qualification_previous_name", "collaboration_partner", "nec_code", "nec_description",
    "nec_broad_area",
]


def normalise(value: str) -> str:
    return re.sub(r"\s+", " ", value.strip()).casefold()


def cell_value(cell: ET.Element, shared_strings: list[str]) -> str:
    cell_type = cell.get("t")
    value = cell.find("main:v", NS)
    if cell_type == "s":
        return shared_strings[int(value.text)] if value is not None else ""
    if cell_type == "inlineStr":
        return "".join(text.text or "" for text in cell.findall(".//main:t", NS))
    return value.text if value is not None and value.text is not None else ""


def read_first_sheet(path: Path) -> list[list[str]]:
    with ZipFile(path) as workbook:
        shared_strings: list[str] = []
        try:
            root = ET.fromstring(workbook.read("xl/sharedStrings.xml"))
            shared_strings = ["".join(text.text or "" for text in item.findall(".//main:t", NS)) for item in root.findall("main:si", NS)]
        except KeyError:
            pass

        sheet = ET.fromstring(workbook.read("xl/worksheets/sheet1.xml"))
        rows: list[list[str]] = []
        for row in sheet.findall(".//main:sheetData/main:row", NS):
            values: dict[int, str] = {}
            for cell in row.findall("main:c", NS):
                reference = cell.get("r", "A1")
                letters = re.match(r"([A-Z]+)", reference).group(1)
                column = 0
                for letter in letters:
                    column = column * 26 + ord(letter) - ord("A") + 1
                values[column - 1] = cell_value(cell, shared_strings)
            rows.append([values.get(index, "") for index in range(max(values, default=-1) + 1)])
    return rows


def write_csv(path: Path, headers: list[str], rows: list[dict[str, str]]) -> None:
    with path.open("w", newline="", encoding="utf-8") as output:
        writer = csv.DictWriter(output, fieldnames=headers)
        writer.writeheader()
        writer.writerows(rows)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("workbook", type=Path)
    parser.add_argument("--output-dir", type=Path, required=True)
    args = parser.parse_args()

    source_bytes = args.workbook.read_bytes()
    rows = read_first_sheet(args.workbook)
    if not rows:
        raise ValueError("Workbook has no rows.")
    headers = rows[0]
    if headers != REQUIRED_COLUMNS:
        raise ValueError(f"Unexpected headers. Expected {REQUIRED_COLUMNS}; got {headers}.")

    records = [dict(zip(headers, row + [""] * (len(headers) - len(row)))) for row in rows[1:] if any(row)]
    errors: list[str] = []
    identifiers: set[str] = set()
    for index, record in enumerate(records, start=2):
        record_id = record["canonical_record_id"].strip()
        if not re.fullmatch(r"MQA-\d{5}", record_id):
            errors.append(f"row {index}: invalid canonical_record_id {record_id!r}")
        if record_id in identifiers:
            errors.append(f"row {index}: duplicate canonical_record_id {record_id!r}")
        identifiers.add(record_id)
        nec_code = record["nec_code"].strip()
        if not re.fullmatch(r"\d{3,4}", nec_code):
            errors.append(f"row {index}: invalid NEC code {record['nec_code']!r}")

    institutions: dict[str, dict[str, str]] = {}
    classifications: dict[str, dict[str, str]] = {}
    programmes: list[dict[str, str]] = []
    aliases: list[dict[str, str]] = []
    collaborations: list[dict[str, str]] = []
    for record in records:
        institution_name = record["institution_name"].strip()
        institution_key = normalise(institution_name)
        institutions.setdefault(institution_key, {
            "normalized_name": institution_key,
            "source_name": institution_name,
            "previous_name": record["institution_previous_name"].strip(),
        })
        nec_code = record["nec_code"].strip()
        classification = {"code": nec_code, "description": record["nec_description"].strip(), "broad_area": record["nec_broad_area"].strip()}
        if nec_code in classifications and classifications[nec_code] != classification:
            errors.append(f"conflicting NEC classification for {nec_code}")
        classifications[nec_code] = classification
        programmes.append({
            "canonical_record_id": record["canonical_record_id"].strip(),
            "institution_normalized_name": institution_key,
            "source_bil_first": record["source_bil_first"].strip(),
            "source_bils_all": record["source_bils_all"].strip(),
            "reference_no": record["reference_no"].strip(),
            "reference_family": record["reference_family"].strip(),
            "qualification_name": record["qualification_name"].strip(),
            "normalized_qualification_name": normalise(record["qualification_name"]),
            "previous_qualification_name": record["qualification_previous_name"].strip(),
            "nec_code": nec_code,
        })
        if record["institution_previous_name"].strip():
            aliases.append({"institution_normalized_name": institution_key, "alias": record["institution_previous_name"].strip(), "normalized_alias": normalise(record["institution_previous_name"]), "alias_kind": "previous_name"})
        if record["qualification_previous_name"].strip():
            aliases.append({"canonical_record_id": record["canonical_record_id"].strip(), "alias": record["qualification_previous_name"].strip(), "normalized_alias": normalise(record["qualification_previous_name"]), "alias_kind": "previous_name"})
        if record["collaboration_partner"].strip():
            collaborations.append({"canonical_record_id": record["canonical_record_id"].strip(), "partner_name": record["collaboration_partner"].strip(), "normalized_partner_name": normalise(record["collaboration_partner"])})

    if errors:
        print(json.dumps({"status": "rejected", "errors": errors[:100], "error_count": len(errors)}, ensure_ascii=False, indent=2))
        return 1

    args.output_dir.mkdir(parents=True, exist_ok=True)
    write_csv(args.output_dir / "reference_institutions.csv", ["normalized_name", "source_name", "previous_name"], list(institutions.values()))
    write_csv(args.output_dir / "nec_classifications.csv", ["code", "description", "broad_area"], list(classifications.values()))
    write_csv(args.output_dir / "reference_programmes.csv", list(programmes[0]), programmes)
    write_csv(args.output_dir / "institution_aliases.csv", ["institution_normalized_name", "alias", "normalized_alias", "alias_kind"], [row for row in aliases if "institution_normalized_name" in row])
    write_csv(args.output_dir / "programme_aliases.csv", ["canonical_record_id", "alias", "normalized_alias", "alias_kind"], [row for row in aliases if "canonical_record_id" in row])
    write_csv(args.output_dir / "programme_collaborations.csv", ["canonical_record_id", "partner_name", "normalized_partner_name"], collaborations)
    report = {
        "status": "prepared",
        "source_filename": args.workbook.name,
        "source_sha256": hashlib.sha256(source_bytes).hexdigest(),
        "source_row_count": len(records),
        "reference_institution_count": len(institutions),
        "reference_programme_count": len(programmes),
        "nec_classification_count": len(classifications),
        "legacy_three_digit_nec_count": sum(1 for item in classifications if len(item) == 3),
        "institution_alias_count": sum(1 for row in aliases if "institution_normalized_name" in row),
        "programme_alias_count": sum(1 for row in aliases if "canonical_record_id" in row),
        "collaboration_count": len(collaborations),
    }
    (args.output_dir / "dry-run-report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
