import { ArrowLeft, ArrowRight, Inbox, ShieldCheck } from "lucide-react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";

import { isValidSessionId, readSession } from "../lib/storage";

export function EmailNotification() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const invitationToken = searchParams.get("token");
  if (!isValidSessionId(id)) return <Navigate to="/" replace />;

  const session = readSession(id);
  if (!session || !invitationToken) return <Navigate to="/" replace />;

  return (
    <section className="min-h-[75vh] bg-mist px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-3xl overflow-hidden border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,35,29,0.10)]">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-100 px-5 py-4 text-slate-500">
          <div className="flex items-center gap-3"><Inbox className="size-5" aria-hidden="true" /><span className="text-sm font-bold">Inbox / INPEL Match</span></div>
          <span className="text-xs">Today, 9:42 AM</span>
        </div>
        <article className="p-6 sm:p-10">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-forest">
            <ArrowLeft className="size-4" aria-hidden="true" /> Back to parent portal
          </Link>
          <p className="mt-8 text-xs font-bold tracking-[0.18em] text-leaf uppercase">A note from your family</p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-forest sm:text-5xl">Your university journey starts here.</h1>
          <div className="mt-7 border-y border-slate-200 py-5 text-sm text-slate-500">
            <p><strong className="text-ink">From:</strong> INPEL University Match &lt;hello@inpel.my&gt;</p>
            <p className="mt-2"><strong className="text-ink">To:</strong> Future university student</p>
          </div>
          <div className="mt-7 space-y-4 text-base leading-7 text-slate-600">
            <p>Hello,</p>
            <p>Your family has started a private INPEL match and invited you to complete a short strengths and interests assessment.</p>
            <p>There are no right answers. Choose what feels most like you, and we’ll turn it into a university shortlist with cost and career context.</p>
          </div>
          <Link to={`/student/${id}?token=${encodeURIComponent(invitationToken)}`} className="mt-8 inline-flex items-center gap-3 bg-forest px-6 py-4 font-bold text-white transition hover:bg-leaf">
            Start Student Assessment <ArrowRight className="size-5" aria-hidden="true" />
          </Link>
          <div className="mt-8 flex gap-3 border-l-4 border-leaf bg-mint/60 p-4 text-sm leading-6 text-forest">
            <ShieldCheck className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
            <p><strong>Private by design.</strong> Your answers are attached only to invitation ending in <span className="font-mono">{id.slice(-6)}</span>.</p>
          </div>
        </article>
      </div>
    </section>
  );
}
