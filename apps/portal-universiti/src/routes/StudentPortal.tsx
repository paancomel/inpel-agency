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
import { useLanguage } from "../lib/language";
import { authenticateStudentAccount, beginStudentOAuth, type StudentAuthMode } from "../lib/portal-data";
import { createStudentSessionRecord, isValidSessionId, readSession, saveSession, type SessionRecord } from "../lib/storage";
import { studentAssessmentSchema, type StudentAssessment } from "../lib/validation";

type WizardStep = 0 | 1 | 2 | 3 | 4;
type VibeDraft = NonNullable<SessionRecord["studentDraft"]>["vibeAnswers"];

const COPY = {
  ms: {
    profile: "Profil pelajar", hero: "Temui padanan yang benar-benar sesuai dengan diri anda.", draftNotice: "Pelayar ini hanya menyimpan draf penilaian sementara. Draf ini belum dihantar atau dipautkan kepada jemputan sehingga proses log masuk selamat dan pengesahan token berjaya.",
    saveError: "Kemajuan anda tidak dapat disimpan pada peranti ini.", personalityError: "Sila jawab kesemua 16 soalan personaliti.", subjectsError: "Sila semak semula subjek SPM anda.", vibeError: "Sila lengkapkan kesemua 6 soalan Vibe Check.", assessmentError: "Sila semak semula penilaian anda.", secureError: "Penilaian anda tidak dapat disimpan dengan selamat sebelum log masuk. Semak storan pelayar dan cuba lagi.", credentialsError: "Masukkan e-mel dan kata laluan yang sah.", confirmation: "Semak e-mel anda untuk mengesahkan akaun. Penilaian anda telah disimpan dengan selamat dan sedia apabila anda kembali.", authFailed: "Pengesahan gagal. Penilaian anda masih selamat; sila cuba lagi.",
    steps: [
      { eyebrow: "Bahagian 1 · Ujian personaliti", title: "Kompas personaliti dan kerjaya", description: "Jawab kesemua 16 soalan dengan jujur. Kami melihat corak keseluruhan—bukan satu jawapan sahaja—untuk mencadangkan hala tuju kerjaya yang mungkin sesuai." },
      { eyebrow: "Bahagian 2 · Profil psikometrik", title: "Bagaimanakah cara kerja semula jadi anda?", description: "Gerakkan setiap peluncur ke arah penerangan yang paling menggambarkan diri anda." },
      { eyebrow: "Bahagian 3 · Rekod akademik", title: "Masukkan ringkasan keputusan SPM anda.", description: "Cari setiap subjek yang anda ambil, kemudian pilih gred yang diperoleh." },
      { eyebrow: "Bahagian 4 · Kuiz Vibe Check", title: "Kuiz Vibe Check", description: "Enam pilihan ringkas membantu mengenal pasti persekitaran yang paling sesuai untuk anda berkembang." },
    ],
    traits: [{ key: "analytical", label: "Pemikiran analitikal", low: "Intuitif", high: "Berpandukan bukti" }, { key: "creative", label: "Ekspresi kreatif", low: "Tersusun", high: "Penuh imaginasi" }, { key: "social", label: "Tenaga sosial", low: "Berdikari", high: "Suka bekerjasama" }, { key: "practical", label: "Pembelajaran amali", low: "Konseptual", high: "Praktikal" }, { key: "enterprising", label: "Inisiatif", low: "Memberi sokongan", high: "Memimpin" }],
    next: "Seterusnya", back: "Kembali", lock: "Simpan profil", backToVibe: "Kembali ke Vibe Check", journey: "Langkah perjalanan pelajar", step: "Langkah", complete: "selesai atau sedang aktif", upcoming: "akan datang",
  },
  en: {
    profile: "Student profile", hero: "Build a match around you.", draftNotice: "This browser holds a temporary assessment draft only. It is not submitted or linked to the invitation until secure sign-in and token claim succeed.",
    saveError: "We could not save your progress on this device.", personalityError: "Please answer all 16 personality questions.", subjectsError: "Please review your SPM subjects.", vibeError: "Please complete all 6 Vibe Check questions.", assessmentError: "Please review your assessment.", secureError: "We could not secure your assessment before sign-in. Please check browser storage and try again.", credentialsError: "Enter a valid email and password.", confirmation: "Check your email to confirm the account. Your assessment is safely cached for when you return.", authFailed: "Authentication failed. Your assessment is still safe; please retry.",
    steps: [{ eyebrow: "Part 1 · Personality test", title: "Personality and career compass", description: "Answer all 16 prompts honestly. We’ll use the pattern—not any single answer—to surface possible career directions." }, { eyebrow: "Part 2 · Psychometric profile", title: "How do you naturally work?", description: "Move each slider toward the description that feels more like you." }, { eyebrow: "Part 3 · Academic record", title: "Add your SPM snapshot.", description: "Search for every subject you took, then pair it with the grade you earned." }, { eyebrow: "Part 4 · The Vibe Check Quiz", title: "The Vibe Check Quiz", description: "Six quick either-or choices reveal the environment where you’re most likely to thrive." }],
    traits: [{ key: "analytical", label: "Analytical thinking", low: "Intuitive", high: "Evidence-led" }, { key: "creative", label: "Creative expression", low: "Structured", high: "Imaginative" }, { key: "social", label: "People energy", low: "Independent", high: "Collaborative" }, { key: "practical", label: "Hands-on learning", low: "Conceptual", high: "Practical" }, { key: "enterprising", label: "Initiative", low: "Supportive", high: "Leading" }],
    next: "Next", back: "Back", lock: "Lock in profile", backToVibe: "Back to Vibe Check", journey: "Student journey step", step: "Step", complete: "complete or active", upcoming: "upcoming",
  },
  ta: {
    profile: "மாணவர் சுயவிவரம்", hero: "உங்களுக்கு ஏற்ற பொருத்தத்தை உருவாக்குங்கள்.", draftNotice: "இந்த உலாவியில் தற்காலிக மதிப்பீட்டு வரைவு மட்டுமே சேமிக்கப்படுகிறது. பாதுகாப்பான உள்நுழைவும் அழைப்புக் குறியீட்டின் உறுதிப்படுத்தலும் வெற்றிபெறும் வரை இது சமர்ப்பிக்கப்படவோ அழைப்புடன் இணைக்கப்படவோ மாட்டாது.",
    saveError: "இந்தச் சாதனத்தில் உங்கள் முன்னேற்றத்தைச் சேமிக்க முடியவில்லை.", personalityError: "16 ஆளுமைக் கேள்விகளுக்கும் பதிலளிக்கவும்.", subjectsError: "உங்கள் SPM பாடங்களை மீண்டும் சரிபார்க்கவும்.", vibeError: "6 Vibe Check கேள்விகளையும் முடிக்கவும்.", assessmentError: "உங்கள் மதிப்பீட்டை மீண்டும் சரிபார்க்கவும்.", secureError: "உள்நுழைவதற்கு முன் மதிப்பீட்டைப் பாதுகாப்பாகச் சேமிக்க முடியவில்லை. உலாவி சேமிப்பகத்தைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்.", credentialsError: "செல்லுபடியாகும் மின்னஞ்சலையும் கடவுச்சொல்லையும் உள்ளிடவும்.", confirmation: "கணக்கை உறுதிப்படுத்த உங்கள் மின்னஞ்சலைப் பார்க்கவும். நீங்கள் திரும்பும் வரை மதிப்பீடு பாதுகாப்பாகச் சேமிக்கப்பட்டிருக்கும்.", authFailed: "உள்நுழைவு தோல்வியடைந்தது. உங்கள் மதிப்பீடு பாதுகாப்பாக உள்ளது; மீண்டும் முயற்சிக்கவும்.",
    steps: [{ eyebrow: "பகுதி 1 · ஆளுமைத் தேர்வு", title: "ஆளுமை மற்றும் தொழில் திசைகாட்டி", description: "16 கேள்விகளுக்கும் நேர்மையாகப் பதிலளிக்கவும். ஒரே பதிலை அல்லாமல் ஒட்டுமொத்தப் போக்கைப் பார்த்து உங்களுக்கு ஏற்ற தொழில் திசைகளை முன்வைப்போம்." }, { eyebrow: "பகுதி 2 · உளவியல் அளவீட்டு சுயவிவரம்", title: "இயல்பாக நீங்கள் எப்படிப் பணிபுரிவீர்கள்?", description: "உங்களைச் சிறப்பாக விவரிக்கும் பக்கமாக ஒவ்வொரு நகர்த்தியையும் அமைக்கவும்." }, { eyebrow: "பகுதி 3 · கல்விப் பதிவு", title: "உங்கள் SPM முடிவுகளைச் சேர்க்கவும்.", description: "நீங்கள் எடுத்த ஒவ்வொரு பாடத்தையும் தேடி, பெற்ற தரத்தைத் தேர்ந்தெடுக்கவும்." }, { eyebrow: "பகுதி 4 · Vibe Check வினாடிவினா", title: "Vibe Check வினாடிவினா", description: "ஆறு விரைவான இருவழித் தேர்வுகள் நீங்கள் சிறப்பாக வளரக்கூடிய சூழலைக் கண்டறிய உதவும்." }],
    traits: [{ key: "analytical", label: "பகுப்பாய்வுச் சிந்தனை", low: "உள்ளுணர்வு", high: "ஆதாரத்தின் அடிப்படை" }, { key: "creative", label: "படைப்பாற்றல் வெளிப்பாடு", low: "கட்டமைப்புடன்", high: "கற்பனை வளம்" }, { key: "social", label: "சமூக ஆற்றல்", low: "சுயமாக", high: "ஒத்துழைப்புடன்" }, { key: "practical", label: "செய்முறைக் கற்றல்", low: "கருத்தியல்", high: "நடைமுறை" }, { key: "enterprising", label: "முன்முயற்சி", low: "ஆதரவளித்தல்", high: "வழிநடத்தல்" }],
    next: "அடுத்து", back: "பின்செல்", lock: "சுயவிவரத்தைச் சேமி", backToVibe: "Vibe Check-க்கு திரும்பு", journey: "மாணவர் பயணப் படி", step: "படி", complete: "முடிந்தது அல்லது செயலில் உள்ளது", upcoming: "அடுத்து வருகிறது",
  },
  "zh-CN": {
    profile: "学生资料", hero: "从真实的你出发，找到合适的选择。", draftNotice: "此浏览器目前只保存临时评估草稿。完成安全登录并成功验证邀请令牌前，草稿不会提交，也不会与邀请关联。",
    saveError: "无法在此设备上保存你的进度。", personalityError: "请回答全部 16 道性格问题。", subjectsError: "请检查你的 SPM 科目。", vibeError: "请完成全部 6 道 Vibe Check 问题。", assessmentError: "请检查你的评估内容。", secureError: "登录前无法安全保存评估。请检查浏览器存储设置后重试。", credentialsError: "请输入有效的邮箱和密码。", confirmation: "请查看邮箱并确认账号。你的评估已安全暂存，回来后可以继续。", authFailed: "验证失败。你的评估仍已安全保存，请重试。",
    steps: [{ eyebrow: "第 1 部分 · 性格测试", title: "性格与职业方向", description: "请诚实回答全部 16 道题。我们会根据整体倾向，而不是某一道答案，为你探索可能适合的职业方向。" }, { eyebrow: "第 2 部分 · 心理特质", title: "你习惯怎样学习和做事？", description: "把每个滑块移向更符合你的描述。" }, { eyebrow: "第 3 部分 · 学业记录", title: "添加你的 SPM 成绩概况。", description: "搜索你修读过的每门科目，再选择对应成绩。" }, { eyebrow: "第 4 部分 · Vibe Check 小测验", title: "Vibe Check 小测验", description: "六道快速二选一，帮你发现最能自在成长的环境。" }],
    traits: [{ key: "analytical", label: "分析思维", low: "凭直觉", high: "重证据" }, { key: "creative", label: "创意表达", low: "有条理", high: "富想象力" }, { key: "social", label: "社交能量", low: "独立", high: "协作" }, { key: "practical", label: "动手学习", low: "重概念", high: "重实践" }, { key: "enterprising", label: "主动性", low: "支持他人", high: "带领大家" }],
    next: "下一步", back: "返回", lock: "保存资料", backToVibe: "返回 Vibe Check", journey: "学生流程步骤", step: "步骤", complete: "已完成或进行中", upcoming: "尚未开始",
  },
} as const satisfies Record<string, { traits: ReadonlyArray<{ key: keyof StudentAssessment["psychometric"]; label: string; low: string; high: string }>; [key: string]: unknown }>;

const defaultPsychometric: StudentAssessment["psychometric"] = { analytical: 50, creative: 50, social: 50, practical: 50, enterprising: 50 };

export function StudentPortal() {
  const { language } = useLanguage();
  const copy = COPY[language];
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
      setStepError(copy.saveError);
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
        setStepError(copy.personalityError);
        return;
      }
    }
    if (step === 2) {
      const result = studentAssessmentSchema.shape.subjects.safeParse(subjects);
      if (!result.success) {
        setStepError(copy.subjectsError);
        return;
      }
    }
    if (step === 3) {
      const result = studentAssessmentSchema.shape.vibeAnswers.safeParse(vibeAnswers);
      if (!result.success) {
        setStepError(copy.vibeError);
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
      setStepError(copy.assessmentError);
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
      setStepError(copy.secureError);
      setIsSubmitting(false);
      return;
    }

    try {
      const redirectTo = `${window.location.origin}/auth/callback?sessionId=${encodeURIComponent(sessionId)}${invitationToken ? `&token=${encodeURIComponent(invitationToken)}` : ""}`;
      if (provider === "password") {
        if (!email || !password) throw new Error(copy.credentialsError);
        const authenticated = await authenticateStudentAccount(email, password, mode, redirectTo);
        if (authenticated.confirmationRequired) {
          setStepError(copy.confirmation);
          return;
        }
        const completed = await completeCachedAuthentication(sessionId, invitationToken, authenticated);
        setSession(completed);
        navigate(`/parent/${sessionId}`);
        return;
      }

      await beginStudentOAuth(provider, redirectTo);
    } catch (error) {
      setStepError(error instanceof Error && error.message === copy.credentialsError ? error.message : copy.authFailed);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="min-h-[76vh] bg-cream px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold tracking-[0.2em] text-leaf uppercase">{copy.profile}</p><h1 className="mt-2 font-display text-4xl font-bold text-forest sm:text-5xl">{copy.hero}</h1>{!activeSession.parent && <p className="mt-3 max-w-xl border-l-4 border-sun bg-white/80 px-4 py-3 text-sm leading-6 text-slate-700">{copy.draftNotice}</p>}</div><Progress step={step} copy={copy} /></div>
        <motion.div key={step} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,35,29,0.08)] sm:p-10">
          {step === 0 && <div><StepHeading icon={<Sparkles />} {...copy.steps[0]} /><div className="mt-8"><PersonalityTest answers={personalityAnswers} onAnswer={(index, value) => { setPersonalityAnswers((current) => { const next = [...current]; next[index] = value; return next; }); setStepError(""); }} /></div><WizardActions error={stepError} onNext={nextStep} copy={copy} /></div>}

          {step === 1 && <div><StepHeading icon={<BrainCircuit />} {...copy.steps[1]} /><div className="mt-8 grid gap-5 lg:grid-cols-2">{copy.traits.map((trait) => <label key={trait.key} className="border border-slate-200 bg-slate-50 p-5"><span className="flex items-center justify-between gap-4"><strong className="text-forest">{trait.label}</strong><output className="font-display text-2xl font-bold text-leaf">{psychometric[trait.key]}</output></span><input aria-label={trait.label} type="range" min="0" max="100" value={psychometric[trait.key]} onChange={(event) => setPsychometric((current) => ({ ...current, [trait.key]: Number(event.target.value) }))} className="mt-5 w-full accent-leaf" /><span className="mt-2 flex justify-between text-xs font-semibold text-slate-500"><span>{trait.low}</span><span>{trait.high}</span></span></label>)}</div><WizardActions error={stepError} onBack={() => setStep(0)} onNext={nextStep} copy={copy} /></div>}

          {step === 2 && <div><StepHeading icon={<BookOpen />} {...copy.steps[2]} /><div className="mt-8"><AcademicRecordForm rows={subjects} onChange={(next) => { setSubjects(next); setStepError(""); }} /></div><WizardActions error={stepError} onBack={() => setStep(1)} onNext={nextStep} copy={copy} /></div>}

          {step === 3 && <div><StepHeading icon={<HeartHandshake />} {...copy.steps[3]} /><div className="mt-8"><VibeCheckQuiz answers={vibeAnswers} onAnswer={(questionId: VibeQuestionId, value) => { setVibeAnswers((current) => ({ ...current, [questionId]: value })); setStepError(""); }} /></div><WizardActions error={stepError} onBack={() => setStep(2)} onNext={nextStep} nextLabel={copy.lock} copy={copy} /></div>}

          {step === 4 && <div>{stepError && <p role="alert" className="mb-5 border-l-4 border-red-600 bg-red-50 p-4 font-semibold text-red-800">{stepError}</p>}<StudentAuthGate isSubmitting={isSubmitting} onAuthenticate={authenticate} /><button type="button" onClick={() => setStep(3)} className="mx-auto mt-6 flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-forest"><ArrowLeft className="size-4" /> {copy.backToVibe}</button></div>}
        </motion.div>
      </div>
    </section>
  );
}

function Progress({ step, copy }: { step: WizardStep; copy: (typeof COPY)[keyof typeof COPY] }) {
  return <ol className="flex gap-2" aria-label={`${copy.journey} ${step + 1} / 5`}>{[0, 1, 2, 3, 4].map((item) => <li key={item} className={`h-2 w-10 sm:w-12 ${item <= step ? "bg-leaf" : "bg-slate-200"}`}><span className="sr-only">{copy.step} {item + 1} {item <= step ? copy.complete : copy.upcoming}</span></li>)}</ol>;
}

function StepHeading({ icon, eyebrow, title, description }: { icon: React.ReactNode; eyebrow: string; title: string; description: string }) {
  return <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-start"><span className="grid size-12 place-items-center bg-mint text-leaf [&>svg]:size-5">{icon}</span><div><p className="text-xs font-bold tracking-[0.16em] text-leaf uppercase">{eyebrow}</p><h2 className="mt-2 font-display text-4xl font-bold text-forest">{title}</h2><p className="mt-2 max-w-3xl leading-7 text-slate-600">{description}</p></div></div>;
}

function WizardActions({ error, onBack, onNext, copy, nextLabel = copy.next }: { error: string; onBack?: () => void; onNext: () => void; copy: (typeof COPY)[keyof typeof COPY]; nextLabel?: string }) {
  return <div className="mt-8 border-t border-slate-200 pt-6">{error && <p role="alert" className="mb-4 font-semibold text-red-700">{error}</p>}<div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">{onBack ? <button type="button" onClick={onBack} className="inline-flex items-center justify-center gap-2 border border-slate-300 px-5 py-3 font-bold text-slate-600 hover:border-forest hover:text-forest"><ArrowLeft className="size-4" /> {copy.back}</button> : <span />}<button type="button" onClick={onNext} className="inline-flex items-center justify-center gap-2 bg-forest px-6 py-3 font-bold text-white hover:bg-leaf">{nextLabel} {nextLabel === copy.next ? <ArrowRight className="size-4" /> : <CheckCircle2 className="size-4" />}</button></div></div>;
}
