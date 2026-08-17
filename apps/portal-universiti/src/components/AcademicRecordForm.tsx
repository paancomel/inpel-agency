import { Plus, Trash2 } from "lucide-react";

import { SPM_SUBJECTS } from "../lib/assessment-data";
import { useLanguage } from "../lib/language";
import { GRADE_OPTIONS, type Grade } from "../lib/validation";

const COPY = {
  ms: { subject: "Subjek SPM", subjectPlaceholder: "Cari subjek, contohnya Biologi", grade: "Gred", selectGrade: "Pilih gred", remove: "Buang subjek", add: "Tambah subjek", hint: "Cari dan tambah sehingga 20 subjek. Setiap subjek hanya boleh dipilih sekali." },
  en: { subject: "SPM subject", subjectPlaceholder: "Search subjects, e.g. Biology", grade: "Grade", selectGrade: "Select grade", remove: "Remove subject", add: "Add subject", hint: "Search and add up to 20 subjects. Each subject can appear once." },
  ta: { subject: "SPM பாடம்", subjectPlaceholder: "பாடத்தைத் தேடுங்கள், எ.கா. உயிரியல்", grade: "தரம்", selectGrade: "தரத்தைத் தேர்ந்தெடுக்கவும்", remove: "பாடத்தை நீக்கு", add: "பாடத்தைச் சேர்", hint: "அதிகபட்சம் 20 பாடங்களைத் தேடிச் சேர்க்கலாம். ஒவ்வொரு பாடத்தையும் ஒருமுறை மட்டுமே சேர்க்க முடியும்." },
  "zh-CN": { subject: "SPM 科目", subjectPlaceholder: "搜索科目，例如生物", grade: "成绩", selectGrade: "选择成绩", remove: "删除科目", add: "添加科目", hint: "最多可搜索并添加 20 门科目，每门科目只能添加一次。" },
} as const;

export interface AcademicDraftRow {
  subject: string;
  grade: Grade | "";
}

interface AcademicRecordFormProps {
  rows: AcademicDraftRow[];
  onChange: (rows: AcademicDraftRow[]) => void;
}

export function AcademicRecordForm({ rows, onChange }: AcademicRecordFormProps) {
  const { language } = useLanguage();
  const copy = COPY[language];

  function update(index: number, patch: Partial<AcademicDraftRow>) {
    onChange(rows.map((row, rowIndex) => rowIndex === index ? { ...row, ...patch } : row));
  }

  return (
    <div>
      <datalist id="spm-subject-options">{SPM_SUBJECTS.map((subject) => <option key={subject} value={subject} />)}</datalist>
      <div className="space-y-3">
        {rows.map((row, index) => (
          <div key={index} className="grid gap-3 border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[1fr_10rem_auto] sm:items-end">
            <label className="text-sm font-bold text-forest">{copy.subject} {index + 1}
              <input list="spm-subject-options" value={row.subject} onChange={(event) => update(index, { subject: event.target.value })} placeholder={copy.subjectPlaceholder} className="field-control mt-2" />
            </label>
            <label className="text-sm font-bold text-forest">{copy.grade}
              <select value={row.grade} onChange={(event) => update(index, { grade: event.target.value as Grade | "" })} className="field-control mt-2"><option value="">{copy.selectGrade}</option>{GRADE_OPTIONS.map((grade) => <option key={grade}>{grade}</option>)}</select>
            </label>
            <button type="button" onClick={() => onChange(rows.filter((_, rowIndex) => rowIndex !== index))} disabled={rows.length === 1} aria-label={`${copy.remove} ${index + 1}`} className="grid size-11 place-items-center border border-slate-300 text-slate-500 hover:border-red-500 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-30"><Trash2 className="size-4" /></button>
          </div>
        ))}
      </div>
      <button type="button" disabled={rows.length >= 20} onClick={() => onChange([...rows, { subject: "", grade: "" }])} className="mt-4 inline-flex items-center gap-2 border border-forest px-5 py-3 text-sm font-bold text-forest hover:bg-mint disabled:opacity-50"><Plus className="size-4" /> {copy.add}</button>
      <p className="mt-3 text-xs text-slate-500">{copy.hint}</p>
    </div>
  );
}
