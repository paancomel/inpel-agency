import { Check, LockKeyhole, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

import { ParentSessionGate } from "../components/ParentSessionGate";
import { grantDemoReportAccess } from "../lib/portal-data";
import { isValidSessionId } from "../lib/storage";

export function Checkout() {
  const { id } = useParams();
  if (!isValidSessionId(id)) return <Navigate to="/" replace />;
  return <ParentSessionGate sessionId={id}><DemoReportActivation sessionId={id} /></ParentSessionGate>;
}

function DemoReportActivation({ sessionId }: { sessionId: string }) {
  const navigate = useNavigate();
  const [isActivating, setIsActivating] = useState(false);
  const [error, setError] = useState("");

  async function activateReport() {
    setIsActivating(true);
    setError("");
    try {
      await grantDemoReportAccess(sessionId);
      navigate(`/results/${sessionId}`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The free demo report could not be activated.");
    } finally {
      setIsActivating(false);
    }
  }

  return (
    <section className="min-h-[76vh] bg-mist px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto grid max-w-5xl overflow-hidden border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,35,29,0.10)] lg:grid-cols-[0.9fr_1.1fr]">
        <div className="bg-forest p-7 text-white sm:p-10 lg:p-12">
          <p className="text-xs font-bold tracking-[0.18em] text-emerald-200 uppercase">Free demo report</p>
          <h1 className="mt-4 font-display text-4xl font-bold sm:text-5xl">Review the submitted assessment.</h1>
          <p className="mt-5 max-w-md leading-7 text-emerald-50/80">This is a no-charge demo. It does not collect payment details, submit a transaction, or represent a paid purchase.</p>
          <ul className="mt-9 space-y-4 text-sm">
            {["Server-authorized assessment summary", "Any recommendations already generated for this session", "Clear empty state when recommendations are not available"].map((feature) => <li key={feature} className="flex items-center gap-3"><span className="grid size-6 place-items-center rounded-full bg-white/10"><Check className="size-4 text-emerald-200" /></span>{feature}</li>)}
          </ul>
        </div>
        <div className="p-7 sm:p-10 lg:p-12">
          <div className="flex items-start gap-4"><span className="grid size-10 place-items-center bg-mint text-leaf"><LockKeyhole className="size-5" /></span><div><p className="text-xs font-bold tracking-[0.18em] text-leaf uppercase">Parent-controlled access</p><h2 className="mt-2 font-display text-3xl font-bold text-forest">Activate demo access</h2></div></div>
          <p className="mt-6 leading-7 text-slate-600">The server verifies that the current parent account owns this completed invitation before it activates access. This browser cannot unlock the report by changing local data.</p>
          <div className="mt-7 border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600"><p className="flex items-center gap-2 font-bold text-forest"><ShieldCheck className="size-4 text-leaf" /> No payment is collected</p><p className="mt-2">You can return to this report later by signing in with the authorized account.</p></div>
          {error && <p role="alert" className="mt-5 border-l-4 border-red-600 bg-red-50 p-4 text-sm font-semibold text-red-800">{error}</p>}
          <button type="button" disabled={isActivating} onClick={() => { void activateReport(); }} className="mt-7 flex w-full items-center justify-center bg-forest px-6 py-4 font-bold text-white hover:bg-leaf disabled:cursor-wait disabled:opacity-60">{isActivating ? "Activating secure access…" : "Activate free demo report"}</button>
        </div>
      </div>
    </section>
  );
}
