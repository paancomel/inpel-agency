import { ArrowLeft, ArrowRight, BookOpen, BrainCircuit, CheckCircle2, HeartHandshake, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";

import { AcademicRecordForm, type AcademicDraftRow } from "../components/AcademicRecordForm";
import { PersonalityTest } from "../components/PersonalityTest";
import { StudentAuthGate, type AuthProvider } from "../components/StudentAuthGate";
import { VibeCheckQuiz } from "../components/VibeCheckQuiz";
import { calculateCareerSuggestions, PERSONALITY_QUESTIONS, type VibeQuestionId } from "../lib/assessment-data";
import { cacheAuthenticationDraft, createAuthenticationDraft } from "../lib/auth-draft";
import { completeCachedAuthentication } from "../lib/auth-flow";
import { authenticateStudentAccount, beginStudentOAuth, type StudentAuthMode } from "../lib/portal-data";
import { createStudentSessionRecord, isValidSessionId, readSession, saveSession, type SessionRecord } from "../lib/storage";
import { studentAssessmentSchema, type StudentAssessment } from "../lib/validation";

type WizardStep = 0 | 1 | 2 | 3 | 4;
type VibeDraft = NonNullable<SessionRecord["studentDraft"]>["vibeAnswers"];

const traitCopy: Array<{ key: keyof StudentAssessment["psychometric"]; label: string; low: string; high: string }> = [
  { key: "analytical", label: "Analytical thinking", low: "Intuitive", high: "Evidence-led" },
  { key: "creative", label: "Creative expression", low: "Structured", high: "Imaginative" },
  { key: "social", label: "People energy", low: "Independent", high: "Collaborative" },
  { key: "practical", label: "Hands-on learning", low: "Conceptual", high: "Practical" },
  { key: "enterprising", label: "Initiative", low: "Supportive", high: "Leading" },
];

const defaultPsychometric: StudentAssessment["psychometric"] = { analytical: 50, creative: 50, social: 50, practical: 50, enterprising: 50 };

export function StudentPortal() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const invitationToken = searchParams.get("token") ?? undefined;
  const navigate = useNavigate();
  const initialSession = isValidSessionId(id)
    ? readSession(id) ?? (invitationToken ? createStudentSessionRecord(id) : null)
    : null;
  const [session, setSession] = useState<SessionRecord | null>(initialSession);
  const [step, setStep] = useState<WizardStep>(initialSession?.studentDraft ? initialSession.studentProgress as WizardStep : initialSession?.student ? 4 : 0);
  const [personalityAnswers, setPersonalityAnswers] = useState<number[]>(initialSession?.studentDraft?.personalityAnswers ?? []);
  const [psychometric, setPsychometric] = useState<StudentAssessment["psychometric"]>(initialSession?.studentDraft?.psychometric ?? defaultPsychometric);
  const [subjects, setSubjects] = useState<AcademicDraftRow[]>(initialSession?.studentDraft?.subjects ?? [{ subject: "", grade: "" }]);
  const [vibeAnswers, setVibeAnswers] = useState<VibeDraft>(initialSession?.studentDraft?.vibeAnswers ?? {});
  const [stepError, setStepError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isValidSessionId(id) || !session) return <Navigate to="/" replace />;
  if (session.authentication && session.student) return <Navigate to={`/parent/${id}`} replace />;
  const sessionId = id;
  const activeSession = session;

  function draftFor(nextStep: WizardStep): SessionRecord {
    return {
      ...activeSession,
      studentProgress: Math.max(activeSession.studentProgress, nextStep),
      studentDraft: { personalityAnswers, psychometric, subjects, vibeAnswers },
    };
  }

  function persistAndGo(nextStep: WizardStep) {
    const updated = draftFor(nextStep);
    if (!saveSession(updated)) {
      setStepError("We could not save your progress on this device.");
      return;
    }
    setSession(updated);
    setStep(nextStep);
    setStepError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function nextStep() {
    if (step === 0) {
      const orderedAnswers = PERSONALITY_QUESTIONS.map((_, index) => personalityAnswers[index]);
      const result = studentAssessmentSchema.shape.personalityAnswers.safeParse(orderedAnswers);
      if (!result.success) {
        setStepError("Please answer all 16 personality questions.");
        return;
      }
    }
    if (step === 2) {
      const result = studentAssessmentSchema.shape.subjects.safeParse(subjects);
      if (!result.success) {
        setStepError(result.error.issues[0]?.message ?? "Please review your SPM subjects.");
        return;
      }
    }
    if (step === 3) {
      const result = studentAssessmentSchema.shape.vibeAnswers.safeParse(vibeAnswers);
      if (!result.success) {
        setStepError("Please complete all 6 Vibe Check questions.");
        return;
      }
    }
    persistAndGo((step + 1) as WizardStep);
  }

  async function authenticate(provider: AuthProvider, email: string | undefined, password: string | undefined, mode: StudentAuthMode) {
    setIsSubmitting(true);
    setStepError("");
    const rawAssessment = {
      personalityAnswers: PERSONALITY_QUESTIONS.map((_, index) => personalityAnswers[index]),
      psychometric,
      subjects,
      vibeAnswers,
      careerSuggestions: calculateCareerSuggestions(personalityAnswers),
    };
    const validated = studentAssessmentSchema.safeParse(rawAssessment);
    if (!validated.success) {
      setStepError(validated.error.issues[0]?.message ?? "Please review your assessment.");
      setIsSubmitting(false);
      setStep(Math.min(step, 3) as WizardStep);
      return;
    }

    const authDraft = createAuthenticationDraft({
      session: draftFor(4),
      assessment: validated.data,
      provider,
      mode,
      ...(email ? { requestedEmail: email } : {}),
    });
    // This synchronous write must happen before any auth request can navigate
    // away from the page. Passwords and provider tokens are never included.
    if (!cacheAuthenticationDraft(authDraft)) {
      setStepError("We could not secure your assessment before sign-in. Please check browser storage and try again.");
      setIsSubmitting(false);
      return;
    }

    try {
      const redirectTo = `${window.location.origin}/auth/callback?sessionId=${encodeURIComponent(sessionId)}${invitationToken ? `&token=${encodeURIComponent(invitationToken)}` : ""}`;
      if (provider === "password") {
        if (!email || !password) throw new Error("Enter a valid email and password.");
        const authenticated = await authenticateStudentAccount(email, password, mode, redirectTo);
        if (authenticated.confirmationRequired) {
          setStepError("Check your email to confirm the account. Your assessment is safely cached for when you return.");
          return;
        }
        const completed = await completeCachedAuthentication(sessionId, invitationToken, authenticated);
        setSession(completed);
        navigate(`/parent/${sessionId}`);
        return;
      }

      await beginStudentOAuth(provider, redirectTo);
    } catch (error) {
      setStepError(error instanceof Error ? error.message : "Authentication failed. Your assessment is still safe; please retry.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="min-h-[76vh] bg-cream px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold tracking-[0.2em] text-leaf uppercase">Student profile</p><h1 className="mt-2 font-display text-4xl font-bold text-forest sm:text-5xl">Build a match around you.</h1>{!activeSession.parent && <p className="mt-3 max-w-xl border-l-4 border-sun bg-white/80 px-4 py-3 text-sm leading-6 text-slate-700">This browser holds a temporary assessment draft only. It is not submitted or linked to the invitation until secure sign-in and token claim succeed.</p>}</div><Progress step={step} /></div>
        <motion.div key={step} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,35,29,0.08)] sm:p-10">
          {step === 0 && <div><StepHeading icon={<Sparkles />} eyebrow="Part 1 · Personality test" title="Personality and career compass" description="Answer all 16 prompts honestly. We’ll use the pattern—not any single answer—to surface possible career directions." /><div className="mt-8"><PersonalityTest answers={personalityAnswers} onAnswer={(index, value) => { setPersonalityAnswers((current) => { const next = [...current]; next[index] = value; return next; }); setStepError(""); }} /></div><WizardActions error={stepError} onNext={nextStep} /></div>}

          {step === 1 && <div><StepHeading icon={<BrainCircuit />} eyebrow="Part 2 · Psychometric profile" title="How do you naturally work?" description="Move each slider toward the description that feels more like you." /><div className="mt-8 grid gap-5 lg:grid-cols-2">{traitCopy.map((trait) => <label key={trait.key} className="border border-slate-200 bg-slate-50 p-5"><span className="flex items-center justify-between gap-4"><strong className="text-forest">{trait.label}</strong><output className="font-display text-2xl font-bold text-leaf">{psychometric[trait.key]}</output></span><input aria-label={trait.label} type="range" min="0" max="100" value={psychometric[trait.key]} onChange={(event) => setPsychometric((current) => ({ ...current, [trait.key]: Number(event.target.value) }))} className="mt-5 w-full accent-leaf" /><span className="mt-2 flex justify-between text-xs font-semibold text-slate-500"><span>{trait.low}</span><span>{trait.high}</span></span></label>)}</div><WizardActions error={stepError} onBack={() => setStep(0)} onNext={nextStep} /></div>}

          {step === 2 && <div><StepHeading icon={<BookOpen />} eyebrow="Part 3 · Academic record" title="Add your SPM snapshot." description="Search for every subject you took, then pair it with the grade you earned." /><div className="mt-8"><AcademicRecordForm rows={subjects} onChange={(next) => { setSubjects(next); setStepError(""); }} /></div><WizardActions error={stepError} onBack={() => setStep(1)} onNext={nextStep} /></div>}

          {step === 3 && <div><StepHeading icon={<HeartHandshake />} eyebrow="Part 4 · The Vibe Check Quiz" title="The Vibe Check Quiz" description="Six quick either-or choices reveal the environment where you’re most likely to thrive." /><div className="mt-8"><VibeCheckQuiz answers={vibeAnswers} onAnswer={(questionId: VibeQuestionId, value) => { setVibeAnswers((current) => ({ ...current, [questionId]: value })); setStepError(""); }} /></div><WizardActions error={stepError} onBack={() => setStep(2)} onNext={nextStep} nextLabel="Lock in profile" /></div>}

          {step === 4 && <div>{stepError && <p role="alert" className="mb-5 border-l-4 border-red-600 bg-red-50 p-4 font-semibold text-red-800">{stepError}</p>}<StudentAuthGate isSubmitting={isSubmitting} onAuthenticate={authenticate} /><button type="button" onClick={() => setStep(3)} className="mx-auto mt-6 flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-forest"><ArrowLeft className="size-4" /> Back to Vibe Check</button></div>}
        </motion.div>
      </div>
    </section>
  );
}

function Progress({ step }: { step: WizardStep }) {
  return <ol className="flex gap-2" aria-label={`Student journey step ${step + 1} of 5`}>{[0, 1, 2, 3, 4].map((item) => <li key={item} className={`h-2 w-10 sm:w-12 ${item <= step ? "bg-leaf" : "bg-slate-200"}`}><span className="sr-only">Step {item + 1}{item <= step ? " complete or active" : " upcoming"}</span></li>)}</ol>;
}

function StepHeading({ icon, eyebrow, title, description }: { icon: React.ReactNode; eyebrow: string; title: string; description: string }) {
  return <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-start"><span className="grid size-12 place-items-center bg-mint text-leaf [&>svg]:size-5">{icon}</span><div><p className="text-xs font-bold tracking-[0.16em] text-leaf uppercase">{eyebrow}</p><h2 className="mt-2 font-display text-4xl font-bold text-forest">{title}</h2><p className="mt-2 max-w-3xl leading-7 text-slate-600">{description}</p></div></div>;
}

function WizardActions({ error, onBack, onNext, nextLabel = "Next" }: { error: string; onBack?: () => void; onNext: () => void; nextLabel?: string }) {
  return <div className="mt-8 border-t border-slate-200 pt-6">{error && <p role="alert" className="mb-4 font-semibold text-red-700">{error}</p>}<div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">{onBack ? <button type="button" onClick={onBack} className="inline-flex items-center justify-center gap-2 border border-slate-300 px-5 py-3 font-bold text-slate-600 hover:border-forest hover:text-forest"><ArrowLeft className="size-4" /> Back</button> : <span />}<button type="button" onClick={onNext} className="inline-flex items-center justify-center gap-2 bg-forest px-6 py-3 font-bold text-white hover:bg-leaf">{nextLabel} {nextLabel === "Next" ? <ArrowRight className="size-4" /> : <CheckCircle2 className="size-4" />}</button></div></div>;
}
