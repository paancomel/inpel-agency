import { CheckCircle2, UploadCloud, X } from "lucide-react";
import { type ChangeEvent, useState } from "react";

import { validateUniversityImage } from "../lib/assets";

interface SecureImageUploadProps {
  existingUrl?: string | undefined;
  file: File | null;
  id: string;
  label: string;
  onChange: (file: File | null) => void;
}

export function SecureImageUpload({ existingUrl, file, id, label, onChange }: SecureImageUploadProps) {
  const [error, setError] = useState<string | null>(null);
  const helpId = `${id}-help`;
  const errorId = `${id}-error`;

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    setError(null);
    if (!selected) {
      onChange(null);
      return;
    }

    try {
      validateUniversityImage(selected);
      onChange(selected);
    } catch (caughtError) {
      event.target.value = "";
      onChange(null);
      setError(caughtError instanceof Error ? caughtError.message : "Choose a valid image.");
    }
  }

  return (
    <div>
      <label className="field-label" htmlFor={id}>{label}</label>
      <div className="mt-2 border border-dashed border-slate-300 bg-mist/40 p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {existingUrl ? <img alt="Current uploaded asset" className="h-16 w-20 border border-frost bg-white object-contain" src={existingUrl} /> : <span className="grid h-16 w-20 place-items-center border border-frost bg-white text-slate-400"><UploadCloud aria-hidden="true" size={24} /></span>}
          <div className="min-w-0 flex-1">
            <input
              accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"
              aria-describedby={`${helpId}${error ? ` ${errorId}` : ""}`}
              aria-invalid={Boolean(error)}
              className="block w-full text-sm text-slate-600 file:mr-4 file:border-0 file:bg-navy file:px-4 file:py-2.5 file:text-sm file:font-bold file:text-white hover:file:bg-slate-800"
              id={id}
              onChange={handleChange}
              type="file"
            />
            <p className="mt-2 text-xs leading-5 text-slate-500" id={helpId}>PNG, JPEG, or WebP. Maximum 5 MB. Upload begins when you publish.</p>
          </div>
        </div>
        {file ? <div className="mt-3 flex items-center justify-between gap-3 border-t border-frost pt-3"><p className="flex min-w-0 items-center gap-2 text-sm font-semibold text-emerald-800"><CheckCircle2 aria-hidden="true" className="shrink-0" size={17} /><span className="truncate">{file.name}</span></p><button aria-label={`Remove ${label}`} className="icon-button shrink-0" onClick={() => onChange(null)} type="button"><X aria-hidden="true" size={16} /></button></div> : null}
        {error ? <p className="mt-3 text-sm font-semibold text-rose-700" id={errorId} role="alert">{error}</p> : null}
      </div>
    </div>
  );
}
