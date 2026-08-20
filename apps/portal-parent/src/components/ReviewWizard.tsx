// HERO: a five-stage contribution trail that makes a demanding review feel achievable.
import { ArrowLeft, ArrowRight, Check, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { ReviewSyncStatus } from "../lib/review-data";
import { clearDraft, loadDraft, saveDraft } from "../lib/storage";
import {
  EMPTY_RATINGS,
  RATING_DIMENSIONS,
  STUDY_YEARS,
  type ExperienceKey,
  type ReviewDraft,
  type ReviewIdentity,
  type UniversityTarget,
} from "../lib/types";
import {
  backgroundSchema,
  finalReviewSchema,
  toFieldErrors,
  type FieldErrors,
} from "../lib/validation";

const EXPERIENCE_FIELDS: [ExperienceKey, string, string][] = [
  ["transport", "Nearby transport", "What works, what does not, and the actual daily timing."],
  ["food", "3 affordable places to eat", "Name three places and explain what makes them student-friendly."],
  ["classes", "Timetable & class sessions", "Describe the rhythm, teaching sessions, and workload."],
  ["commute", "Getting to and from class", "Walk us through your real daily route."],
  ["activities", "Things to do nearby", "Share the enjoyable places students actually visit."],
  ["prosCons", "Advantages & disadvantages", "Be specific and balanced."],
  ["livingCost", "Living cost reality", "Explain where the money goes each month."],
  ["safety", "Safety", "Share practical context for day and night."],
  ["curfew", "Hostel curfew", "Explain the rules or state clearly if not applicable."],
  ["career", "Career prospects", "What genuinely helps graduates enter work?"],
  ["partTime", "Part-time work", "What opportunities are realistically available?"],
  ["lecturers", "Lecturers who are good", "No personal attacks—focus on teaching qualities."],
  ["boringClasses", "Classes that feel boring", "Explain the format or issue constructively."],
  ["hangouts", "Where to spend time between classes", "Share the practical student spots."],
];
const wordCount = (value: string) => value.trim().split(/\s+/).filter(Boolean).length;

function newDraft(universityId?: string): ReviewDraft {
  return {
    ...(universityId ? { universityId } : {}),
    course: "",
    year: "",
    ratings: { ...EMPTY_RATINGS },
    rating: 0,
    greenFlags: "",
    redFlags: "",
    spillTheTea: "",
    vibeTags: [],
    isAnonymous: true,
    reviewType: "standard",
    experiences: {},
    photos: {},
    declarations: { terms: false, privacy: false, age: false, rights: false },
  };
}

interface Props {
  identity: ReviewIdentity | null;
  universities: UniversityTarget[];
  initialUniversityId?: string;
  unavailableMessage?: string | null;
  onRequireAuth: () => void;
  onSubmit: (draft: ReviewDraft) => Promise<
    { ok: true; status: ReviewSyncStatus } | { ok: false; message: string }
  >;
}

export function ReviewWizard({
  identity,
  universities,
  initialUniversityId,
  unavailableMessage,
  onRequireAuth,
  onSubmit,
}: Props) {
  const restored = useMemo(() => loadDraft(), []);
  const [draft, setDraft] = useState<ReviewDraft>(() => {
    if (!restored || restored.reviewType !== "reward") {
      return restored ?? newDraft(initialUniversityId);
    }
    const standardDraft = { ...restored, reviewType: "standard" as const, photos: {} };
    delete standardDraft.rewardReviewId;
    return standardDraft;
  });
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const inputClass = "field-control";
  const totalScore = useMemo(() => {
    const values = Object.values(draft.ratings);
    return values.every(Boolean)
      ? Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(1))
      : 0;
  }, [draft.ratings]);

  useEffect(() => { saveDraft(draft); }, [draft]);
  useEffect(() => { headingRef.current?.focus(); }, [step]);

  function goNext() {
    if (step === 1) {
      const result = backgroundSchema.safeParse(draft);
      if (!result.success) {
        setErrors(toFieldErrors(result.error));
        return;
      }
      if (!draft.universityId) {
        setErrors({ universityId: "Choose an institution" });
        return;
      }
      if (!universities.some((university) => university.id === draft.universityId)) {
        setErrors({ universityId: "Choose a currently verified institution" });
        return;
      }
    }
    if (step === 2 && Object.values(draft.ratings).some((value) => value < 1)) {
      setMessage("Score all eight areas before continuing.");
      return;
    }
    if (step === 3 && wordCount(draft.spillTheTea) < 30) {
      setMessage("Your main experience needs at least 30 words.");
      return;
    }
    setErrors({});
    setMessage("");
    setStep((value) => Math.min(5, value + 1));
  }

  async function submit() {
    const result = finalReviewSchema.safeParse(draft);
    if (!result.success) {
      setErrors(toFieldErrors(result.error));
      setMessage("Check the declarations and written review before submitting.");
      return;
    }
    if (!identity) {
      setMessage("Sign in to submit. Your draft is saved and will still be here when you return.");
      onRequireAuth();
      return;
    }

    setBusy(true);
    const response = await onSubmit({
      ...draft,
      reviewType: "standard",
      rating: totalScore,
      identity,
    });
    setBusy(false);
    if (!response.ok) {
      setMessage(response.message);
      return;
    }
    clearDraft();
    setStep(6);
  }

  return (
    <main className="review-canvas">
      <div className="review-shell">
        <aside className="wizard-rail" aria-label="Review progress">
          <p className="eyebrow text-sun-paper">INPOLOR FIELD NOTE</p>
          <h1 className="mt-4 font-display text-4xl leading-none text-white">
            Your experience can change someone&apos;s decision.
          </h1>
          <p className="mt-4 text-sm leading-6 text-white/70">
            Always anonymous. Every submission is screened and manually reviewed before publication.
          </p>
          <ol className="mt-8 space-y-3">
            {["Background", "Eight ratings", "Daily experience", "Submission", "Review & submit"].map((label, index) => (
              <li
                key={label}
                className={`wizard-step ${step === index + 1 ? "is-current" : step > index + 1 ? "is-done" : ""}`}
              >
                <span>{step > index + 1 ? <Check size={15} /> : index + 1}</span>
                {label}
              </li>
            ))}
          </ol>
          <div className="reward-ticket">
            <ShieldCheck size={20} />
            <div>
              <strong>Community review</strong>
              <small>Every submission is reviewed before publication</small>
            </div>
          </div>
        </aside>

        <section className="wizard-content">
          {step <= 5 ? (
            <>
              <div className="flex items-center justify-between">
                <p className="eyebrow">STEP {step} OF 5</p>
                <span className="text-xs font-bold text-slate-500">Draft saved</span>
              </div>
              <div className="mt-3 h-1.5 bg-sea-fog">
                <div className="h-full bg-coral-note transition-all" style={{ width: `${step * 20}%` }} />
              </div>
            </>
          ) : null}

          <div className="wizard-body">
            {step === 1 ? (
              <div>
                <h2 ref={headingRef} tabIndex={-1} className="wizard-title">Start with the facts.</h2>
                <p className="wizard-lede">This context is public. Your name and account are never shown.</p>
                {unavailableMessage ? (
                  <div className="notice-card" role="status"><ShieldCheck /><p>{unavailableMessage}</p></div>
                ) : null}
                <label className="field-label">
                  Institution
                  <select
                    aria-label="Institution"
                    className={inputClass}
                    disabled={!universities.length}
                    value={draft.universityId ?? ""}
                    onChange={(event) => setDraft({ ...draft, universityId: event.target.value })}
                  >
                    <option value="">Choose an institution</option>
                    {universities.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}{item.location ? ` · ${item.location}` : ""}
                      </option>
                    ))}
                  </select>
                  {errors.universityId ? <small className="field-error">{errors.universityId}</small> : null}
                </label>
                <label className="field-label">
                  Course
                  <input
                    className={inputClass}
                    value={draft.course}
                    onChange={(event) => setDraft({ ...draft, course: event.target.value })}
                    placeholder="Search or type your course"
                  />
                  {errors.course ? <small className="field-error">{errors.course}</small> : null}
                </label>
                <label className="field-label">
                  Calendar year studied
                  <select
                    className={inputClass}
                    value={draft.year}
                    onChange={(event) => setDraft({ ...draft, year: event.target.value })}
                  >
                    <option value="">Choose a year</option>
                    {STUDY_YEARS.map((year) => <option key={year}>{year}</option>)}
                  </select>
                  {errors.year ? <small className="field-error">{errors.year}</small> : null}
                </label>
              </div>
            ) : null}

            {step === 2 ? (
              <div>
                <h2 ref={headingRef} tabIndex={-1} className="wizard-title">Score the whole experience.</h2>
                <p className="wizard-lede">
                  All eight dimensions carry equal weight. Your calculated total is <strong>{totalScore || "—"}/10</strong>.
                </p>
                <div className="rating-form">
                  {RATING_DIMENSIONS.map(([key, label], index) => (
                    <label key={key}>
                      <span><b>{String(index + 1).padStart(2, "0")}</b>{label}</span>
                      <select
                        aria-label={label}
                        value={draft.ratings[key] || ""}
                        onChange={(event) => setDraft({
                          ...draft,
                          ratings: { ...draft.ratings, [key]: Number(event.target.value) },
                        })}
                      >
                        <option value="">—</option>
                        {Array.from({ length: 10 }, (_, item) => <option key={item + 1}>{item + 1}</option>)}
                      </select>
                    </label>
                  ))}
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div>
                <h2 ref={headingRef} tabIndex={-1} className="wizard-title">Write what brochures leave out.</h2>
                <p className="wizard-lede">One substantive answer publishes as a standard review.</p>
                <label className="field-label">
                  Your main experience
                  <textarea
                    className={inputClass}
                    rows={5}
                    value={draft.spillTheTea}
                    onChange={(event) => setDraft({ ...draft, spillTheTea: event.target.value })}
                    placeholder="What should a future student genuinely know?"
                  />
                  <small>{wordCount(draft.spillTheTea)}/30 minimum words</small>
                </label>
                <div className="experience-grid">
                  {EXPERIENCE_FIELDS.map(([key, label, hint]) => (
                    <label className="field-label" key={key}>
                      {label}
                      <textarea
                        className={inputClass}
                        rows={3}
                        value={draft.experiences[key] ?? ""}
                        onChange={(event) => setDraft({
                          ...draft,
                          experiences: { ...draft.experiences, [key]: event.target.value },
                        })}
                        placeholder={hint}
                      />
                    </label>
                  ))}
                </div>
                <label className="field-label">
                  Estimated monthly living cost (RM)
                  <input
                    className={inputClass}
                    type="number"
                    min="300"
                    max="10000"
                    value={draft.livingCost ?? ""}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      if (value) {
                        setDraft({ ...draft, livingCost: value });
                      } else {
                        const next = { ...draft };
                        delete next.livingCost;
                        setDraft(next);
                      }
                    }}
                    placeholder="e.g. 1650"
                  />
                </label>
              </div>
            ) : null}

            {step === 4 ? (
              <div>
                <h2 ref={headingRef} tabIndex={-1} className="wizard-title">Your review matters.</h2>
                <p className="wizard-lede">
                  Submit a complete standard review to help future students. There is no cash reward or photo requirement during this launch.
                </p>
                <div className="notice-card">
                  <ShieldCheck />
                  <p><strong>Review for the community.</strong><br />Your review remains anonymous and is published only after manual moderation.</p>
                </div>
              </div>
            ) : null}

            {step === 5 ? (
              <div>
                <h2 ref={headingRef} tabIndex={-1} className="wizard-title">Anonymous by design.</h2>
                <p className="wizard-lede">Review the essentials and confirm before your submission enters moderation.</p>
                <div className="review-summary">
                  <div><span>Institution</span><strong>{universities.find((item) => item.id === draft.universityId)?.name}</strong></div>
                  <div><span>Course · year</span><strong>{draft.course} · {draft.year}</strong></div>
                  <div><span>Total rating</span><strong>{totalScore}/10</strong></div>
                  <div><span>Contribution</span><strong>Standard review</strong></div>
                </div>
                <fieldset className="declarations">
                  <legend>Required confirmations</legend>
                  <label><input type="checkbox" checked={draft.declarations.terms} onChange={(event) => setDraft({ ...draft, declarations: { ...draft.declarations, terms: event.target.checked } })} />I agree to the <Link to="/legal/terms">Terms &amp; Conditions</Link>.</label>
                  <label><input type="checkbox" checked={draft.declarations.privacy} onChange={(event) => setDraft({ ...draft, declarations: { ...draft.declarations, privacy: event.target.checked } })} />I acknowledge the <Link to="/legal/privacy">Privacy Policy</Link> and automated safety processing.</label>
                  {([
                    ["age", "I declare that I am 18 years old or older."],
                    ["rights", "This content is mine to submit and safe for anonymous publication."],
                  ] as const).map(([key, label]) => (
                    <label key={key}><input type="checkbox" checked={draft.declarations[key]} onChange={(event) => setDraft({ ...draft, declarations: { ...draft.declarations, [key]: event.target.checked } })} />{label}</label>
                  ))}
                </fieldset>
                <div className="notice-card">
                  <ShieldCheck />
                  <p><strong>Your public identity stays anonymous.</strong><br />Your account link, declarations, and submission time are retained privately for safety, moderation, and compliance. They are never published.</p>
                </div>
              </div>
            ) : null}

            {step === 6 ? (
              <div className="py-12 text-center">
                <div className="success-mark"><Check /></div>
                <h2 ref={headingRef} tabIndex={-1} className="wizard-title mt-6">Submitted for moderation.</h2>
                <p className="wizard-lede mx-auto max-w-lg">
                  Your review is not public yet. Track its status in My reviews. Once a moderator approves and publishes it, your account will unlock Unspoken Truths across INPOLOR.
                </p>
                <a href="/account/reviews" className="button-primary mt-6 inline-flex">View my reviews</a>
              </div>
            ) : null}

            {message ? <p className="form-alert" role="alert">{message}</p> : null}
          </div>

          {step <= 5 ? (
            <footer className="wizard-actions">
              {step > 1
                ? <button type="button" className="button-ghost" onClick={() => setStep(step - 1)}><ArrowLeft size={18} />Back</button>
                : <a className="button-ghost" href="/">Cancel</a>}
              {step < 5
                ? <button type="button" className="button-primary" disabled={step === 1 && !universities.length} onClick={goNext}>Continue<ArrowRight size={18} /></button>
                : <button type="button" className="button-primary" disabled={busy} onClick={() => void submit()}>{busy ? "Submitting…" : identity ? "Submit for review" : "Sign in & submit"}<ArrowRight size={18} /></button>}
            </footer>
          ) : null}
        </section>
      </div>
    </main>
  );
}
