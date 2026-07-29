import { zodResolver } from "@hookform/resolvers/zod";
import { LockKeyhole } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import type { AuthProvider, StudentAuthMode } from "../lib/portal-data";
import { studentAccountSchema, type StudentAccount } from "../lib/validation";

export type { AuthProvider } from "../lib/portal-data";

export function StudentAuthGate({ isSubmitting, onAuthenticate }: { isSubmitting: boolean; onAuthenticate: (provider: AuthProvider, email: string | undefined, password: string | undefined, mode: StudentAuthMode) => Promise<void> }) {
  const [mode, setMode] = useState<StudentAuthMode>("signup");
  const { register, handleSubmit, formState: { errors } } = useForm<StudentAccount>({ resolver: zodResolver(studentAccountSchema), defaultValues: { email: "", password: "" } });
  const submit = handleSubmit(async ({ email, password }) => onAuthenticate("password", email, password, mode));

  async function social(provider: "google" | "facebook") {
    await onAuthenticate(provider, undefined, undefined, mode);
  }

  return (
    <div className="mx-auto max-w-xl py-2">
      <span className="grid size-12 place-items-center bg-mint text-leaf"><LockKeyhole className="size-5" /></span>
      <p className="mt-5 text-xs font-bold tracking-[0.16em] text-leaf uppercase">Your progress is ready</p>
      <h2 className="mt-2 font-display text-4xl font-bold text-forest">Let’s lock in your profile!</h2>
      <p className="mt-3 leading-7 text-slate-600">Just a quick signup so you and your parents don’t lose all this progress...</p>
      <div className="mt-6 grid grid-cols-2 border border-slate-300 p-1"><button type="button" aria-pressed={mode === "signup"} onClick={() => setMode("signup")} className={`px-4 py-2 text-sm font-bold ${mode === "signup" ? "bg-forest text-white" : "text-slate-500"}`}>Sign up</button><button type="button" aria-pressed={mode === "login"} onClick={() => setMode("login")} className={`px-4 py-2 text-sm font-bold ${mode === "login" ? "bg-forest text-white" : "text-slate-500"}`}>Log in</button></div>
      <form onSubmit={(event) => { void submit(event); }} noValidate>
        <label htmlFor="student-email" className="mt-6 block text-sm font-bold text-forest">Student email</label><input id="student-email" type="email" autoComplete="email" className="field-control mt-2" {...register("email")} />{errors.email && <p role="alert" className="mt-2 text-sm font-semibold text-red-700">{errors.email.message}</p>}
        <label htmlFor="student-password" className="mt-5 block text-sm font-bold text-forest">Password</label><input id="student-password" type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} className="field-control mt-2" {...register("password")} />{errors.password && <p role="alert" className="mt-2 text-sm font-semibold text-red-700">{errors.password.message}</p>}
        <button type="submit" disabled={isSubmitting} className="mt-6 w-full bg-forest px-6 py-4 font-bold text-white hover:bg-leaf disabled:opacity-60">{isSubmitting ? "Securing profile…" : mode === "signup" ? "Create account & notify parent" : "Log in & notify parent"}</button>
      </form>
      <div className="my-6 flex items-center gap-3 text-xs font-bold tracking-wider text-slate-400 uppercase"><span className="h-px flex-1 bg-slate-200" />or continue with<span className="h-px flex-1 bg-slate-200" /></div>
      <div className="grid gap-3 sm:grid-cols-2"><button type="button" disabled={isSubmitting} onClick={() => { void social("google"); }} className="flex items-center justify-center gap-2 border border-slate-300 px-4 py-3 font-bold text-forest hover:border-forest"><span className="font-display text-lg text-blue-600">G</span> Google</button><button type="button" disabled={isSubmitting} onClick={() => { void social("facebook"); }} className="flex items-center justify-center gap-2 border border-slate-300 px-4 py-3 font-bold text-forest hover:border-forest"><span className="grid size-5 place-items-center rounded-full bg-blue-700 font-bold text-white">f</span> Facebook</button></div>
      <p className="mt-5 text-center text-xs leading-5 text-slate-500">Prototype mode validates your credentials but never stores the password.</p>
    </div>
  );
}
