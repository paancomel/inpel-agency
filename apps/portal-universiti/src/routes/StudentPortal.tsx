import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, BookOpen, BrainCircuit, CheckCircle2, LockKeyhole } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { Navigate, useNavigate, useParams } from "react-router-dom";

import { HobbyGraph } from "../components/HobbyGraph";
import { syncStudentAssessment } from "../lib/portal-data";
import { isValidSessionId, readSession, saveSession, type SessionRecord } from "../lib/storage";
import {
  CORE_SUBJECTS,
  GRADE_OPTIONS,
  studentAccountSchema,
  studentAssessmentSchema,
  type StudentAccount,
  type StudentAssessment,
} from "../lib/validation";

type WizardStep = 0 | 1 | 2 | 3;
type Grade = (typeof GRADE_OPTIONS)[number];
type CoreSubject = (typeof CORE_SUBJECTS)[number];

const traitCopy: Array<{ key: keyof StudentAssessment["psychometric"]; label: string; low: string; high: string }> = [
  { key: "analytical", label: "Analytical thinking", low: "Intuitive", high: "Evidence-led" },
  { key: "creative", label: "Creative expression", low: "Structured", high: "Imaginative" },
  { key: "social", label: "People energy", low: "Independent", high: "Collaborative" },
  { key: "practical", label: "Hands-on learning", low: "Conceptual", high: "Practical" },
  { key: "enterprising", label: "Initiative", low: "Supportive", high: "Leading" },
];

const electiveOptions = ["Additional Mathematics", "Biology", "Chemistry", "Physics", "Accounting", "Economics", "Computer Science", "Visual Arts"];

const defaultPsychometric: StudentAssessment["psychometric"] = {
  analytical: 50,
  creative: 50,
  social: 50,
  practical: 50,
  enterprising: 50,
};

export function StudentPortal() {
  const { id } = useParams();
  const navigate = useNavigate();
  const initialSession = isValidSessionId(id) ? readSession(id) : null;
  const [session, setSession] = useState<SessionRecord | null>(initialSession);
  const [step, setStep] = useState<WizardStep>(
    (initialSession?.studentDraft ? initialSession.studentProgress : 0) as WizardStep,
  );
  const [hobbies, setHobbies] = useState(initialSession?.studentDraft?.hobbies ?? []);
  const [psychometric, setPsychometric] = useState<StudentAssessment["psychometric"]>(initialSession?.studentDraft?.psychometric ?? defaultPsychometric);
  const [coreGrades, setCoreGrades] = useState<Partial<Record<CoreSubject, Grade | undefined>>>(initialSession?.studentDraft?.coreGrades ?? {});
  const [electives, setElectives] = useState(initialSession?.studentDraft?.electives ?? []);
  const [stepError, setStepError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const accountForm = useForm<StudentAccount>({
    resolver: zodResolver(studentAccountSchema),
    defaultValues: { email: initialSession?.studentDraft?.email ?? "", password: "" },
  });

  const toggleHobby = useCallback((hobby: string) => {
    setHobbies((current) => current.includes(hobby) ? current.filter((item) => item !== hobby) : [...current, hobby]);
    setStepError("");
  }, []);

  if (!isValidSessionId(id) || !session) return <Navigate to="/" replace />;
  const activeSession = session;

  function persistDraft(nextStep: WizardStep, email = activeSession.studentDraft?.email ?? "") {
    const updated: SessionRecord = {
      ...activeSession,
      studentProgress: Math.max(activeSession.studentProgress, nextStep),
      studentDraft: { email, hobbies, psychometric, coreGrades, electives },
    };
    if (!saveSession(updated)) {
      setStepError("We could not save your progress on this device.");
      return null;
    }
    setSession(updated);
    return updated;
  }

  const submitAccount = accountForm.handleSubmit((account) => {
    const updated: SessionRecord = {
      ...activeSession,
      studentProgress: Math.max(activeSession.studentProgress, 1),
      studentDraft: {
        email: account.email,
        hobbies,
        psychometric,
        coreGrades,
        electives,
      },
    };
    if (saveSession(updated)) {
      accountForm.reset({ email: account.email, password: "" });
      setSession(updated);
      setStep(1);
      setStepError("");
    }
  });

  function nextStep() {
    if (step === 1 && hobbies.length === 0) {
      setStepError("Please select at least one hobby to continue.");
      return;
    }
    const next = (step + 1) as WizardStep;
    if (persistDraft(next)) {
      setStep(next);
      setStepError("");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function submitAssessment() {
    const rawAssessment = { hobbies, psychometric, coreGrades, electives };
    const validated = studentAssessmentSchema.safeParse(rawAssessment);
    if (!validated.success) {
      setStepError(validated.error.issues[0]?.message ?? "Please review your assessment.");
      return;
    }

    const email = activeSession.studentDraft?.email;
    if (!email) {
      setStep(0);
      return;
    }

    setIsSubmitting(true);
    const completed: SessionRecord = {
      ...activeSession,
      status: "completed",
      studentProgress: 3,
      student: {
        email,
        assessment: validated.data,
        submittedAt: new Date().toISOString(),
      },
    };
    saveSession(completed);
    setSession(completed);
    await syncStudentAssessment(completed);
    navigate(`/checkout/${id}`);
  }

  return (
    <section className="min-h-[76vh] bg-cream px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-xs font-bold tracking-[0.2em] text-leaf uppercase">Student profile</p><h1 className="mt-2 font-display text-4xl font-bold text-forest sm:text-5xl">Build a match around you.</h1></div>
          {step > 0 && <Progress step={step} />}
        </div>

        <motion.div key={step} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,35,29,0.08)] sm:p-10">
          {step === 0 && (
            <form onSubmit={(event) => { void submitAccount(event); }} noValidate className="mx-auto max-w-xl py-4">
              <span className="grid size-12 place-items-center bg-mint text-leaf"><LockKeyhole className="size-5" aria-hidden="true" /></span>
              <h2 className="mt-5 font-display text-4xl font-bold text-forest">First, make this session yours.</h2>
              <p className="mt-3 leading-7 text-slate-600">Use your email and a temporary password for this prototype. The password is validated, then immediately discarded.</p>
              <label htmlFor="student-email" className="mt-7 block text-sm font-bold text-forest">Student email</label>
              <input id="student-email" type="email" autoComplete="email" className="field-control mt-2" {...accountForm.register("email")} />
              {accountForm.formState.errors.email && <p role="alert" className="mt-2 text-sm font-semibold text-red-700">{accountForm.formState.errors.email.message}</p>}
              <label htmlFor="student-password" className="mt-5 block text-sm font-bold text-forest">Password</label>
              <input id="student-password" type="password" autoComplete="new-password" className="field-control mt-2" {...accountForm.register("password")} />
              {accountForm.formState.errors.password && <p role="alert" className="mt-2 text-sm font-semibold text-red-700">{accountForm.formState.errors.password.message}</p>}
              <button type="submit" className="mt-7 inline-flex w-full items-center justify-center gap-2 bg-forest px-6 py-4 font-bold text-white hover:bg-leaf">Continue to assessment <ArrowRight className="size-5" /></button>
            </form>
          )}

          {step === 1 && (
            <div>
              <StepHeading icon={<BrainCircuit />} eyebrow="Part 1 · Interests" title="What pulls you in?" description="Choose at least one. Drag and zoom the graph to explore how interests connect." />
              <div className="mt-8"><HobbyGraph selected={hobbies} onToggle={toggleHobby} /></div>
              <WizardActions error={stepError} onNext={nextStep} />
            </div>
          )}

          {step === 2 && (
            <div>
              <StepHeading icon={<BrainCircuit />} eyebrow="Part 2 · Psychometric profile" title="How do you naturally work?" description="Move each slider toward the description that feels more like you." />
              <div className="mt-8 grid gap-5 lg:grid-cols-2">
                {traitCopy.map((trait) => (
                  <label key={trait.key} className="border border-slate-200 bg-slate-50 p-5">
                    <span className="flex items-center justify-between gap-4"><strong className="text-forest">{trait.label}</strong><output className="font-display text-2xl font-bold text-leaf">{psychometric[trait.key]}</output></span>
                    <input type="range" min="0" max="100" value={psychometric[trait.key]} onChange={(event) => setPsychometric((current) => ({ ...current, [trait.key]: Number(event.target.value) }))} className="mt-5 w-full accent-leaf" />
                    <span className="mt-2 flex justify-between text-xs font-semibold text-slate-500"><span>{trait.low}</span><span>{trait.high}</span></span>
                  </label>
                ))}
              </div>
              <WizardActions error={stepError} onBack={() => setStep(1)} onNext={nextStep} />
            </div>
          )}

          {step === 3 && (
            <div>
              <StepHeading icon={<BookOpen />} eyebrow="Part 3 · Academic record" title="Add your SPM snapshot." description="This helps us surface realistic entry pathways—not define your potential." />
              <div className="mt-8 grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                {CORE_SUBJECTS.map((subject) => (
                  <label key={subject} className="text-sm font-bold text-forest">{subject}
                    <select value={coreGrades[subject] ?? ""} onChange={(event) => { setCoreGrades((current) => ({ ...current, [subject]: event.target.value as Grade })); setStepError(""); }} className="field-control mt-2">
                      <option value="">Select grade</option>{GRADE_OPTIONS.map((grade) => <option key={grade}>{grade}</option>)}
                    </select>
                  </label>
                ))}
              </div>
              <fieldset className="mt-8"><legend className="text-sm font-bold text-forest">Elective subjects <span className="font-normal text-slate-500">(up to 5)</span></legend><div className="mt-3 flex flex-wrap gap-2">
                {electiveOptions.map((elective) => {
                  const checked = electives.includes(elective);
                  return <label key={elective} className="cursor-pointer"><input type="checkbox" checked={checked} onChange={() => { setElectives((current) => checked ? current.filter((item) => item !== elective) : current.length < 5 ? [...current, elective] : current); }} className="peer sr-only" /><span className="block border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 peer-checked:border-forest peer-checked:bg-forest peer-checked:text-white">{elective}</span></label>;
                })}
              </div></fieldset>
              <WizardActions error={stepError} onBack={() => setStep(2)} onSubmit={() => { void submitAssessment(); }} isSubmitting={isSubmitting} />
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

function Progress({ step }: { step: WizardStep }) {
  return <ol className="flex gap-2" aria-label={`Assessment step ${step} of 3`}>{[1, 2, 3].map((item) => <li key={item} className={`h-2 w-14 ${item <= step ? "bg-leaf" : "bg-slate-200"}`}><span className="sr-only">Step {item}{item <= step ? " complete or active" : " upcoming"}</span></li>)}</ol>;
}

function StepHeading({ icon, eyebrow, title, description }: { icon: React.ReactNode; eyebrow: string; title: string; description: string }) {
  return <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-start"><span className="grid size-12 place-items-center bg-mint text-leaf [&>svg]:size-5">{icon}</span><div><p className="text-xs font-bold tracking-[0.16em] text-leaf uppercase">{eyebrow}</p><h2 className="mt-2 font-display text-4xl font-bold text-forest">{title}</h2><p className="mt-2 max-w-2xl leading-7 text-slate-600">{description}</p></div></div>;
}

function WizardActions({ error, onBack, onNext, onSubmit, isSubmitting }: { error: string; onBack?: () => void; onNext?: () => void; onSubmit?: () => void; isSubmitting?: boolean }) {
  return <div className="mt-8 border-t border-slate-200 pt-6">{error && <p role="alert" className="mb-4 font-semibold text-red-700">{error}</p>}<div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">{onBack ? <button type="button" onClick={onBack} className="inline-flex items-center justify-center gap-2 border border-slate-300 px-5 py-3 font-bold text-slate-600 hover:border-forest hover:text-forest"><ArrowLeft className="size-4" /> Back</button> : <span />}{onNext && <button type="button" onClick={onNext} className="inline-flex items-center justify-center gap-2 bg-forest px-6 py-3 font-bold text-white hover:bg-leaf">Next <ArrowRight className="size-4" /></button>}{onSubmit && <button type="button" disabled={isSubmitting} onClick={onSubmit} className="inline-flex items-center justify-center gap-2 bg-forest px-6 py-3 font-bold text-white hover:bg-leaf disabled:opacity-60">{isSubmitting ? "Submitting…" : "Submit Profile"} <CheckCircle2 className="size-4" /></button>}</div></div>;
}
