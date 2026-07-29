import { Eye, Sparkles } from "lucide-react";
import { useState } from "react";

import { STUDY_YEARS, type StudyYear } from "../lib/types";
import { quickReviewSchema, toFieldErrors, type FieldErrors } from "../lib/validation";
import { ModalShell } from "./ModalShell";
import { StarRating } from "./StarRating";

interface QuickReviewModalProps { onClose: () => void; onUnlock: () => void; }

export function QuickReviewModal({ onClose, onUnlock }: QuickReviewModalProps) {
  const [course, setCourse] = useState("");
  const [year, setYear] = useState<StudyYear | "">("");
  const [rating, setRating] = useState(0);
  const [errors, setErrors] = useState<FieldErrors>({});
  const inputClass = "mt-1.5 w-full rounded-xl border border-sea-fog px-3.5 py-3 text-sm focus:border-tidal-teal focus:outline-none";

  function submit() {
    const result = quickReviewSchema.safeParse({ course, year, rating });
    if (!result.success) { setErrors(toFieldErrors(result.error)); return; }
    onUnlock();
  }

  return (
    <ModalShell titleId="quick-review-title" onClose={onClose}>
      <div className="grid md:grid-cols-[0.85fr_1.15fr]">
        <div className="dot-field bg-midnight-harbor p-7 text-white sm:p-8">
          <div className="grid size-12 place-items-center rounded-xl bg-mint-signal text-midnight-harbor"><Eye size={24} aria-hidden="true" /></div>
          <p className="mt-8 text-xs font-bold uppercase tracking-widest text-mint-signal">Give a little. Get the real story.</p>
          <h2 id="quick-review-title" className="mt-2 font-display text-3xl leading-tight">Unlock Unspoken Truths</h2>
          <p className="mt-4 text-sm leading-relaxed text-white/70">A 20-second pulse check helps keep this community useful—and opens the candid layer for you.</p>
          <div className="mt-8 flex items-center gap-2 text-xs font-bold text-white/80"><Sparkles size={15} aria-hidden="true" /> No email required</div>
        </div>
        <div className="space-y-5 p-7 sm:p-8">
          <label className="block text-sm font-bold">Course or major<input value={course} onChange={(event) => setCourse(event.target.value)} className={inputClass} aria-invalid={Boolean(errors.course)} />{errors.course ? <span className="mt-1 block text-sm font-medium text-red-700">{errors.course}</span> : null}</label>
          <label className="block text-sm font-bold">Year of study<select value={year} onChange={(event) => setYear(event.target.value as StudyYear | "")} className={inputClass} aria-invalid={Boolean(errors.year)}><option value="">Choose your year</option>{STUDY_YEARS.map((item) => <option key={item}>{item}</option>)}</select>{errors.year ? <span className="mt-1 block text-sm font-medium text-red-700">{errors.year}</span> : null}</label>
          <div><span className="text-sm font-bold">Your overall rating</span><StarRating value={rating} onChange={setRating} />{errors.rating ? <span className="block text-sm font-medium text-red-700">{errors.rating}</span> : null}</div>
          <button type="button" onClick={submit} className="w-full rounded-full bg-mint-signal px-5 py-3 font-bold text-midnight-harbor transition hover:bg-sun-paper">Submit &amp; Unlock Secrets</button>
          <p className="text-center text-xs leading-relaxed text-slate-500">Your pulse check is stored without identity details.</p>
        </div>
      </div>
    </ModalShell>
  );
}
