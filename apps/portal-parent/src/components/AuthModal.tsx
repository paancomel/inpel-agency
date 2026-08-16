import { MailCheck } from "lucide-react";
import { useState } from "react";

import { requestMagicLink, signInWithGoogle } from "../lib/review-data";
import { authEmailSchema } from "../lib/validation";
import { ModalShell } from "./ModalShell";

interface AuthModalProps { onClose: () => void; }

export function AuthModal({ onClose }: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [error, setError] = useState<string>();
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "demo">("idle");

  async function submit() {
    const result = authEmailSchema.safeParse({ email });
    if (!result.success) { setError(result.error.flatten().fieldErrors.email?.[0]); return; }
    const eighteenthBirthday = new Date(); eighteenthBirthday.setFullYear(eighteenthBirthday.getFullYear() - 18);
    if (!dateOfBirth || new Date(`${dateOfBirth}T00:00:00`) > eighteenthBirthday) { setError("You must be 18 or older to create a community account."); return; }
    setError(undefined);
    setStatus("sending");
    setStatus(await requestMagicLink(result.data.email, dateOfBirth));
  }

  async function continueWithGoogle() {
    const eighteenthBirthday = new Date(); eighteenthBirthday.setFullYear(eighteenthBirthday.getFullYear() - 18);
    if (!dateOfBirth || new Date(`${dateOfBirth}T00:00:00`) > eighteenthBirthday) { setError("Enter a date of birth confirming you are 18 or older first."); return; }
    setError(undefined);
    await signInWithGoogle(dateOfBirth);
  }

  return (
    <ModalShell titleId="auth-modal-title" onClose={onClose} size="sm">
      <div className="p-6 pt-8">
        <div className="grid size-11 place-items-center rounded-xl bg-ice-tint text-tidal-teal"><MailCheck size={22} aria-hidden="true" /></div>
        <h2 id="auth-modal-title" className="mt-5 font-display text-2xl">Sign in to INPOLOR</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">Continue securely with Google or a magic link. You must be 18 or older to contribute.</p>
        {status === "sent" || status === "demo" ? (
          <div className="mt-6 rounded-xl bg-ice-tint p-4" role="status"><p className="font-bold text-deep-current">Check your inbox</p><p className="mt-1 text-sm text-slate-600">{status === "sent" ? "Your sign-in link is on its way." : "Preview mode is active; connect Supabase to send live links."}</p></div>
        ) : (
          <form className="mt-6" onSubmit={(event) => { event.preventDefault(); void submit(); }} noValidate>
            <button type="button" onClick={() => void continueWithGoogle()} className="mb-4 w-full border-2 border-ink bg-white px-5 py-3 font-bold text-ink transition hover:-translate-y-0.5 hover:bg-sun-paper">Continue with Google</button>
            <div className="mb-4 flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-slate-500"><span className="h-px flex-1 bg-sea-fog" />or<span className="h-px flex-1 bg-sea-fog" /></div>
            <label htmlFor="auth-email" className="block text-sm font-bold">Email address</label><input id="auth-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-sea-fog px-3.5 py-3 text-sm focus:border-tidal-teal focus:outline-none" placeholder="you@example.com" autoComplete="email" aria-invalid={Boolean(error)} aria-describedby={error ? "email-error" : undefined} />
            <label htmlFor="auth-dob" className="mt-4 block text-sm font-bold">Date of birth</label><input id="auth-dob" type="date" value={dateOfBirth} onChange={(event) => setDateOfBirth(event.target.value)} className="mt-2 w-full rounded-xl border border-sea-fog px-3.5 py-3 text-sm focus:border-tidal-teal focus:outline-none" required />
            {error ? <p id="email-error" className="mt-1 text-sm font-medium text-red-700">{error}</p> : null}
            <button type="submit" disabled={status === "sending"} className="mt-5 w-full rounded-full bg-midnight-harbor px-5 py-3 font-bold text-white disabled:opacity-60">{status === "sending" ? "Sending…" : "Send magic link"}</button>
          </form>
        )}
        <p className="mt-5 text-center text-xs leading-relaxed text-slate-500">By continuing, you agree to keep reviews constructive and community-safe.</p>
      </div>
    </ModalShell>
  );
}
