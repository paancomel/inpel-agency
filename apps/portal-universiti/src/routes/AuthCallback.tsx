import { LoaderCircle, RefreshCw, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { completeCachedAuthentication } from "../lib/auth-flow";
import { getAuthenticatedStudent } from "../lib/portal-data";
import { isValidSessionId } from "../lib/storage";

export function AuthCallback() {
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
          <p className="mt-5 text-xs font-bold tracking-[0.16em] text-leaf uppercase">Email confirmation</p>
          <h1 className="mt-2 font-display text-4xl font-bold text-forest">{isCompleting ? "Confirming your account…" : "We could not confirm this email link."}</h1>
          {isCompleting ? <p className="mt-4 leading-7 text-slate-600" role="status">Returning you securely to INPEL.</p> : <p className="mt-4 border-l-4 border-red-600 bg-red-50 p-4 text-left font-semibold text-red-800" role="alert">{error}</p>}
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
        <p className="mt-5 text-xs font-bold tracking-[0.16em] text-leaf uppercase">Secure account handoff</p>
        <h1 className="mt-2 font-display text-4xl font-bold text-forest">
          {isCompleting ? "Saving your assessment…" : "Your assessment is still safe."}
        </h1>
        {isCompleting ? (
          <p className="mt-4 leading-7 text-slate-600" role="status">Restoring your answers and linking them to your account.</p>
        ) : (
          <div>
            <p className="mt-4 border-l-4 border-red-600 bg-red-50 p-4 text-left font-semibold text-red-800" role="alert">{error}</p>
            <button type="button" onClick={() => { void retryCompletion(); }} className="mt-6 inline-flex items-center gap-2 bg-forest px-6 py-3 font-bold text-white hover:bg-leaf">
              <RefreshCw className="size-4" /> Retry secure save
            </button>
            <a href={`/student/${sessionId}${invitationToken ? `?token=${encodeURIComponent(invitationToken)}` : ""}`} className="mt-4 block text-sm font-bold text-leaf underline underline-offset-4">Return to the student portal</a>
          </div>
        )}
      </div>
    </section>
  );
}
