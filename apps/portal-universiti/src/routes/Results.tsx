import { CheckCircle2, FileText, ShieldAlert, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";

import { getAuthorizedReport, type DemoReport } from "../lib/portal-data";
import { isValidSessionId } from "../lib/storage";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function asText(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function recommendationsFrom(payload: Record<string, unknown>): Array<Record<string, unknown>> {
  const value = payload.recommendations ?? payload.recommendation_results ?? payload.results;
  return Array.isArray(value) ? value.map(asRecord).filter((item): item is Record<string, unknown> => item !== null) : [];
}

function methodDisclosure(payload: Record<string, unknown>): string {
  return asText(payload.method_disclosure) ?? asText(payload.methodology) ?? asText(payload.method) ?? "The report service did not provide a methodology disclosure for this session.";
}

function titleForRecommendation(recommendation: Record<string, unknown>, index: number): string {
  return asText(recommendation.university_name) ?? asText(recommendation.name) ?? asText(recommendation.title) ?? `Server recommendation ${index + 1}`;
}

export function Results() {
  const { id } = useParams();
  const [report, setReport] = useState<DemoReport | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isValidSessionId(id)) return;
    let active = true;
    void getAuthorizedReport(id)
      .then((response) => { if (active) setReport(response); })
      .catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : "The report is not available for this account."); });
    return () => { active = false; };
  }, [id]);

  if (!isValidSessionId(id)) return <Navigate to="/" replace />;
  if (!report && !error) return <section className="grid min-h-[60vh] place-items-center px-4" role="status"><p className="font-bold text-forest">Verifying secure report access…</p></section>;
  if (!report) {
    return <section className="grid min-h-[60vh] place-items-center bg-mist px-4 py-12"><div className="max-w-xl border border-red-200 bg-white p-8 text-center shadow-sm"><ShieldAlert className="mx-auto size-9 text-red-700" /><h1 className="mt-5 font-display text-3xl font-bold text-forest">Report access is unavailable</h1><p className="mt-4 leading-7 text-slate-600">{error}</p><Link to={`/parent/${id}`} className="mt-7 inline-flex bg-forest px-5 py-3 font-bold text-white hover:bg-leaf">Parent sign-in</Link></div></section>;
  }

  const recommendations = recommendationsFrom(report.payload);
  const assessment = asRecord(report.payload.assessment ?? report.payload.student_assessment);
  return (
    <section className="min-h-[76vh] bg-slate-50 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="mx-auto max-w-6xl">
        <header className="border-b border-slate-300 pb-9"><div className="inline-flex items-center gap-2 bg-mint px-3 py-2 text-xs font-bold tracking-[0.14em] text-forest uppercase"><Sparkles className="size-4" /> Free demo report</div><h1 className="mt-5 max-w-3xl font-display text-5xl leading-[1.04] font-bold tracking-tight text-forest sm:text-6xl">Your server-authorized assessment report.</h1><p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">This report is shown only because the report service approved the current account and invitation. It is not unlocked by browser storage or a payment status.</p></header>
        <section className="mt-8 grid gap-5 lg:grid-cols-[1fr_0.65fr]"><div className="border border-slate-200 bg-white p-6"><h2 className="font-display text-2xl font-bold text-forest">Assessment availability</h2>{assessment ? <><p className="mt-3 leading-7 text-slate-600">The report service returned a submitted assessment for this invitation.</p><p className="mt-4 text-sm text-slate-500">Fields returned: {Object.keys(assessment).join(", ") || "none"}</p></> : <p className="mt-3 leading-7 text-slate-600">The report service did not return an assessment summary. No browser draft is substituted.</p>}</div><div className="border border-slate-200 bg-white p-6"><FileText className="size-6 text-leaf" /><h2 className="mt-4 font-display text-2xl font-bold text-forest">Method disclosure</h2><p className="mt-3 text-sm leading-6 text-slate-600">{methodDisclosure(report.payload)}</p></div></section>
        <section className="mt-10"><div className="flex items-end justify-between gap-5"><div><p className="text-xs font-bold tracking-[0.14em] text-leaf uppercase">Server results</p><h2 className="mt-1 font-display text-4xl font-bold text-forest">Recommendations</h2></div><span className="text-sm text-slate-500">{recommendations.length} record{recommendations.length === 1 ? "" : "s"} returned</span></div>{recommendations.length === 0 ? <div className="mt-6 border border-sun/60 bg-[#fffaf0] p-6"><CheckCircle2 className="size-6 text-leaf" /><h3 className="mt-3 text-xl font-bold text-forest">No recommendations are available yet.</h3><p className="mt-2 max-w-2xl leading-7 text-slate-600">This free demo report does not invent a ranked shortlist. Recommendations will appear only after the report service has generated and returned them for this session.</p></div> : <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{recommendations.map((recommendation, index) => <article key={`${titleForRecommendation(recommendation, index)}-${index}`} className="border border-slate-200 bg-white p-5"><p className="text-xs font-bold tracking-[0.14em] text-leaf uppercase">Server recommendation {index + 1}</p><h3 className="mt-2 text-xl font-bold text-forest">{titleForRecommendation(recommendation, index)}</h3>{asText(recommendation.reason) && <p className="mt-3 text-sm leading-6 text-slate-600">{asText(recommendation.reason)}</p>}{typeof recommendation.match_score === "number" && <p className="mt-4 text-sm font-bold text-forest">Server match score: {recommendation.match_score}%</p>}</article>)}</div>}</section>
      </div>
    </section>
  );
}
