import { CheckCircle2, ShieldCheck } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";

import { ParentSessionGate } from "../components/ParentSessionGate";
import { isValidSessionId } from "../lib/storage";

export function ParentHandoff() {
  const { id } = useParams();
  if (!isValidSessionId(id)) return <Navigate to="/" replace />;

  return (
    <ParentSessionGate sessionId={id}>
      <section className="min-h-[76vh] bg-mist px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto grid max-w-4xl overflow-hidden border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,35,29,0.10)] md:grid-cols-[0.85fr_1.15fr]">
          <div className="bg-forest p-8 text-white sm:p-12">
            <span className="grid size-14 place-items-center rounded-full bg-white/10 text-emerald-200"><CheckCircle2 className="size-7" /></span>
            <p className="mt-7 text-xs font-bold tracking-[0.18em] text-emerald-200 uppercase">Parent account verified</p>
            <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">The assessment is ready for your review.</h1>
            <p className="mt-5 leading-7 text-emerald-50/80">This page is available only after the server confirms that your current parent account owns this invitation.</p>
          </div>
          <div className="p-8 sm:p-12">
            <span className="grid size-12 place-items-center bg-mint text-leaf"><ShieldCheck className="size-5" /></span>
            <p className="mt-6 text-xs font-bold tracking-[0.18em] text-leaf uppercase">Next step</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-forest">Activate the free demo report.</h2>
            <p className="mt-3 leading-7 text-slate-600">No payment, card details, or transaction is involved. The server will check this invitation before it grants report access.</p>
            <Link to={`/checkout/${id}`} className="mt-7 inline-flex items-center justify-center bg-forest px-6 py-4 font-bold text-white hover:bg-leaf">Continue to free demo report</Link>
          </div>
        </div>
      </section>
    </ParentSessionGate>
  );
}
