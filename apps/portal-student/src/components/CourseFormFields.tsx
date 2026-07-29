import type { ReactNode } from "react";

import type { Course } from "../types/portal";

export type CourseStringField = Exclude<{
  [Key in keyof Course]: Course[Key] extends string ? Key : never;
}[keyof Course], "id">;

interface CourseInputProps {
  error?: string | undefined;
  field: CourseStringField;
  inputMode?: "decimal" | "numeric" | "text" | undefined;
  label: string;
  onChange: (field: CourseStringField, value: string) => void;
  placeholder?: string | undefined;
  value: string;
}

export function CourseInput({ error, field, inputMode = "text", label, onChange, placeholder, value }: CourseInputProps) {
  const id = `course-${field}`;
  return <label className="block" htmlFor={id}><span className="field-label">{label}</span><input aria-describedby={error ? `${id}-error` : undefined} aria-invalid={Boolean(error)} className="field-control mt-2 bg-mist/50" id={id} inputMode={inputMode} onChange={(event) => onChange(field, event.target.value)} placeholder={placeholder} value={value} />{error ? <span className="mt-1 block text-xs font-semibold text-rose-700" id={`${id}-error`}>{error}</span> : null}</label>;
}

export function CourseTextarea({ error, field, label, onChange, placeholder, value }: CourseInputProps) {
  const id = `course-${field}`;
  return <label className="block" htmlFor={id}><span className="field-label">{label}</span><textarea aria-describedby={error ? `${id}-error` : undefined} aria-invalid={Boolean(error)} className="field-control mt-2 min-h-28 bg-mist/50" id={id} onChange={(event) => onChange(field, event.target.value)} placeholder={placeholder} value={value} />{error ? <span className="mt-1 block text-xs font-semibold text-rose-700" id={`${id}-error`}>{error}</span> : null}</label>;
}

export function CourseCheckbox({ checked, label, onChange }: { checked: boolean; label: string; onChange: (checked: boolean) => void }) {
  return <label className="flex cursor-pointer items-start gap-3 border border-frost bg-mist/40 p-4 text-sm font-semibold text-slate-700"><input checked={checked} className="mt-0.5 h-4 w-4 shrink-0 accent-coral" onChange={(event) => onChange(event.target.checked)} type="checkbox" /><span>{label}</span></label>;
}

export function CourseSection({ children, description, eyebrow, id, title }: { children: ReactNode; description: string; eyebrow: string; id: string; title: string }) {
  return <section className="section-card" aria-labelledby={id}><div className="section-heading"><span className="section-number">{eyebrow}</span><div><h3 id={id}>{title}</h3><p>{description}</p></div></div>{children}</section>;
}
