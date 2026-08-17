import { ArrowRight, Building2, LockKeyhole, Mail } from "lucide-react";
import { type FormEvent, useState } from "react";
import { LegalLinks } from "@repo/ui";

import { signInInstitution } from "../lib/database";
import { canUseInstitutionDemo } from "../lib/runtime";
import { loginSchema } from "../lib/validation";

interface LoginViewProps {
  onAuthenticated: () => void;
}

export function LoginView({ onAuthenticated }: LoginViewProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Check your credentials and try again.");
      return;
    }

    setIsSubmitting(true);
    try {
      await signInInstitution(result.data.email, result.data.password);
      setPassword("");
      onAuthenticated();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "We could not verify those institutional credentials.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-canvas lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-navy p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 top-24 h-72 w-72 rounded-full border border-white/10" />
        <div className="absolute -right-8 top-40 h-72 w-72 rounded-full border border-white/10" />
        <div className="relative flex items-center gap-3 text-sm font-bold tracking-[0.18em]">
          <span className="grid h-10 w-10 place-items-center bg-coral text-white">
            <Building2 aria-hidden="true" size={21} />
          </span>
          INPELER
        </div>
        <div className="relative max-w-xl pb-12">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.24em] text-coral-light">
            Institutional data workspace
          </p>
          <h2 className="font-display text-5xl leading-[1.08]">
            Make every programme easier to discover.
          </h2>
          <p className="mt-6 max-w-lg text-lg leading-8 text-slate-300">
            Keep your university profile, facilities and accredited programmes accurate in one
            focused publishing flow.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="grid h-10 w-10 place-items-center bg-coral text-white">
              <Building2 aria-hidden="true" size={21} />
            </span>
            <span className="font-bold tracking-[0.18em] text-navy">INPELER</span>
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-coral">Representative access</p>
          <h1 className="mt-3 font-display text-4xl text-navy">Institutional Portal</h1>
          <p className="mt-3 leading-7 text-slate-600">
            Sign in with the credentials issued to your institution representative.
          </p>

          <form className="mt-8 space-y-5" noValidate onSubmit={(event) => void handleSubmit(event)}>
            <label className="block" htmlFor="email">
              <span className="field-label">Institutional email</span>
              <span className="relative mt-2 block">
                <Mail aria-hidden="true" className="pointer-events-none absolute left-3.5 top-3.5 text-slate-400" size={19} />
                <input
                  autoComplete="username"
                  className="field-control pl-11"
                  id="email"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="registrar@university.edu.my"
                  type="email"
                  value={email}
                />
              </span>
            </label>
            <label className="block" htmlFor="password">
              <span className="field-label">Password</span>
              <span className="relative mt-2 block">
                <LockKeyhole aria-hidden="true" className="pointer-events-none absolute left-3.5 top-3.5 text-slate-400" size={19} />
                <input
                  autoComplete="current-password"
                  className="field-control pl-11"
                  id="password"
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
                  value={password}
                />
              </span>
            </label>

            {error ? <p className="text-sm font-medium text-rose-700" role="alert">{error}</p> : null}

            <button className="primary-button w-full" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Verifying…" : "Login"}
              {!isSubmitting ? <ArrowRight aria-hidden="true" size={18} /> : null}
            </button>
          </form>

          {canUseInstitutionDemo() ? (
            <button className="mt-4 w-full py-2 text-sm font-semibold text-slate-600 underline decoration-slate-300 underline-offset-4 hover:text-navy" onClick={onAuthenticated} type="button">
              Preview dashboard without signing in
            </button>
          ) : null}

          <p className="mt-8 border-t border-slate-200 pt-5 text-xs leading-5 text-slate-500">
            Access is limited to verified university representatives. Credentials are submitted
            directly to the shared authentication service and are never stored in this portal draft.
          </p>
          <LegalLinks className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-navy underline underline-offset-4" />
        </div>
      </section>
    </main>
  );
}
