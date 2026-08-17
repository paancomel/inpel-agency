import { zodResolver } from "@hookform/resolvers/zod";
import { LockKeyhole } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { useLanguage } from "../lib/language";
import type { AuthProvider, StudentAuthMode } from "../lib/portal-data";
import { studentAccountSchema, type StudentAccount } from "../lib/validation";

const copyByLanguage = {
  ms: { eyebrow: "Akaun ibu bapa", title: "Lindungi jemputan keluarga anda", body: "Jawapan keluarga anda disimpan dalam pelayar ini sahaja sehingga anda mencipta atau mendaftar masuk ke akaun ibu bapa.", signup: "Daftar", login: "Log masuk", email: "E-mel ibu bapa", password: "Kata laluan", securing: "Melindungi akaun…", create: "Cipta akaun ibu bapa", loginButton: "Log masuk sebagai ibu bapa", or: "atau teruskan dengan" },
  en: { eyebrow: "Parent account", title: "Secure your family invitation", body: "Your family answers are saved only in this browser until you create or sign in to a parent account.", signup: "Sign up", login: "Log in", email: "Parent email", password: "Password", securing: "Securing account…", create: "Create parent account", loginButton: "Log in as parent", or: "or continue with" },
  ta: { eyebrow: "பெற்றோர் கணக்கு", title: "உங்கள் குடும்ப அழைப்பைப் பாதுகாப்பாக்குங்கள்", body: "பெற்றோர் கணக்கை உருவாக்கும் அல்லது உள்நுழையும் வரை உங்கள் குடும்பத்தின் பதில்கள் இந்த உலாவியில் மட்டுமே சேமிக்கப்படும்.", signup: "பதிவு செய்க", login: "உள்நுழைக", email: "பெற்றோர் மின்னஞ்சல்", password: "கடவுச்சொல்", securing: "கணக்கு பாதுகாக்கப்படுகிறது…", create: "பெற்றோர் கணக்கை உருவாக்கு", loginButton: "பெற்றோராக உள்நுழைக", or: "அல்லது இதன் மூலம் தொடரவும்" },
  "zh-CN": { eyebrow: "家长账户", title: "保护你的家庭邀请", body: "在你创建或登录家长账户之前，家庭填写的答案只会保存在此浏览器中。", signup: "注册", login: "登录", email: "家长邮箱", password: "密码", securing: "正在保护账户…", create: "创建家长账户", loginButton: "以家长身份登录", or: "或使用以下方式继续" },
} as const;

export function ParentAuthGate({ isSubmitting, onAuthenticate }: {
  isSubmitting: boolean;
  onAuthenticate: (provider: AuthProvider, email: string | undefined, password: string | undefined, mode: StudentAuthMode) => Promise<void>;
}) {
  const { language } = useLanguage();
  const copy = copyByLanguage[language];
  const [mode, setMode] = useState<StudentAuthMode>("signup");
  const { register, handleSubmit, formState: { errors } } = useForm<StudentAccount>({
    resolver: zodResolver(studentAccountSchema),
    defaultValues: { email: "", password: "" },
  });
  const submit = handleSubmit(async ({ email, password }) => onAuthenticate("password", email, password, mode));

  function social(provider: "google" | "facebook") {
    return onAuthenticate(provider, undefined, undefined, mode);
  }

  return (
    <section className="mx-auto max-w-xl border border-emerald-900/10 bg-[#fafdff] p-7 shadow-[0_24px_70px_rgba(18,63,50,0.08)] sm:p-10">
      <span className="grid size-12 place-items-center bg-mint text-leaf"><LockKeyhole className="size-5" aria-hidden="true" /></span>
      <p className="mt-5 text-xs font-bold tracking-[0.16em] text-leaf uppercase">{copy.eyebrow}</p>
      <h1 className="mt-2 font-display text-4xl font-bold text-forest">{copy.title}</h1>
      <p className="mt-3 leading-7 text-slate-600">{copy.body}</p>
      <div className="mt-6 grid grid-cols-2 border border-slate-300 p-1">
        <button type="button" aria-pressed={mode === "signup"} onClick={() => setMode("signup")} className={`px-4 py-2 text-sm font-bold ${mode === "signup" ? "bg-forest text-white" : "text-slate-500"}`}>{copy.signup}</button>
        <button type="button" aria-pressed={mode === "login"} onClick={() => setMode("login")} className={`px-4 py-2 text-sm font-bold ${mode === "login" ? "bg-forest text-white" : "text-slate-500"}`}>{copy.login}</button>
      </div>
      <form onSubmit={(event) => { void submit(event); }} noValidate>
        <label htmlFor="parent-auth-email" className="mt-6 block text-sm font-bold text-forest">{copy.email}</label>
        <input id="parent-auth-email" type="email" autoComplete="email" className="field-control mt-2" {...register("email")} />
        {errors.email && <p role="alert" className="mt-2 text-sm font-semibold text-red-700">{errors.email.message}</p>}
        <label htmlFor="parent-auth-password" className="mt-5 block text-sm font-bold text-forest">{copy.password}</label>
        <input id="parent-auth-password" type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} className="field-control mt-2" {...register("password")} />
        {errors.password && <p role="alert" className="mt-2 text-sm font-semibold text-red-700">{errors.password.message}</p>}
        <button type="submit" disabled={isSubmitting} className="mt-6 w-full bg-forest px-6 py-4 font-bold text-white hover:bg-leaf disabled:opacity-60">{isSubmitting ? copy.securing : mode === "signup" ? copy.create : copy.loginButton}</button>
      </form>
      <div className="my-6 flex items-center gap-3 text-xs font-bold tracking-wider text-slate-400 uppercase"><span className="h-px flex-1 bg-slate-200" />{copy.or}<span className="h-px flex-1 bg-slate-200" /></div>
      <div className="grid gap-3 sm:grid-cols-2">
        <button type="button" disabled={isSubmitting} onClick={() => { void social("google"); }} className="flex items-center justify-center gap-2 border border-slate-300 px-4 py-3 font-bold text-forest hover:border-forest disabled:opacity-60"><span className="font-display text-lg text-blue-600">G</span> Google</button>
        <button type="button" disabled={isSubmitting} onClick={() => { void social("facebook"); }} className="flex items-center justify-center gap-2 border border-slate-300 px-4 py-3 font-bold text-forest hover:border-forest disabled:opacity-60"><span className="grid size-5 place-items-center rounded-full bg-blue-700 font-bold text-white">f</span> Facebook</button>
      </div>
    </section>
  );
}
