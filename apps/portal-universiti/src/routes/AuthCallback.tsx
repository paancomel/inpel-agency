import { LoaderCircle, RefreshCw, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { completeCachedAuthentication } from "../lib/auth-flow";
import { useLanguage } from "../lib/language";
import { getAuthenticatedStudent } from "../lib/portal-data";
import { isValidSessionId } from "../lib/storage";

const copyByLanguage = {
  ms: { confirmation: "Pengesahan e-mel", confirming: "Mengesahkan akaun anda…", failedLink: "Kami tidak dapat mengesahkan pautan e-mel ini.", returning: "Membawa anda kembali ke INPEL dengan selamat.", handoff: "Pemindahan akaun selamat", saving: "Menyimpan penilaian anda…", safe: "Penilaian anda masih selamat.", restoring: "Memulihkan jawapan dan mengaitkannya dengan akaun anda.", retry: "Cuba simpan semula", return: "Kembali ke portal pelajar" },
  en: { confirmation: "Email confirmation", confirming: "Confirming your account…", failedLink: "We could not confirm this email link.", returning: "Returning you securely to INPEL.", handoff: "Secure account handoff", saving: "Saving your assessment…", safe: "Your assessment is still safe.", restoring: "Restoring your answers and linking them to your account.", retry: "Retry secure save", return: "Return to the student portal" },
  ta: { confirmation: "மின்னஞ்சல் உறுதிப்படுத்தல்", confirming: "உங்கள் கணக்கு உறுதிப்படுத்தப்படுகிறது…", failedLink: "இந்த மின்னஞ்சல் இணைப்பை உறுதிப்படுத்த முடியவில்லை.", returning: "உங்களைப் பாதுகாப்பாக INPEL-க்குத் திருப்புகிறோம்.", handoff: "பாதுகாப்பான கணக்கு மாற்றம்", saving: "உங்கள் மதிப்பீடு சேமிக்கப்படுகிறது…", safe: "உங்கள் மதிப்பீடு பாதுகாப்பாக உள்ளது.", restoring: "உங்கள் பதில்களை மீட்டு கணக்குடன் இணைக்கிறோம்.", retry: "பாதுகாப்பாக மீண்டும் சேமி", return: "மாணவர் தளத்திற்குத் திரும்பு" },
  "zh-CN": { confirmation: "邮箱确认", confirming: "正在确认你的账户…", failedLink: "无法确认此邮箱链接。", returning: "正在安全返回 INPEL。", handoff: "安全账户交接", saving: "正在保存你的评估…", safe: "你的评估仍然安全。", restoring: "正在恢复答案并关联到你的账户。", retry: "重试安全保存", return: "返回学生平台" },
} as const;

export function AuthCallback() {
  const { language } = useLanguage();
  const copy = copyByLanguage[language];
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get("sessionId") ?? undefined;
  const invitationToken = searchParams.get("token") ?? undefined;
  const [error, setError] = useState("");
  const [isCompleting, setIsCompleting] = useState(true);

  async function retryCompletion() {
    if (!isValidSessionId(sessionId)) return;
    setError("");
    setIsCompleting(true);
    try {
      await completeCachedAuthentication(sessionId, invitationToken);
      navigate(`/parent/${sessionId}`, { replace: true });
    } catch (completionError) {
      setError(completionError instanceof Error ? completionError.message : "We could not finish saving your assessment.");
      setIsCompleting(false);
    }
  }

  useEffect(() => {
    if (!isValidSessionId(sessionId)) {
      let isActive = true;
      void getAuthenticatedStudent()
        .then(() => { if (isActive) navigate("/", { replace: true }); })
        .catch((authenticationError: unknown) => {
          if (!isActive) return;
          setError(authenticationError instanceof Error ? authenticationError.message : "We could not confirm this email link.");
          setIsCompleting(false);
        });
      return () => { isActive = false; };
    }
    let isActive = true;
    void completeCachedAuthentication(sessionId, invitationToken)
      .then(() => { if (isActive) navigate(`/parent/${sessionId}`, { replace: true }); })
      .catch((completionError: unknown) => {
        if (!isActive) return;
        setError(completionError instanceof Error ? completionError.message : "We could not finish saving your assessment.");
        setIsCompleting(false);
      });
    return () => { isActive = false; };
  }, [invitationToken, navigate, sessionId]);

  if (!isValidSessionId(sessionId)) {
    return (
      <section className="grid min-h-[70vh] place-items-center bg-cream px-4 py-14">
        <div className="w-full max-w-xl border border-slate-200 bg-white p-8 text-center shadow-[0_20px_60px_rgba(15,35,29,0.08)] sm:p-12">
          <span className="mx-auto grid size-14 place-items-center bg-mint text-leaf">
            {isCompleting ? <LoaderCircle className="size-6 animate-spin" /> : <ShieldCheck className="size-6" />}
          </span>
          <p className="mt-5 text-xs font-bold tracking-[0.16em] text-leaf uppercase">{copy.confirmation}</p>
          <h1 className="mt-2 font-display text-4xl font-bold text-forest">{isCompleting ? copy.confirming : copy.failedLink}</h1>
          {isCompleting ? <p className="mt-4 leading-7 text-slate-600" role="status">{copy.returning}</p> : <p className="mt-4 border-l-4 border-red-600 bg-red-50 p-4 text-left font-semibold text-red-800" role="alert">{error}</p>}
        </div>
      </section>
    );
  }

  return (
    <section className="grid min-h-[70vh] place-items-center bg-cream px-4 py-14">
      <div className="w-full max-w-xl border border-slate-200 bg-white p-8 text-center shadow-[0_20px_60px_rgba(15,35,29,0.08)] sm:p-12">
        <span className="mx-auto grid size-14 place-items-center bg-mint text-leaf">
          {isCompleting ? <LoaderCircle className="size-6 animate-spin" /> : <ShieldCheck className="size-6" />}
        </span>
        <p className="mt-5 text-xs font-bold tracking-[0.16em] text-leaf uppercase">{copy.handoff}</p>
        <h1 className="mt-2 font-display text-4xl font-bold text-forest">
          {isCompleting ? copy.saving : copy.safe}
        </h1>
        {isCompleting ? (
          <p className="mt-4 leading-7 text-slate-600" role="status">{copy.restoring}</p>
        ) : (
          <div>
            <p className="mt-4 border-l-4 border-red-600 bg-red-50 p-4 text-left font-semibold text-red-800" role="alert">{error}</p>
            <button type="button" onClick={() => { void retryCompletion(); }} className="mt-6 inline-flex items-center gap-2 bg-forest px-6 py-3 font-bold text-white hover:bg-leaf">
              <RefreshCw className="size-4" /> {copy.retry}
            </button>
            <a href={`/student/${sessionId}${invitationToken ? `?token=${encodeURIComponent(invitationToken)}` : ""}`} className="mt-4 block text-sm font-bold text-leaf underline underline-offset-4">{copy.return}</a>
          </div>
        )}
      </div>
    </section>
  );
}
