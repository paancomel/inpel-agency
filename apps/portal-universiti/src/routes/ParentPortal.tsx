import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Clipboard, Mail, ShieldX, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import { useForm, type UseFormRegister } from "react-hook-form";
import { Link } from "react-router-dom";

import { ParentAuthGate } from "../components/ParentAuthGate";
import { HOUSEHOLD_INCOME_OPTIONS, MALAYSIA_LOCATIONS, PARENT_PREFERENCE_OPTIONS } from "../lib/assessment-data";
import { authenticateParentAccount, getAuthenticatedStudent, revokeParentStudentInvitation, syncParentSession, type StudentAuthMode } from "../lib/portal-data";
import { createSessionRecord, saveSession, type SessionRecord } from "../lib/storage";
import { parentProfileSchema, type ParentProfile } from "../lib/validation";

const preferenceQuestions = [
  { key: "campusVibe", question: "What kind of campus vibe are we looking for?", options: PARENT_PREFERENCE_OPTIONS.campusVibe },
  { key: "campusConcern", question: "What keeps you up at night when thinking about their campus life?", options: PARENT_PREFERENCE_OPTIONS.campusConcern },
  { key: "ultimateWin", question: "At the end of this journey, what is the ultimate win for them?", options: PARENT_PREFERENCE_OPTIONS.ultimateWin },
  { key: "independence", question: "How independent is your kid right now?", options: PARENT_PREFERENCE_OPTIONS.independence },
] as const;

export function ParentPortal() {
  const [session, setSession] = useState<SessionRecord | null>(null);
  const [invitationToken, setInvitationToken] = useState<string | null>(null);
  const [parentEmail, setParentEmail] = useState<string | null>(null);
  const [authError, setAuthError] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  const [isRevoking, setIsRevoking] = useState(false);
  const [isRevoked, setIsRevoked] = useState(false);
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<ParentProfile>({
    resolver: zodResolver(parentProfileSchema),
    defaultValues: { email: "", studentEmail: "", preferences: {} },
  });

  useEffect(() => {
    let isActive = true;
    void getAuthenticatedStudent().then(
      (account) => {
        if (!isActive) return;
        setParentEmail(account.email);
        setValue("email", account.email, { shouldValidate: true });
      },
      () => undefined,
    );
    return () => { isActive = false; };
  }, [setValue]);

  async function authenticateParent(email: string, password: string, mode: StudentAuthMode) {
    setIsAuthenticating(true);
    setAuthError("");
    try {
      const emailRedirectTo = mode === "signup" ? `${window.location.origin}/auth/callback` : undefined;
      const account = await authenticateParentAccount(email, password, mode, emailRedirectTo);
      if (account.confirmationRequired || account.source !== "cloud" || !account.userId) {
        throw new Error("Confirm your parent email, then return here to finish creating the invitation.");
      }
      setParentEmail(account.email);
      setValue("email", account.email, { shouldValidate: true });
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Parent authentication failed.");
    } finally {
      setIsAuthenticating(false);
    }
  }

  const onSubmit = handleSubmit(async (profile) => {
    if (!parentEmail) {
      setAuthError("Authenticate as a parent before creating an invitation.");
      return;
    }
    try {
      const result = await syncParentSession({ ...profile, email: parentEmail });
      if (!result.sessionId || !result.invitationToken) throw new Error("The invitation service returned an incomplete response.");
      const nextSession = createSessionRecord({ ...profile, email: parentEmail }, result.sessionId);
      if (!saveSession(nextSession)) {
        setSyncMessage("Your invitation is secure, but this browser could not retain the local draft. Copy the link now before leaving this page.");
      }
      setSession(nextSession);
      setInvitationToken(result.invitationToken);
      setIsRevoked(false);
      setSyncMessage("Securely created. The invitation is ready to share.");
    } catch (error) {
      setSession(null);
      setInvitationToken(null);
      setSyncMessage(error instanceof Error ? error.message : "The invitation was not created securely. Please reconnect to Supabase and try again.");
    }
  });

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

  if (!parentEmail) return <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20"><ParentAuthGate isSubmitting={isAuthenticating} onAuthenticate={authenticateParent} />{authError && <p className="mx-auto mt-5 max-w-xl border-l-4 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">{authError}</p>}</section>;

  return (
    <section className="relative overflow-hidden px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <div className="pointer-events-none absolute top-10 right-[-8rem] size-80 rounded-full border-[3rem] border-mint/70" />
      <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div className="pt-4 lg:sticky lg:top-36 lg:pt-8">
          <div className="inline-flex items-center gap-2 bg-mint px-3 py-2 text-xs font-bold tracking-[0.14em] text-forest uppercase"><Sparkles className="size-4 text-leaf" aria-hidden="true" /> Parent-guided matching</div>
          <h1 className="mt-6 max-w-xl font-display text-5xl leading-[1.04] font-bold tracking-[-0.04em] text-forest sm:text-6xl">Find the right university, together.</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">Start with the realities and hopes that shape your family’s decision. We’ll pair them with your student’s strengths.</p>
          <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-slate-300 pt-6">
            <Stat label="Time" value="4 min" /><Stat label="Parent inputs" value="7" /><Stat label="Next step" value="Student" />
          </dl>
        </div>

        <form onSubmit={(event) => { void onSubmit(event); }} noValidate className="border border-emerald-900/10 bg-[#fafdff] p-6 shadow-[0_24px_70px_rgba(18,63,50,0.08)] sm:p-10">
          <div className="flex items-baseline justify-between border-b border-slate-200 pb-5">
            <div><p className="text-xs font-bold tracking-[0.18em] text-leaf uppercase">Family profile</p><h2 className="mt-2 font-display text-3xl font-bold text-forest">Family priorities</h2></div>
            <span className="font-display text-2xl text-slate-300">01</span>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <Field id="location" label="Preferred study location" error={errors.location?.message}>
              <select {...register("location")} id="location" className="field-control"><option value="">Select a location</option>{MALAYSIA_LOCATIONS.map((location) => <option key={location}>{location}</option>)}</select>
            </Field>
            <Field id="income" label="Monthly household income" error={errors.income?.message}>
              <select {...register("income")} id="income" className="field-control"><option value="">Select an income range</option>{HOUSEHOLD_INCOME_OPTIONS.map((income) => <option key={income}>{income}</option>)}</select>
            </Field>
          </div>
          <div className="mt-6"><Field id="email" label="Parent email" error={errors.email?.message}><input {...register("email")} id="email" type="email" readOnly aria-readonly="true" className="field-control bg-slate-100" /></Field><p className="mt-2 text-xs text-slate-500">This is taken from the signed-in parent account and cannot be changed here.</p></div>
          <div className="mt-6"><Field id="studentEmail" label="Student email" error={errors.studentEmail?.message}><input {...register("studentEmail")} id="studentEmail" type="email" autoComplete="email" placeholder="student@example.com" className="field-control" /></Field></div>

          <section className="mt-10 border-t border-slate-200 pt-8" aria-labelledby="parental-preferences-title">
            <p className="text-xs font-bold tracking-[0.18em] text-leaf uppercase">Part 2</p>
            <h3 id="parental-preferences-title" className="mt-2 font-display text-3xl font-bold text-forest">Parental preferences</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">Choose the answer that best reflects your family today. There are no wrong choices.</p>
            <div className="mt-7 space-y-8">
              {preferenceQuestions.map((item, index) => (
                <PreferenceQuestion key={item.key} index={index + 1} item={item} register={register} error={errors.preferences?.[item.key]?.message} />
              ))}
            </div>
          </section>

          {syncMessage && <p className="mt-6 border-l-4 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">{syncMessage}</p>}
          <button disabled={isSubmitting} type="submit" className="mt-8 flex w-full items-center justify-center gap-2 bg-forest px-6 py-4 font-bold text-white transition hover:bg-leaf disabled:cursor-wait disabled:opacity-60">{isSubmitting ? "Preparing invitation…" : "Generate Student Link"}</button>
          <p className="mt-4 text-center text-xs leading-5 text-slate-500">Your answers are used only to create this university match session.</p>
        </form>
      </div>
    </section>
  );
}

function PreferenceQuestion({ index, item, register, error }: { index: number; item: (typeof preferenceQuestions)[number]; register: UseFormRegister<ParentProfile>; error: string | undefined }) {
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
