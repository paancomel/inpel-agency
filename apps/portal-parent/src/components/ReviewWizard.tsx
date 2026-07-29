import { Check, ChevronLeft, ChevronRight, PartyPopper, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { ReviewSyncStatus } from "../lib/review-data";
import { STUDY_YEARS, type ReviewDraft, type ReviewIdentity, type StudyYear, type UniversityTarget } from "../lib/types";
import { backgroundSchema, finalReviewSchema, toFieldErrors, type FieldErrors } from "../lib/validation";
import { ModalShell } from "./ModalShell";
import { StarRating } from "./StarRating";

const VIBE_TAGS = ["Career-ready", "Collaborative", "Creative", "Fast-paced", "Supportive", "Social"];

interface ReviewWizardProps {
  identity: ReviewIdentity | null;
  universitySelection: {
    status: "loading" | "ready" | "unavailable";
    targets: UniversityTarget[];
    message?: string;
  };
  onClose: () => void;
  onRequireAuth: () => void;
  onSubmit: (draft: ReviewDraft) => Promise<
    { ok: true; status: ReviewSyncStatus } | { ok: false; message: string }
  >;
}

export function ReviewWizard({ identity, universitySelection, onClose, onRequireAuth, onSubmit }: ReviewWizardProps) {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string>();
  const [submissionStatus, setSubmissionStatus] = useState<ReviewSyncStatus>("local");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draft, setDraft] = useState<ReviewDraft>({
    course: "",
    year: "",
    rating: 0,
    greenFlags: "",
    redFlags: "",
    spillTheTea: "",
    vibeTags: [],
    isAnonymous: true,
  });
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => { headingRef.current?.focus(); }, [step]);

  function next() {
    if (step === 1) {
      const result = backgroundSchema.safeParse(draft);
      if (!result.success) {
        setErrors(toFieldErrors(result.error));
        return;
      }
      if (universitySelection.status === "ready" && !draft.universityId) {
        setErrors({ universityId: "Choose the university this review is about" });
        return;
      }
    }
    setErrors({});
    setStep((current) => Math.min(3, current + 1));
  }

  async function submit() {
    const result = finalReviewSchema.safeParse(draft);
    if (!result.success) {
      setErrors(toFieldErrors(result.error));
      return;
    }
    if (!draft.isAnonymous && !identity) {
      setFormError("Sign in before attaching your identity to this review.");
      onRequireAuth();
      return;
    }

    setIsSubmitting(true);
    const saved = await onSubmit(identity ? { ...draft, identity } : draft);
    setIsSubmitting(false);
    if (!saved.ok) {
      setFormError(saved.message);
      return;
    }
    setErrors({});
    setSubmissionStatus(saved.status);
    setStep(4);
  }

  const inputClass = "mt-2 w-full rounded-xl border border-sea-fog bg-white px-3.5 py-3 text-sm focus:border-tidal-teal focus:outline-none";

  return (
    <ModalShell titleId="review-wizard-title" onClose={onClose}>
      <div className="border-b border-sea-fog bg-ice-tint px-6 py-5 pr-16 sm:px-8">
        <p className="text-xs font-bold uppercase tracking-widest text-tidal-teal">Student voice · {step === 4 ? "Complete" : `Step ${step} of 3`}</p>
        <h2 ref={headingRef} tabIndex={-1} id="review-wizard-title" className="mt-1 font-display text-2xl outline-none">Write a Review</h2>
        {step < 4 ? <div className="mt-4 grid grid-cols-3 gap-2" aria-hidden="true">{[1, 2, 3].map((item) => <span key={item} className={`h-1.5 rounded-full ${item <= step ? "bg-tidal-teal" : "bg-sea-fog"}`} />)}</div> : null}
      </div>

      <div className="max-h-[70vh] overflow-y-auto px-6 py-6 sm:px-8">
        {step === 1 ? (
          <div className="space-y-5">
            <div><p className="text-sm font-bold text-tidal-teal">01 — Your background</p><h3 className="mt-1 font-display text-xl">Give your take some context.</h3></div>
            {universitySelection.status === "loading" ? <p className="rounded-xl bg-ice-tint p-3 text-sm text-slate-600" role="status">Loading universities for moderation…</p> : null}
            {universitySelection.status === "ready" ? (
              <div>
                <label htmlFor="review-university" className="block text-sm font-bold">University</label>
                <select id="review-university" value={draft.universityId ?? ""} onChange={(event) => setDraft((current) => {
                  const universityId = event.target.value;
                  if (universityId) return { ...current, universityId };
                  const withoutUniversity = { ...current };
                  delete withoutUniversity.universityId;
                  return withoutUniversity;
                })} className={inputClass} aria-invalid={Boolean(errors.universityId)} aria-describedby={errors.universityId ? "university-error" : undefined}>
                  <option value="">Choose a university</option>
                  {universitySelection.targets.map((university) => <option key={university.id} value={university.id}>{university.name}{university.location ? ` — ${university.location}` : ""}</option>)}
                </select>
                {errors.universityId ? <span id="university-error" className="mt-1 block text-sm font-medium text-red-700">{errors.universityId}</span> : null}
              </div>
            ) : <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900" role="status">{universitySelection.message ?? "University selection is unavailable. This review can be saved only on this device."}</p>}
            <div><label htmlFor="review-course" className="block text-sm font-bold">Course or major</label><input id="review-course" value={draft.course} onChange={(event) => setDraft({ ...draft, course: event.target.value })} className={inputClass} aria-invalid={Boolean(errors.course)} aria-describedby={errors.course ? "course-error" : undefined} />{errors.course ? <span id="course-error" className="mt-1 block text-sm font-medium text-red-700">{errors.course}</span> : null}</div>
            <div><label htmlFor="review-year" className="block text-sm font-bold">Year of study</label><select id="review-year" value={draft.year} onChange={(event) => setDraft({ ...draft, year: event.target.value as StudyYear | "" })} className={inputClass} aria-invalid={Boolean(errors.year)} aria-describedby={errors.year ? "year-error" : undefined}><option value="">Choose your year</option>{STUDY_YEARS.map((year) => <option key={year}>{year}</option>)}</select>{errors.year ? <span id="year-error" className="mt-1 block text-sm font-medium text-red-700">{errors.year}</span> : null}</div>
          </div>
        ) : null}

        {step === 2 ? <div className="space-y-5"><div><p className="text-sm font-bold text-tidal-teal">02 — The honest bits</p><h3 className="mt-1 font-display text-xl">What helped—and what didn&apos;t?</h3></div><label className="block text-sm font-bold">Green flags<textarea rows={3} value={draft.greenFlags} onChange={(event) => setDraft({ ...draft, greenFlags: event.target.value })} className={inputClass} placeholder="Lecturers, facilities, opportunities…" maxLength={500} /></label><label className="block text-sm font-bold">Red flags<textarea rows={3} value={draft.redFlags} onChange={(event) => setDraft({ ...draft, redFlags: event.target.value })} className={inputClass} placeholder="Workload, costs, campus friction…" maxLength={500} /></label></div> : null}

        {step === 3 ? <div className="space-y-5"><div><p className="text-sm font-bold text-tidal-teal">03 — Your verdict</p><h3 className="mt-1 font-display text-xl">Rate it, tag it, spill it.</h3></div><div><span className="text-sm font-bold">Overall rating</span><StarRating value={draft.rating} onChange={(rating) => setDraft({ ...draft, rating })} />{errors.rating ? <span className="block text-sm font-medium text-red-700">{errors.rating}</span> : null}</div><div><label htmlFor="spill-the-tea" className="block text-sm font-bold">Spill the tea</label><textarea id="spill-the-tea" rows={5} value={draft.spillTheTea} onChange={(event) => setDraft({ ...draft, spillTheTea: event.target.value })} className={inputClass} maxLength={1500} aria-invalid={Boolean(errors.spillTheTea)} aria-describedby="spill-help" />{errors.spillTheTea ? <span id="spill-help" className="mt-1 block text-sm font-medium text-red-700">{errors.spillTheTea}</span> : <span id="spill-help" className="mt-1 block text-xs text-slate-500">Minimum 20 characters. Keep it candid and constructive.</span>}</div><fieldset><legend className="text-sm font-bold">Campus vibe</legend><div className="mt-2 flex flex-wrap gap-2">{VIBE_TAGS.map((tag) => { const selected = draft.vibeTags.includes(tag); return <button key={tag} type="button" aria-pressed={selected} onClick={() => setDraft({ ...draft, vibeTags: selected ? draft.vibeTags.filter((item) => item !== tag) : [...draft.vibeTags, tag].slice(0, 5) })} className={`rounded-full border px-3 py-1.5 text-sm font-bold ${selected ? "border-midnight-harbor bg-midnight-harbor text-white" : "border-sea-fog"}`}>{selected ? <Check className="mr-1 inline" size={14} aria-hidden="true" /> : null}{tag}</button>; })}</div></fieldset><label className="flex items-start gap-3 rounded-xl bg-ice-tint p-4"><input type="checkbox" checked={draft.isAnonymous} onChange={(event) => setDraft({ ...draft, isAnonymous: event.target.checked })} className="mt-1 size-4 accent-tidal-teal" /><span><strong className="flex items-center gap-1.5 text-sm"><ShieldCheck size={16} aria-hidden="true" /> Post anonymously</strong><span className="mt-1 block text-xs text-slate-600">Your email and user ID are never sent in the review payload.</span></span></label></div> : null}

        {step === 4 ? <div className="py-8 text-center"><div className="mx-auto grid size-16 place-items-center rounded-full bg-mint-signal text-midnight-harbor"><PartyPopper size={30} aria-hidden="true" /></div><h3 className="mt-5 font-display text-3xl">{submissionStatus === "submitted" ? "Your review was submitted for moderation." : "Your review is saved on this device."}</h3><p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-slate-600">{submissionStatus === "submitted" ? "It is not public yet. It will appear only after moderation publishes it." : "It was not sent for public moderation. You can try again after university selection is available."}</p><button type="button" onClick={onClose} className="mt-7 rounded-full bg-midnight-harbor px-6 py-3 font-bold text-white">Close</button></div> : null}

        {formError ? <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-800" role="alert">{formError}</p> : null}
        {step < 4 ? <div className="mt-7 flex justify-between border-t border-sea-fog pt-5">{step > 1 ? <button type="button" onClick={() => setStep(step - 1)} className="flex items-center gap-1 rounded-full px-4 py-2.5 font-bold text-deep-current"><ChevronLeft size={18} aria-hidden="true" /> Back</button> : <span />}{step < 3 ? <button type="button" onClick={next} className="flex items-center gap-1 rounded-full bg-midnight-harbor px-5 py-2.5 text-white">Next <ChevronRight aria-hidden="true" size={18} /></button> : <button type="button" disabled={isSubmitting} onClick={() => void submit()} className="rounded-full bg-mint-signal px-6 py-2.5 font-bold text-midnight-harbor disabled:opacity-60">{isSubmitting ? "Saving…" : "Submit review"}</button>}</div> : null}
      </div>
    </ModalShell>
  );
}
