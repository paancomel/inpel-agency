import { Award, Check, Download, Scale, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts";

import { CareerProgressionDashboard } from "../components/CareerProgressionDashboard";
import { LocationMap } from "../components/LocationMap";
import { PdfReportDialog } from "../components/PdfReportDialog";
import { ROICalculator } from "../components/ROICalculator";
import { fetchUniversities } from "../lib/portal-data";
import { fallbackMatches, mapUniversityRows, type UniversityMatch } from "../lib/recommendations";
import { isValidSessionId, readSession } from "../lib/storage";

const currency = new Intl.NumberFormat("en-MY", { style: "currency", currency: "MYR", maximumFractionDigits: 0 });

export function Results() {
  const { id } = useParams();
  const session = isValidSessionId(id) ? readSession(id) : null;
  const [matches, setMatches] = useState<UniversityMatch[]>(fallbackMatches);
  const [catalogStatus, setCatalogStatus] = useState("Loading the shared university catalogue…");
  const [selected, setSelected] = useState<string[]>([]);
  const [pdfOpen, setPdfOpen] = useState(false);
  const reportRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let active = true;
    void fetchUniversities()
      .then((rows) => {
        if (!active) return;
        if (rows.length > 0) {
          setMatches(mapUniversityRows(rows));
          setCatalogStatus("Matches loaded from the shared university catalogue.");
        } else {
          setCatalogStatus("The catalogue is empty, so a representative match set is shown.");
        }
      })
      .catch(() => {
        if (active) setCatalogStatus("Demo match set shown. Configure Supabase to load the live catalogue.");
      });
    return () => { active = false; };
  }, []);

  if (!isValidSessionId(id) || !session) return <Navigate to="/" replace />;
  if (!session.student) return <Navigate to={`/student/${id}`} replace />;
  if (session.payment?.status !== "success") return <Navigate to={`/checkout/${id}`} replace />;

  const traits = session.student.assessment.psychometric;
  const radarData = [
    { trait: "Analytical", value: traits.analytical },
    { trait: "Creative", value: traits.creative },
    { trait: "Social", value: traits.social },
    { trait: "Practical", value: traits.practical },
    { trait: "Initiative", value: traits.enterprising },
  ];
  const leadMatch = matches[0] ?? fallbackMatches[0]!;

  function toggleCompare(matchId: string) {
    setSelected((current) => current.includes(matchId) ? current.filter((item) => item !== matchId) : current.length < 3 ? [...current, matchId] : current);
  }

  return (
    <>
      <section ref={reportRef} className="min-h-[76vh] bg-slate-50 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mx-auto max-w-7xl">
          <header className="flex flex-col gap-7 border-b border-slate-300 pb-9 lg:flex-row lg:items-end lg:justify-between" data-report-section="overview">
            <div><div className="inline-flex items-center gap-2 bg-mint px-3 py-2 text-xs font-bold tracking-[0.14em] text-forest uppercase"><Sparkles className="size-4" /> Your match report</div><h1 className="mt-5 max-w-3xl font-display text-5xl leading-[1.04] font-bold tracking-tight text-forest sm:text-6xl">A shortlist built for the whole decision.</h1><p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">Fit, affordability and early-career direction—viewed together, not as separate tabs.</p><p className="mt-3 text-sm text-slate-500" role="status">{catalogStatus}</p></div>
            <button type="button" onClick={() => setPdfOpen(true)} className="inline-flex shrink-0 items-center justify-center gap-2 bg-forest px-6 py-4 font-bold text-white hover:bg-leaf"><Download className="size-5" /> Generate PDF Report</button>
          </header>

          <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_0.72fr]" data-report-section="overview">
            <dl className="grid gap-4 sm:grid-cols-3">
              <Metric label="Strongest match" value={`${leadMatch.matchScore}%`} note={leadMatch.name} />
              <Metric label="Budget signal" value={currency.format(leadMatch.tuition)} note="estimated annual tuition" />
              <Metric label="Interest signal" value={session.student.assessment.hobbies[0] ?? "Exploring"} note={`${session.student.assessment.hobbies.length} selected interests`} />
            </dl>
            <div className="border border-slate-200 bg-white p-5">
              <h2 className="font-display text-2xl font-bold text-forest">Strength profile</h2>
              <div className="mt-3 h-60" role="img" aria-label="Radar chart of submitted psychometric traits"><ResponsiveContainer width="100%" height="100%"><RadarChart data={radarData}><PolarGrid /><PolarAngleAxis dataKey="trait" tick={{ fontSize: 11 }} /><Radar dataKey="value" stroke="#247158" fill="#247158" fillOpacity={0.28} /></RadarChart></ResponsiveContainer></div>
            </div>
          </div>

          <section className="mt-10" aria-labelledby="matches-title" data-report-section="matches">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold tracking-[0.14em] text-leaf uppercase">Ranked recommendations</p><h2 id="matches-title" className="mt-1 font-display text-4xl font-bold text-forest">University matches</h2></div><p className="text-sm text-slate-500"><Scale className="mr-1 inline size-4" /> Select up to 3 to compare · {selected.length} selected</p></div>
            <div className="mt-6 grid gap-5 lg:grid-cols-3">{matches.slice(0, 6).map((match, index) => <UniversityCard key={match.id} match={match} rank={index + 1} selected={selected.includes(match.id)} onCompare={() => toggleCompare(match.id)} />)}</div>
          </section>

          {selected.length > 1 && <section className="mt-6 border border-forest bg-mint/60 p-5" aria-live="polite"><h3 className="font-display text-2xl font-bold text-forest">Comparison ready</h3><div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{matches.filter((match) => selected.includes(match.id)).map((match) => <div key={match.id} className="bg-white p-4"><strong className="text-forest">{match.name}</strong><p className="mt-1 text-sm text-slate-600">{match.matchScore}% fit · {currency.format(match.tuition)}/yr</p></div>)}</div></section>}

          <div className="mt-10"><LocationMap locations={matches.map((match) => match.location)} /></div>
          <div className="mt-10 grid gap-6 xl:grid-cols-2" data-report-section="roi"><ROICalculator initialTuition={leadMatch.tuition} initialLivingCost={leadMatch.livingCost} /><CareerProgressionDashboard /></div>

          <section className="mt-10 border border-slate-200 bg-white p-6 sm:p-8" data-report-section="scholarships">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between"><div className="flex gap-4"><span className="grid size-12 shrink-0 place-items-center bg-sun/20 text-amber-800"><Award className="size-6" /></span><div><p className="text-xs font-bold tracking-[0.14em] text-amber-800 uppercase">Next best action</p><h2 className="mt-1 font-display text-3xl font-bold text-forest">{leadMatch.scholarship.title}</h2><p className="mt-2 text-slate-600">Potential value: <strong>{leadMatch.scholarship.value}</strong>. Prepare the evidence before intake applications open.</p></div></div><Link to={`/guide/${leadMatch.scholarship.guideId}`} className="inline-flex shrink-0 items-center justify-center bg-forest px-6 py-3 font-bold text-white hover:bg-leaf">View Details</Link></div>
          </section>
        </div>
      </section>
      <PdfReportDialog open={pdfOpen} onClose={() => setPdfOpen(false)} reportRef={reportRef} sessionId={id} />
    </>
  );
}

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return <div className="border border-slate-200 bg-white p-5"><dt className="text-xs font-bold tracking-[0.12em] text-slate-500 uppercase">{label}</dt><dd className="mt-3 font-display text-3xl font-bold text-forest">{value}</dd><p className="mt-2 line-clamp-2 text-xs text-slate-500">{note}</p></div>;
}

function UniversityCard({ match, rank, selected, onCompare }: { match: UniversityMatch; rank: number; selected: boolean; onCompare: () => void }) {
  return <article className={`relative flex flex-col border bg-white p-6 transition ${selected ? "border-forest ring-2 ring-forest/10" : "border-slate-200"}`}><div className="flex items-start justify-between gap-4"><span className="text-xs font-bold tracking-[0.14em] text-slate-400 uppercase">Match {String(rank).padStart(2, "0")}</span><span className="grid size-14 place-items-center rounded-full border-4 border-mint font-display text-lg font-bold text-forest">{match.matchScore}%</span></div><h3 className="mt-4 font-display text-2xl font-bold text-forest">{match.name}</h3><p className="mt-1 text-sm text-slate-500">{match.location}</p><p className="mt-5 border-l-2 border-sun pl-3 text-sm font-bold leading-6 text-ink">{match.program}</p><ul className="mt-5 space-y-2 text-sm leading-6 text-slate-600">{match.why.map((reason) => <li key={reason} className="flex gap-2"><Check className="mt-1 size-4 shrink-0 text-leaf" />{reason}</li>)}</ul><dl className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-200 pt-4 text-sm"><div><dt className="text-xs text-slate-500">Tuition / yr</dt><dd className="mt-1 font-bold text-forest">{currency.format(match.tuition)}</dd></div><div><dt className="text-xs text-slate-500">Admissions</dt><dd className="mt-1 font-bold text-forest">{match.acceptanceRate}</dd></div></dl><button type="button" onClick={onCompare} aria-pressed={selected} className={`mt-6 w-full border px-4 py-3 text-sm font-bold transition ${selected ? "border-forest bg-forest text-white" : "border-slate-300 text-forest hover:border-forest"}`}>{selected ? "Added to compare" : "Compare"}</button></article>;
}
