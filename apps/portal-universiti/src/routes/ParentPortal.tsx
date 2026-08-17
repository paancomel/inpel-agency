import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Clipboard, Mail, ShieldX, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import { useForm, type UseFormRegister } from "react-hook-form";
import { Link } from "react-router-dom";

import { ParentAuthGate } from "../components/ParentAuthGate";
import { HOUSEHOLD_INCOME_OPTIONS, MALAYSIA_LOCATIONS, PARENT_PREFERENCE_OPTIONS } from "../lib/assessment-data";
import { clearParentDraft, cacheParentDraft, createParentDraft, readParentDraft } from "../lib/parent-draft";
import { authenticateParentAccount, beginStudentOAuth, getAuthenticatedStudent, revokeParentStudentInvitation, syncParentSession, type AuthProvider, type StudentAuthMode } from "../lib/portal-data";
import { createSessionRecord, saveSession, type SessionRecord } from "../lib/storage";
import { parentPrioritiesSchema, type ParentPriorities, type ParentProfile } from "../lib/validation";
import { t, useLanguage } from "../lib/language";

export const GUARDIAN_CONSENT_DECLARATION = "I declare that I am the student's parent or legal guardian and consent to the student using INPEL and submitting their information for university matching and related reports.";

const preferenceQuestions = [
  { key: "campusVibe", question: "What kind of campus vibe are we looking for?", options: PARENT_PREFERENCE_OPTIONS.campusVibe },
  { key: "campusConcern", question: "What keeps you up at night when thinking about their campus life?", options: PARENT_PREFERENCE_OPTIONS.campusConcern },
  { key: "ultimateWin", question: "At the end of this journey, what is the ultimate win for them?", options: PARENT_PREFERENCE_OPTIONS.ultimateWin },
  { key: "independence", question: "How independent is your kid right now?", options: PARENT_PREFERENCE_OPTIONS.independence },
] as const;

export function ParentPortal() {
  const { language } = useLanguage();
  const [session, setSession] = useState<SessionRecord | null>(null);
  const [invitationToken, setInvitationToken] = useState<string | null>(null);
  const [parentEmail, setParentEmail] = useState<string | null>(null);
  const [parentDraft] = useState(() => readParentDraft());
  const [pendingPriorities, setPendingPriorities] = useState<ParentPriorities | null>(() => parentDraft?.priorities ?? null);
  const [authError, setAuthError] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isCreatingInvitation, setIsCreatingInvitation] = useState(false);
  const [copied, setCopied] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  const [isRevoking, setIsRevoking] = useState(false);
  const [isRevoked, setIsRevoked] = useState(false);
  const [guardianConsentConfirmed, setGuardianConsentConfirmed] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ParentPriorities>({
    resolver: zodResolver(parentPrioritiesSchema),
    defaultValues: parentDraft?.priorities ?? { studentEmail: "", preferences: {} },
  });

  useEffect(() => {
    let isActive = true;
    void getAuthenticatedStudent().then(
      (account) => {
        if (!isActive) return;
        setParentEmail(account.email);
      },
      () => undefined,
    );
    return () => { isActive = false; };
  }, []);

  async function authenticateParent(provider: AuthProvider, email: string | undefined, password: string | undefined, mode: StudentAuthMode) {
    setIsAuthenticating(true);
    setAuthError("");
    try {
      if (provider !== "password") {
        await beginStudentOAuth(provider, `${window.location.origin}/auth/callback`);
        return;
      }
      if (!email || !password) throw new Error("Enter a valid email and password.");
      const emailRedirectTo = mode === "signup" ? `${window.location.origin}/auth/callback` : undefined;
      const account = await authenticateParentAccount(email, password, mode, emailRedirectTo);
      if (account.confirmationRequired || account.source !== "cloud" || !account.userId) {
        setAuthError("Confirm your parent email, then return here to finish creating the invitation.");
        return;
      }
      setParentEmail(account.email);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Parent authentication failed.");
    } finally {
      setIsAuthenticating(false);
    }
  }

  const onSubmit = handleSubmit((priorities) => {
    if (!cacheParentDraft(createParentDraft(priorities))) {
      setSyncMessage("We could not save this family draft in your browser. Please check browser storage and try again.");
      return;
    }
    setPendingPriorities(priorities);
    setSyncMessage("");
  });

  async function createInvitation() {
    if (!parentEmail || !pendingPriorities) {
      setAuthError("Confirm the parent account before creating an invitation.");
      return;
    }
    setIsCreatingInvitation(true);
    try {
      const profile: ParentProfile = {
        ...pendingPriorities,
        email: parentEmail,
        guardianConsentConfirmed: pendingPriorities.studentAgeBand === "15-17" ? guardianConsentConfirmed : false,
      };
      const result = await syncParentSession(profile);
      if (!result.sessionId || !result.invitationToken) throw new Error("The invitation service returned an incomplete response.");
      const nextSession = createSessionRecord({ ...profile, email: parentEmail }, result.sessionId);
      if (!saveSession(nextSession)) {
        setSyncMessage("Your invitation is secure, but this browser could not retain the local draft. Copy the link now before leaving this page.");
      }
      setSession(nextSession);
      setInvitationToken(result.invitationToken);
      setIsRevoked(false);
      setSyncMessage("Securely created. The invitation is ready to share.");
      clearParentDraft();
    } catch (error) {
      setSession(null);
      setInvitationToken(null);
      setSyncMessage(error instanceof Error ? error.message : "The invitation was not created securely. Please reconnect to Supabase and try again.");
    } finally {
      setIsCreatingInvitation(false);
    }
  }

  const shareUrl = session && invitationToken ? `${window.location.origin}/student/${session.id}?token=${encodeURIComponent(invitationToken)}` : "";

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  async function revokeInvitation() {
    if (!session) return;
    setIsRevoking(true);
    try {
      await revokeParentStudentInvitation(session.id);
      setIsRevoked(true);
      setSyncMessage("Invitation revoked. The shared link can no longer be claimed.");
    } catch (error) {
      setSyncMessage(error instanceof Error ? error.message : "The invitation could not be revoked. Please try again.");
    } finally {
      setIsRevoking(false);
    }
  }

  if (session && invitationToken) return <InvitationReady session={session} shareUrl={shareUrl} copied={copied} syncMessage={syncMessage} onCopy={copyLink} invitationToken={invitationToken} isRevoked={isRevoked} isRevoking={isRevoking} onRevoke={revokeInvitation} />;

  if (pendingPriorities) {
    if (!parentEmail) return <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20"><ParentAuthGate isSubmitting={isAuthenticating} onAuthenticate={authenticateParent} />{authError && <p className="mx-auto mt-5 max-w-xl border-l-4 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">{authError}</p>}</section>;
    return <ParentAccountConfirmation email={parentEmail} isMinor={pendingPriorities.studentAgeBand === "15-17"} guardianConsentConfirmed={guardianConsentConfirmed} onGuardianConsentChange={setGuardianConsentConfirmed} isSubmitting={isCreatingInvitation} onContinue={createInvitation} onBack={() => setPendingPriorities(null)} />;
  }

  return (
    <section className="relative overflow-hidden px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <div className="pointer-events-none absolute top-10 right-[-8rem] size-80 rounded-full border-[3rem] border-mint/70" />
      <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div className="pt-4 lg:sticky lg:top-36 lg:pt-8">
          <div className="inline-flex items-center gap-2 bg-mint px-3 py-2 text-xs font-bold tracking-[0.14em] text-forest uppercase"><Sparkles className="size-4 text-leaf" aria-hidden="true" /> {t(language, { ms: "Padanan untuk keluarga", en: "Matching for your family", ta: "உங்கள் குடும்பத்திற்கான பொருத்தம்", "zh-CN": "为家庭寻找合适选择" })}</div>
          <h1 className="mt-6 max-w-xl font-display text-5xl leading-[1.04] font-bold tracking-[-0.04em] text-forest sm:text-6xl">{t(language, { ms: "Jom cari universiti yang sesuai.", en: "Let’s find a university that fits.", ta: "உங்களுக்குப் பொருத்தமான பல்கலைக்கழகத்தைப் பார்ப்போம்.", "zh-Hans": "一起找一所适合的大学。" })}</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">Start with the realities and hopes that shape your family’s decision. We’ll pair them with your student’s strengths.</p>
          <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-slate-300 pt-6">
            <Stat label={t(language, { ms: "Masa", en: "Time", ta: "நேரம்", "zh-Hans": "时间" })} value={t(language, { ms: "4 minit", en: "4 min", ta: "4 நிமிடங்கள்", "zh-Hans": "4分钟" })} /><Stat label={t(language, { ms: "Soalan parent", en: "Parent questions", ta: "பெற்றோர் கேள்விகள்", "zh-Hans": "家长问题" })} value="7" /><Stat label={t(language, { ms: "Selepas ini", en: "Up next", ta: "அடுத்து", "zh-Hans": "下一步" })} value={t(language, { ms: "Pelajar", en: "Student", ta: "மாணவர்", "zh-Hans": "学生" })} />
          </dl>
        </div>

        <form onSubmit={(event) => { void onSubmit(event); }} noValidate className="border border-emerald-900/10 bg-[#fafdff] p-6 shadow-[0_24px_70px_rgba(18,63,50,0.08)] sm:p-10">
          <div className="flex items-baseline justify-between border-b border-slate-200 pb-5">
            <div><p className="text-xs font-bold tracking-[0.18em] text-leaf uppercase">{t(language, { ms: "Profil keluarga", en: "Family profile", ta: "குடும்ப விவரம்", "zh-Hans": "家庭资料" })}</p><h2 className="mt-2 font-display text-3xl font-bold text-forest">{t(language, { ms: "Apa yang penting untuk keluarga?", en: "What matters to your family?", ta: "உங்கள் குடும்பத்திற்கு முக்கியமானது என்ன?", "zh-Hans": "什么对您的家庭最重要？" })}</h2></div>
            <span className="font-display text-2xl text-slate-300">01</span>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <Field id="location" label={t(language, { ms: "Nak belajar di kawasan mana?", en: "Where would they like to study?", ta: "எங்கு படிக்க விரும்புகிறார்கள்?", "zh-Hans": "想在哪个地区学习？" })} error={errors.location?.message}>
              <select {...register("location")} id="location" className="field-control"><option value="">{t(language, { ms: "Pilih kawasan", en: "Choose an area", ta: "ஒரு இடத்தைத் தேர்ந்தெடுக்கவும்", "zh-Hans": "选择地区" })}</option>{MALAYSIA_LOCATIONS.map((location) => <option key={location}>{location}</option>)}</select>
            </Field>
            <Field id="income" label={t(language, { ms: "Bajet keluarga sebulan?", en: "What is the family’s monthly budget?", ta: "குடும்பத்தின் மாதாந்திர பட்ஜெட் எவ்வளவு?", "zh-Hans": "家庭每月预算是多少？" })} error={errors.income?.message}>
              <select {...register("income")} id="income" className="field-control"><option value="">{t(language, { ms: "Pilih julat", en: "Choose a range", ta: "ஒரு வரம்பைத் தேர்ந்தெடுக்கவும்", "zh-Hans": "选择范围" })}</option>{HOUSEHOLD_INCOME_OPTIONS.map((income) => <option key={income}>{income}</option>)}</select>
            </Field>
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <Field id="studentEmail" label={t(language, { ms: "E-mel pelajar", en: "Student email", ta: "மாணவர் மின்னஞ்சல்", "zh-Hans": "学生邮箱" })} error={errors.studentEmail?.message}><input {...register("studentEmail")} id="studentEmail" type="email" autoComplete="email" placeholder="student@example.com" className="field-control" /></Field>
            <Field id="studentAgeBand" label="Student age group" error={errors.studentAgeBand?.message}>
              <select {...register("studentAgeBand")} id="studentAgeBand" className="field-control"><option value="">Choose an age group</option><option value="15-17">15 to 17 years old</option><option value="18+">18 years old or above</option></select>
            </Field>
          </div>

          <section className="mt-10 border-t border-slate-200 pt-8" aria-labelledby="parental-preferences-title">
            <p className="text-xs font-bold tracking-[0.18em] text-leaf uppercase">{t(language, { ms: "Bahagian 2", en: "Part 2", ta: "பகுதி 2", "zh-Hans": "第 2 部分" })}</p>
            <h3 id="parental-preferences-title" className="mt-2 font-display text-3xl font-bold text-forest">{t(language, { ms: "Mari faham keutamaan keluarga.", en: "Let’s understand your family’s priorities.", ta: "உங்கள் குடும்பத்தின் முன்னுரிமைகளைப் புரிந்துகொள்வோம்.", "zh-Hans": "一起了解家庭的优先事项。" })}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">{t(language, { ms: "Pilih jawapan yang paling dekat dengan keadaan sekarang. Tiada jawapan salah.", en: "Choose what feels closest to your situation today. There is no wrong answer.", ta: "இன்றைய உங்கள் நிலைக்கு மிகவும் பொருந்துவதைத் தேர்ந்தெடுக்கவும். தவறான பதில் எதுவும் இல்லை.", "zh-Hans": "选择最贴近您目前情况的答案。没有标准答案。" })}</p>
            <div className="mt-7 space-y-8">
              {preferenceQuestions.map((item, index) => (
                <PreferenceQuestion key={item.key} index={index + 1} item={item} register={register} error={errors.preferences?.[item.key]?.message} />
              ))}
            </div>
          </section>

          {syncMessage && <p className="mt-6 border-l-4 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">{syncMessage}</p>}
          <button disabled={isSubmitting} type="submit" className="mt-8 flex w-full items-center justify-center gap-2 bg-forest px-6 py-4 font-bold text-white transition hover:bg-leaf disabled:cursor-wait disabled:opacity-60">{isSubmitting ? "Saving your answers…" : "Continue to secure your invitation"}</button>
          <p className="mt-4 text-center text-xs leading-5 text-slate-500">Your answers stay in this browser until you secure the invitation with a parent account.</p>
        </form>
      </div>
    </section>
  );
}

function ParentAccountConfirmation({ email, isMinor, guardianConsentConfirmed, onGuardianConsentChange, isSubmitting, onContinue, onBack }: { email: string; isMinor: boolean; guardianConsentConfirmed: boolean; onGuardianConsentChange: (confirmed: boolean) => void; isSubmitting: boolean; onContinue: () => Promise<void>; onBack: () => void }) {
  return (
    <section className="grid min-h-[65vh] place-items-center bg-cream px-4 py-12 sm:px-6">
      <div className="w-full max-w-xl border border-emerald-900/10 bg-[#fafdff] p-7 shadow-[0_24px_70px_rgba(18,63,50,0.08)] sm:p-10">
        <p className="text-xs font-bold tracking-[0.16em] text-leaf uppercase">Family priorities complete</p>
        <h1 className="mt-2 font-display text-4xl font-bold text-forest">Confirm this account{isMinor ? " and your consent" : ""}.</h1>
        <p className="mt-4 leading-7 text-slate-600">Your answers are ready. Signing in identifies the account creating this invitation; INPEL does not independently verify the account holder's identity or relationship to the student.</p>
        <p className="mt-6 border border-slate-200 bg-white px-4 py-3 font-bold text-forest">{email}</p>
        {isMinor && <label className="mt-6 flex cursor-pointer items-start gap-3 border border-slate-300 bg-white p-4 text-sm leading-6 text-slate-700"><input type="checkbox" checked={guardianConsentConfirmed} onChange={(event) => onGuardianConsentChange(event.target.checked)} className="mt-1 size-4 shrink-0 accent-forest" /><span>{GUARDIAN_CONSENT_DECLARATION} I have read the <Link className="font-semibold underline" to="/legal/terms">Terms &amp; Conditions</Link> and <Link className="font-semibold underline" to="/legal/privacy">Privacy Policy</Link>.</span></label>}
        {isMinor && !guardianConsentConfirmed && <p className="mt-2 text-sm font-semibold text-red-700">Consent is required before a student aged 15 to 17 can be invited.</p>}
        <button type="button" disabled={isSubmitting || (isMinor && !guardianConsentConfirmed)} onClick={() => { void onContinue(); }} className="mt-6 w-full bg-forest px-6 py-4 font-bold text-white hover:bg-leaf disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? "Creating invitation…" : isMinor ? "Record consent and create invitation" : "Confirm account and create invitation"}</button>
        <button type="button" disabled={isSubmitting} onClick={onBack} className="mt-4 w-full px-6 py-3 text-sm font-bold text-slate-600 hover:text-forest">Review family answers</button>
      </div>
    </section>
  );
}

function PreferenceQuestion({ index, item, register, error }: { index: number; item: (typeof preferenceQuestions)[number]; register: UseFormRegister<ParentPriorities>; error: string | undefined }) {
  return (
    <fieldset>
      <legend className="text-base font-bold leading-6 text-forest"><span className="mr-2 text-leaf">Q{index}.</span>{item.question}</legend>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {item.options.map((option) => <label key={option} className="cursor-pointer"><input {...register(`preferences.${item.key}`)} type="radio" value={option} className="peer sr-only" /><span className="flex h-full items-center border border-slate-300 bg-white px-4 py-3 text-sm font-semibold leading-5 text-slate-600 transition peer-checked:border-forest peer-checked:bg-forest peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-leaf">{option}</span></label>)}
      </div>
      {error && <p className="mt-2 text-sm font-semibold text-red-700" role="alert">{error}</p>}
    </fieldset>
  );
}

function InvitationReady({ session, shareUrl, copied, syncMessage, onCopy, invitationToken, isRevoked, isRevoking, onRevoke }: { session: SessionRecord; shareUrl: string; copied: boolean; syncMessage: string; onCopy: () => Promise<void>; invitationToken: string; isRevoked: boolean; isRevoking: boolean; onRevoke: () => Promise<void> }) {
  return (
    <section className="mx-auto grid min-h-[72vh] max-w-5xl place-items-center px-4 py-16 sm:px-6"><motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full border border-emerald-900/10 bg-[#fafdff] p-7 shadow-[0_24px_70px_rgba(18,63,50,0.10)] sm:p-10 lg:p-12">
      <span className="mb-6 grid size-14 place-items-center rounded-full bg-mint text-leaf"><Check className="size-7" aria-hidden="true" /></span>
      <p className="text-xs font-bold tracking-[0.2em] text-leaf uppercase">Parent profile complete</p><h1 className="mt-3 max-w-xl font-display text-4xl font-bold tracking-tight text-forest sm:text-5xl">Your invitation is ready.</h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">Send this private link to your student. Their assessment will be paired with your family priorities.</p>
      <div className="mt-8 flex flex-col border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:gap-3"><code className="min-w-0 flex-1 truncate px-2 py-2 text-sm text-slate-600">{shareUrl}</code><button type="button" onClick={() => { void onCopy(); }} className="inline-flex items-center justify-center gap-2 bg-forest px-5 py-3 text-sm font-bold text-white hover:bg-leaf">{copied ? <Check className="size-4" /> : <Clipboard className="size-4" />} {copied ? "Copied" : "Copy link"}</button></div>
      <p className="mt-3 text-sm text-slate-500" role="status">{syncMessage}</p>
      <div className="mt-8 flex flex-wrap items-center gap-5"><Link to={`/email-notification/${session.id}?token=${encodeURIComponent(invitationToken)}`} className="inline-flex items-center gap-2 border-b-2 border-sun pb-1 font-bold text-forest hover:text-leaf"><Mail className="size-4" aria-hidden="true" /> Preview email invitation</Link><button type="button" disabled={isRevoked || isRevoking} onClick={() => { void onRevoke(); }} className="inline-flex items-center gap-2 border-b-2 border-red-300 pb-1 text-sm font-bold text-red-800 hover:text-red-950 disabled:cursor-not-allowed disabled:opacity-60"><ShieldX className="size-4" /> {isRevoked ? "Invitation revoked" : isRevoking ? "Revoking…" : "Revoke invitation"}</button></div>
    </motion.div></section>
  );
}

function Field({ id, label, error, children }: { id: string; label: string; error: string | undefined; children: ReactNode }) {
  return <div><label htmlFor={id} className="mb-2 block text-sm font-bold text-forest">{label}</label>{children}{error && <p className="mt-2 text-sm font-semibold text-red-700" role="alert">{error}</p>}</div>;
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs font-bold text-slate-500 uppercase">{label}</dt><dd className="mt-1 font-display text-2xl font-bold text-forest">{value}</dd></div>;
}
