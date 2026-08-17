import { zodResolver } from "@hookform/resolvers/zod";
import { LockKeyhole } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { useLanguage } from "../lib/language";
import type { AuthProvider, StudentAuthMode } from "../lib/portal-data";
import { studentAccountSchema, type StudentAccount } from "../lib/validation";

const COPY = {
  ms: { eyebrow: "Kemajuan anda sudah sedia", title: "Simpan profil anda dengan selamat!", description: "Daftar atau log masuk supaya semua usaha ini tidak hilang dan boleh dikongsi dengan ibu bapa anda.", signup: "Daftar", login: "Log masuk", email: "E-mel pelajar", password: "Kata laluan", invalidEmail: "Masukkan alamat e-mel yang sah.", invalidPassword: "Masukkan kata laluan yang sah.", securing: "Menyimpan profil…", create: "Cipta akaun dan maklumkan ibu bapa", logIn: "Log masuk dan maklumkan ibu bapa", continueWith: "atau teruskan dengan", prototype: "Dalam mod prototaip, kelayakan anda disahkan tetapi kata laluan tidak pernah disimpan." },
  en: { eyebrow: "Your progress is ready", title: "Let’s lock in your profile!", description: "Sign up or log in so none of this progress gets lost and it can be shared with your parents.", signup: "Sign up", login: "Log in", email: "Student email", password: "Password", invalidEmail: "Enter a valid email address.", invalidPassword: "Enter a valid password.", securing: "Securing profile…", create: "Create account & notify parent", logIn: "Log in & notify parent", continueWith: "or continue with", prototype: "Prototype mode validates your credentials but never stores the password." },
  ta: { eyebrow: "உங்கள் முன்னேற்றம் தயாராக உள்ளது", title: "உங்கள் சுயவிவரத்தைப் பாதுகாப்பாகச் சேமிப்போம்!", description: "இதுவரை செய்தது எதுவும் தொலைந்து போகாமல், பெற்றோருடன் பகிர பதிவு செய்யுங்கள் அல்லது உள்நுழையுங்கள்.", signup: "பதிவு செய்க", login: "உள்நுழைக", email: "மாணவர் மின்னஞ்சல்", password: "கடவுச்சொல்", invalidEmail: "செல்லுபடியாகும் மின்னஞ்சல் முகவரியை உள்ளிடவும்.", invalidPassword: "செல்லுபடியாகும் கடவுச்சொல்லை உள்ளிடவும்.", securing: "சுயவிவரம் பாதுகாக்கப்படுகிறது…", create: "கணக்கை உருவாக்கி பெற்றோருக்குத் தெரிவிக்கவும்", logIn: "உள்நுழைந்து பெற்றோருக்குத் தெரிவிக்கவும்", continueWith: "அல்லது இதன் மூலம் தொடரவும்", prototype: "மாதிரி நிலையில் உங்கள் உள்நுழைவு விவரங்கள் சரிபார்க்கப்படும்; கடவுச்சொல் சேமிக்கப்படாது." },
  "zh-CN": { eyebrow: "你的进度已准备就绪", title: "把你的资料安全保存下来吧！", description: "注册或登录，以免目前的进度丢失，并与父母分享结果。", signup: "注册", login: "登录", email: "学生邮箱", password: "密码", invalidEmail: "请输入有效的邮箱地址。", invalidPassword: "请输入有效的密码。", securing: "正在安全保存资料…", create: "创建账号并通知家长", logIn: "登录并通知家长", continueWith: "或使用以下方式继续", prototype: "原型模式只会验证登录信息，不会保存你的密码。" },
} as const;

export type { AuthProvider } from "../lib/portal-data";

export function StudentAuthGate({ isSubmitting, onAuthenticate }: { isSubmitting: boolean; onAuthenticate: (provider: AuthProvider, email: string | undefined, password: string | undefined, mode: StudentAuthMode) => Promise<void> }) {
  const { language } = useLanguage();
  const copy = COPY[language];
  const [mode, setMode] = useState<StudentAuthMode>("signup");
  const { register, handleSubmit, formState: { errors } } = useForm<StudentAccount>({ resolver: zodResolver(studentAccountSchema), defaultValues: { email: "", password: "" } });
  const submit = handleSubmit(async ({ email, password }) => onAuthenticate("password", email, password, mode));

  async function social(provider: "google" | "facebook") {
    await onAuthenticate(provider, undefined, undefined, mode);
  }

  return (
    <div className="mx-auto max-w-xl py-2">
      <span className="grid size-12 place-items-center bg-mint text-leaf"><LockKeyhole className="size-5" /></span>
      <p className="mt-5 text-xs font-bold tracking-[0.16em] text-leaf uppercase">{copy.eyebrow}</p>
      <h2 className="mt-2 font-display text-4xl font-bold text-forest">{copy.title}</h2>
      <p className="mt-3 leading-7 text-slate-600">{copy.description}</p>
      <div className="mt-6 grid grid-cols-2 border border-slate-300 p-1"><button type="button" aria-pressed={mode === "signup"} onClick={() => setMode("signup")} className={`px-4 py-2 text-sm font-bold ${mode === "signup" ? "bg-forest text-white" : "text-slate-500"}`}>{copy.signup}</button><button type="button" aria-pressed={mode === "login"} onClick={() => setMode("login")} className={`px-4 py-2 text-sm font-bold ${mode === "login" ? "bg-forest text-white" : "text-slate-500"}`}>{copy.login}</button></div>
      <form onSubmit={(event) => { void submit(event); }} noValidate>
        <label htmlFor="student-email" className="mt-6 block text-sm font-bold text-forest">{copy.email}</label><input id="student-email" type="email" autoComplete="email" className="field-control mt-2" {...register("email")} />{errors.email && <p role="alert" className="mt-2 text-sm font-semibold text-red-700">{copy.invalidEmail}</p>}
        <label htmlFor="student-password" className="mt-5 block text-sm font-bold text-forest">{copy.password}</label><input id="student-password" type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} className="field-control mt-2" {...register("password")} />{errors.password && <p role="alert" className="mt-2 text-sm font-semibold text-red-700">{copy.invalidPassword}</p>}
        <button type="submit" disabled={isSubmitting} className="mt-6 w-full bg-forest px-6 py-4 font-bold text-white hover:bg-leaf disabled:opacity-60">{isSubmitting ? copy.securing : mode === "signup" ? copy.create : copy.logIn}</button>
      </form>
      <div className="my-6 flex items-center gap-3 text-xs font-bold tracking-wider text-slate-400 uppercase"><span className="h-px flex-1 bg-slate-200" />{copy.continueWith}<span className="h-px flex-1 bg-slate-200" /></div>
      <div className="grid gap-3 sm:grid-cols-2"><button type="button" disabled={isSubmitting} onClick={() => { void social("google"); }} className="flex items-center justify-center gap-2 border border-slate-300 px-4 py-3 font-bold text-forest hover:border-forest"><span className="font-display text-lg text-blue-600">G</span> Google</button><button type="button" disabled={isSubmitting} onClick={() => { void social("facebook"); }} className="flex items-center justify-center gap-2 border border-slate-300 px-4 py-3 font-bold text-forest hover:border-forest"><span className="grid size-5 place-items-center rounded-full bg-blue-700 font-bold text-white">f</span> Facebook</button></div>
      <p className="mt-5 text-center text-xs leading-5 text-slate-500">{copy.prototype}</p>
    </div>
  );
}
