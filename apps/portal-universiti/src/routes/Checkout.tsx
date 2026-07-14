import { Check, CreditCard, LockKeyhole, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

import { syncPayment } from "../lib/portal-data";
import { isValidSessionId, readSession, saveSession, type SessionRecord } from "../lib/storage";

const tiers = [
  { id: 1, name: "Snapshot", price: 39, note: "Top 3 matches and fit summary" },
  { id: 2, name: "Full roadmap", price: 79, note: "Full report, ROI, scholarships and PDF" },
  { id: 3, name: "Family bundle", price: 119, note: "Full roadmap plus consultation checklist" },
];

const delay = (milliseconds: number) => new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

export function Checkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const initialSession = isValidSessionId(id) ? readSession(id) : null;
  const [session, setSession] = useState<SessionRecord | null>(initialSession);
  const [selectedTier, setSelectedTier] = useState(2);
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState("");

  if (!isValidSessionId(id) || !session) return <Navigate to="/" replace />;
  if (!session.student) return <Navigate to={`/student/${id}`} replace />;

  const selected = tiers.find((tier) => tier.id === selectedTier) ?? tiers[1]!;

  async function unlockReport() {
    if (!session) return;
    setIsPaying(true);
    setError("");
    const pending: SessionRecord = { ...session, payment: { tier: selectedTier, status: "pending" } };
    saveSession(pending);
    setSession(pending);

    try {
      await delay(350);
      const paid: SessionRecord = {
        ...pending,
        payment: { tier: selectedTier, status: "success", paidAt: new Date().toISOString() },
      };
      if (!saveSession(paid)) throw new Error("Payment result could not be stored.");
      setSession(paid);
      await syncPayment(paid);
      navigate(`/results/${id}`);
    } catch {
      const failed: SessionRecord = { ...pending, payment: { tier: selectedTier, status: "failed" } };
      saveSession(failed);
      setSession(failed);
      setError("The demo checkout could not complete. No payment was taken; please try again.");
      setIsPaying(false);
    }
  }

  return (
    <section className="min-h-[76vh] bg-mist px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto grid max-w-6xl overflow-hidden border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,35,29,0.10)] lg:grid-cols-[0.9fr_1.1fr]">
        <div className="bg-forest p-7 text-white sm:p-10 lg:p-12">
          <p className="text-xs font-bold tracking-[0.18em] text-emerald-200 uppercase">Assessment complete</p>
          <h1 className="mt-4 font-display text-4xl font-bold sm:text-5xl">Turn the match into a plan.</h1>
          <p className="mt-5 max-w-md leading-7 text-emerald-50/80">Unlock detailed university comparisons, projected costs, career salary paths and a downloadable family report.</p>
          <ul className="mt-9 space-y-4 text-sm">
            {["Matched programmes with reasons", "Four-year cost and ROI scenarios", "Scholarship application guides", "Configurable PDF family report"].map((feature) => <li key={feature} className="flex items-center gap-3"><span className="grid size-6 place-items-center rounded-full bg-white/10"><Check className="size-4 text-emerald-200" /></span>{feature}</li>)}
          </ul>
          <div className="mt-10 border-t border-white/15 pt-6 text-sm text-emerald-50/70"><p className="flex items-center gap-2"><ShieldCheck className="size-4" /> Secure demo mode</p><p className="mt-2">No card details are requested or transmitted.</p></div>
        </div>

        <div className="p-7 sm:p-10 lg:p-12">
          <div className="flex items-start justify-between gap-5"><div><p className="text-xs font-bold tracking-[0.18em] text-leaf uppercase">Report access</p><h2 className="mt-2 font-display text-3xl font-bold text-forest">Choose your level</h2></div><CreditCard className="size-7 text-slate-300" /></div>
          <fieldset className="mt-7 space-y-3"><legend className="sr-only">Report tier</legend>{tiers.map((tier) => <label key={tier.id} className={`flex cursor-pointer items-center gap-4 border p-4 transition ${selectedTier === tier.id ? "border-forest bg-mint/50" : "border-slate-200 hover:border-slate-400"}`}><input type="radio" name="tier" value={tier.id} checked={selectedTier === tier.id} onChange={() => setSelectedTier(tier.id)} className="size-4 accent-leaf" /><span className="min-w-0 flex-1"><strong className="block text-forest">{tier.name}</strong><span className="mt-1 block text-sm text-slate-500">{tier.note}</span></span><strong className="font-display text-2xl text-forest">RM {tier.price}</strong></label>)}</fieldset>

          <div className="mt-7 border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-3"><span className="grid size-9 place-items-center bg-white text-leaf"><LockKeyhole className="size-4" /></span><div><strong className="block text-sm text-forest">Demo payment</strong><span className="text-xs text-slate-500">Instant approval · No card required</span></div></div>
            <label htmlFor="billing-country" className="mt-5 block text-sm font-bold text-forest">Billing country</label>
            <select id="billing-country" className="field-control mt-2"><option>Malaysia</option><option>Singapore</option><option>Other</option></select>
          </div>
          {error && <p role="alert" className="mt-5 border-l-4 border-red-600 bg-red-50 p-4 text-sm font-semibold text-red-800">{error}</p>}
          <button type="button" disabled={isPaying} onClick={() => { void unlockReport(); }} className="mt-6 flex w-full items-center justify-center gap-2 bg-forest px-6 py-4 font-bold text-white hover:bg-leaf disabled:cursor-wait disabled:opacity-60">{isPaying ? "Unlocking securely…" : `Unlock Full Report · RM ${selected.price}`}</button>
          <p className="mt-3 text-center text-xs text-slate-500">Prototype checkout: this action creates no real charge.</p>
        </div>
      </div>
    </section>
  );
}
