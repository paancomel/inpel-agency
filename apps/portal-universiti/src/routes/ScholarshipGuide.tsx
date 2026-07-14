import { ArrowLeft, CalendarDays, CheckCircle2, FileCheck2, Lightbulb } from "lucide-react";
import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

const guides = {
  "merit-excellence": { title: "Merit Excellence Award", value: "Up to RM 12,000", deadline: "Submit within 14 days of receiving an offer" },
  "future-leaders": { title: "Future Leaders Bursary", value: "Up to RM 15,000", deadline: "Applications typically close before the September intake" },
  "entrance-scholarship": { title: "Entrance Scholarship", value: "Up to 50% tuition", deadline: "Apply alongside your programme application" },
} as const;

const checklist = ["Certified SPM results", "Identity document copy", "Programme offer letter", "One-page personal statement", "Leadership or activity evidence", "Household income documents"];

export function ScholarshipGuide() {
  const { guideId } = useParams();
  const navigate = useNavigate();
  const [complete, setComplete] = useState<string[]>([]);
  if (!guideId || !(guideId in guides)) return <Navigate to="/" replace />;
  const guide = guides[guideId as keyof typeof guides];
  const progress = Math.round((complete.length / checklist.length) * 100);

  return (
    <section className="min-h-[76vh] bg-cream px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <button type="button" onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-forest"><ArrowLeft className="size-4" /> Back to results</button>
        <header className="mt-7 border-b border-slate-300 pb-8"><p className="text-xs font-bold tracking-[0.18em] text-amber-800 uppercase">Scholarship application guide</p><h1 className="mt-3 max-w-3xl font-display text-5xl font-bold tracking-tight text-forest sm:text-6xl">{guide.title}</h1><div className="mt-6 flex flex-wrap gap-3 text-sm"><span className="bg-mint px-4 py-2 font-bold text-forest">Potential value · {guide.value}</span><span className="bg-sun/20 px-4 py-2 font-bold text-amber-900">{guide.deadline}</span></div></header>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.72fr]">
          <section className="border border-slate-200 bg-white p-6 sm:p-8" aria-labelledby="checklist-title"><div className="flex items-center gap-3"><FileCheck2 className="size-6 text-leaf" /><h2 id="checklist-title" className="font-display text-3xl font-bold text-forest">Document checklist</h2></div><p className="mt-3 leading-7 text-slate-600">Tick items as you prepare them. This checklist stays on this page only and is not uploaded.</p><div className="mt-6 space-y-2">{checklist.map((item) => <label key={item} className="flex cursor-pointer items-center gap-3 border border-slate-200 p-4"><input type="checkbox" checked={complete.includes(item)} onChange={() => setComplete((current) => current.includes(item) ? current.filter((value) => value !== item) : [...current, item])} className="size-4 accent-leaf" /><span className="font-semibold text-forest">{item}</span></label>)}</div></section>

          <aside className="space-y-5">
            <section className="border border-slate-200 bg-forest p-6 text-white"><p className="text-xs font-bold tracking-[0.14em] text-emerald-200 uppercase">Readiness</p><p className="mt-3 font-display text-5xl font-bold">{progress}%</p><div className="mt-4 h-2 bg-white/15"><div className="h-full bg-sun transition-all" style={{ width: `${progress}%` }} /></div><p className="mt-3 text-sm text-emerald-50/70">{complete.length} of {checklist.length} documents prepared</p></section>
            <section className="border border-slate-200 bg-white p-6"><CalendarDays className="size-6 text-leaf" /><h2 className="mt-4 font-display text-2xl font-bold text-forest">Recommended sequence</h2><ol className="mt-4 space-y-4 text-sm leading-6 text-slate-600"><li><strong className="text-forest">1. Confirm eligibility.</strong><br />Check grades, programme and intake requirements.</li><li><strong className="text-forest">2. Prepare evidence.</strong><br />Use clear file names and certified copies where requested.</li><li><strong className="text-forest">3. Submit early.</strong><br />Leave time to correct missing or rejected documents.</li></ol></section>
            <section className="border-l-4 border-sun bg-sun/15 p-5"><div className="flex gap-3"><Lightbulb className="mt-0.5 size-5 shrink-0 text-amber-800" /><p className="text-sm leading-6 text-amber-950"><strong>Application tip:</strong> Connect your personal statement to one concrete activity, what you learned and how you’ll contribute on campus.</p></div></section>
          </aside>
        </div>
        <section className="mt-6 flex gap-3 border border-slate-200 bg-white p-6"><CheckCircle2 className="mt-0.5 size-6 shrink-0 text-leaf" /><div><h2 className="font-display text-2xl font-bold text-forest">Before you submit</h2><p className="mt-2 leading-7 text-slate-600">Verify the latest value, deadline and eligibility directly with the university. Scholarship terms can change between intakes.</p></div></section>
      </div>
    </section>
  );
}
