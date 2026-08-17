import { FileUp, Upload } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { parseInstitutionImport } from "../lib/import";
import { usePortal } from "../state/usePortal";

export function ImportPage() {
  const { importDraft } = usePortal();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isImporting, setImporting] = useState(false);

  async function handleFile(file: File | null) {
    if (!file) return;
    setError(null);
    if (file.type && file.type !== "application/json") {
      setError("Upload the INPELER JSON template file.");
      return;
    }
    setImporting(true);
    try {
      const result = parseInstitutionImport(await file.text());
      if (!result.success) {
        setError(result.message);
        return;
      }
      importDraft(result.data);
      navigate("/dashboard/global-profile");
    } catch {
      setError("The import file could not be read. Try again with a JSON file.");
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <p className="eyebrow">Institution data import</p>
      <h2 className="page-title">Start with an approved data template.</h2>
      <p className="page-intro">Import profile, programmes, facilities, gallery and attestation data from a validated INPELER JSON template. Review every field before publishing.</p>

      <section className="mt-9 border border-dashed border-slate-300 bg-white p-7">
        <div className="flex items-start gap-4"><span className="grid h-11 w-11 shrink-0 place-items-center bg-mist text-navy"><FileUp aria-hidden="true" size={22} /></span><div><h3 className="font-bold text-navy">JSON template import</h3><p className="mt-1 text-sm leading-6 text-slate-500">The importer validates every recognised field, rejects malformed files, and leaves the existing draft untouched if validation fails.</p></div></div>
        <label className="mt-6 flex cursor-pointer items-center justify-center gap-2 border border-slate-300 bg-mist/50 px-4 py-4 text-sm font-bold text-navy hover:bg-mist" htmlFor="institution-import">
          <Upload aria-hidden="true" size={18} /> {isImporting ? "Importing…" : "Choose JSON template"}
        </label>
        <input accept="application/json,.json" className="sr-only" disabled={isImporting} id="institution-import" onChange={(event) => void handleFile(event.target.files?.[0] ?? null)} type="file" />
        {error ? <p className="mt-4 text-sm font-semibold text-rose-700" role="alert">{error}</p> : null}
      </section>
    </div>
  );
}
