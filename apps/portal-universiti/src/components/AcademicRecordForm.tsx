import { Plus, Trash2 } from "lucide-react";

import { SPM_SUBJECTS } from "../lib/assessment-data";
import { GRADE_OPTIONS, type Grade } from "../lib/validation";

export interface AcademicDraftRow {
  subject: string;
  grade: Grade | "";
}

interface AcademicRecordFormProps {
  rows: AcademicDraftRow[];
  onChange: (rows: AcademicDraftRow[]) => void;
}

export function AcademicRecordForm({ rows, onChange }: AcademicRecordFormProps) {
  function update(index: number, patch: Partial<AcademicDraftRow>) {
    onChange(rows.map((row, rowIndex) => rowIndex === index ? { ...row, ...patch } : row));
  }

  return (
    <div>
      <datalist id="spm-subject-options">{SPM_SUBJECTS.map((subject) => <option key={subject} value={subject} />)}</datalist>
      <div className="space-y-3">
        {rows.map((row, index) => (
          <div key={index} className="grid gap-3 border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[1fr_10rem_auto] sm:items-end">
            <label className="text-sm font-bold text-forest">SPM subject {index + 1}
              <input list="spm-subject-options" value={row.subject} onChange={(event) => update(index, { subject: event.target.value })} placeholder="Search subjects, e.g. Biology" className="field-control mt-2" />
            </label>
            <label className="text-sm font-bold text-forest">Grade
              <select value={row.grade} onChange={(event) => update(index, { grade: event.target.value as Grade | "" })} className="field-control mt-2"><option value="">Select grade</option>{GRADE_OPTIONS.map((grade) => <option key={grade}>{grade}</option>)}</select>
            </label>
            <button type="button" onClick={() => onChange(rows.filter((_, rowIndex) => rowIndex !== index))} disabled={rows.length === 1} aria-label={`Remove subject ${index + 1}`} className="grid size-11 place-items-center border border-slate-300 text-slate-500 hover:border-red-500 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-30"><Trash2 className="size-4" /></button>
          </div>
        ))}
      </div>
      <button type="button" disabled={rows.length >= 20} onClick={() => onChange([...rows, { subject: "", grade: "" }])} className="mt-4 inline-flex items-center gap-2 border border-forest px-5 py-3 text-sm font-bold text-forest hover:bg-mint disabled:opacity-50"><Plus className="size-4" /> Add Subject</button>
      <p className="mt-3 text-xs text-slate-500">Search and add up to 20 subjects. Each subject can appear once.</p>
    </div>
  );
}
