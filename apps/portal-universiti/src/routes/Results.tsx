import { CheckCircle2, Database, FileText, ShieldAlert, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";

import { t, useLanguage } from "../lib/language";
import { getAuthorizedReport, getSharedCatalog, type DemoReport, type SharedCatalog } from "../lib/portal-data";
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
  const { language } = useLanguage();
  const tr = (ms: string, en: string, ta: string, zh: string) => t(language, { ms, en, ta, "zh-CN": zh });
  const { id } = useParams();
  const [report, setReport] = useState<DemoReport | null>(null);
  const [error, setError] = useState("");
  const [catalog, setCatalog] = useState<SharedCatalog | null>(null);
  const [catalogError, setCatalogError] = useState("");

  useEffect(() => {
    if (!isValidSessionId(id)) return;
    let active = true;
    void getAuthorizedReport(id)
      .then((response) => { if (active) setReport(response); })
      .catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : "The report is not available for this account."); });
    void getSharedCatalog()
      .then((response) => { if (active) setCatalog(response); })
      .catch((reason) => { if (active) setCatalogError(reason instanceof Error ? reason.message : "Shared university catalogue is unavailable."); });
    return () => { active = false; };
  }, [id]);

  if (!isValidSessionId(id)) return <Navigate to="/" replace />;
  if (!report && !error) return <section className="grid min-h-[60vh] place-items-center px-4" role="status"><p className="font-bold text-forest">Verifying secure report access…</p></section>;
  if (!report) {
    return <section className="grid min-h-[60vh] place-items-center bg-mist px-4 py-12"><div className="max-w-xl border border-red-200 bg-white p-8 text-center shadow-sm"><ShieldAlert className="mx-auto size-9 text-red-700" /><h1 className="mt-5 font-display text-3xl font-bold text-forest">{tr("Akses laporan tidak tersedia", "Report access is unavailable", "அறிக்கை அணுகல் கிடைக்கவில்லை", "报告暂时无法访问")}</h1><p className="mt-4 leading-7 text-slate-600">{error}</p><Link to={`/parent/${id}`} className="mt-7 inline-flex bg-forest px-5 py-3 font-bold text-white hover:bg-leaf">{tr("Log masuk ibu bapa", "Parent sign-in", "பெற்றோர் உள்நுழைவு", "家长登录")}</Link></div></section>;
  }

  const recommendations = recommendationsFrom(report.payload);
  const assessment = asRecord(report.payload.assessment ?? report.payload.student_assessment);
  return (
    <section className="min-h-[76vh] bg-slate-50 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="mx-auto max-w-6xl">
        <header className="border-b border-slate-300 pb-9"><div className="inline-flex items-center gap-2 bg-mint px-3 py-2 text-xs font-bold tracking-[0.14em] text-forest uppercase"><Sparkles className="size-4" /> {tr("Laporan demo percuma", "Free demo report", "இலவச மாதிரி அறிக்கை", "免费演示报告")}</div><h1 className="mt-5 max-w-3xl font-display text-5xl leading-[1.04] font-bold tracking-tight text-forest sm:text-6xl">{tr("Laporan penilaian anda yang diluluskan pelayan.", "Your server-authorized assessment report.", "சேவையகம் அங்கீகரித்த உங்கள் மதிப்பீட்டு அறிக்கை.", "经服务器授权的评估报告。")}</h1><p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">{tr("Laporan ini hanya dipaparkan selepas perkhidmatan laporan meluluskan akaun dan jemputan semasa.", "This report is shown only because the report service approved the current account and invitation.", "தற்போதைய கணக்கும் அழைப்பும் அங்கீகரிக்கப்பட்டதால் மட்டுமே இந்த அறிக்கை காட்டப்படுகிறது.", "只有报告服务批准当前账户和邀请后，才会显示此报告。")}</p></header>
        <section className="mt-8 grid gap-5 lg:grid-cols-[1fr_0.65fr]"><div className="border border-slate-200 bg-white p-6"><h2 className="font-display text-2xl font-bold text-forest">Assessment availability</h2>{assessment ? <><p className="mt-3 leading-7 text-slate-600">The report service returned a submitted assessment for this invitation.</p><p className="mt-4 text-sm text-slate-500">Fields returned: {Object.keys(assessment).join(", ") || "none"}</p></> : <p className="mt-3 leading-7 text-slate-600">The report service did not return an assessment summary. No browser draft is substituted.</p>}</div><div className="border border-slate-200 bg-white p-6"><FileText className="size-6 text-leaf" /><h2 className="mt-4 font-display text-2xl font-bold text-forest">Method disclosure</h2><p className="mt-3 text-sm leading-6 text-slate-600">{methodDisclosure(report.payload)}</p></div></section>
        <section className="mt-10"><div className="flex items-end justify-between gap-5"><div><p className="text-xs font-bold tracking-[0.14em] text-leaf uppercase">Server results</p><h2 className="mt-1 font-display text-4xl font-bold text-forest">Recommendations</h2></div><span className="text-sm text-slate-500">{recommendations.length} record{recommendations.length === 1 ? "" : "s"} returned</span></div>{recommendations.length === 0 ? <div className="mt-6 border border-sun/60 bg-[#fffaf0] p-6"><CheckCircle2 className="size-6 text-leaf" /><h3 className="mt-3 text-xl font-bold text-forest">No recommendations are available yet.</h3><p className="mt-2 max-w-2xl leading-7 text-slate-600">This free demo report does not invent a ranked shortlist. Recommendations will appear only after the report service has generated and returned them for this session.</p></div> : <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{recommendations.map((recommendation, index) => <article key={`${titleForRecommendation(recommendation, index)}-${index}`} className="border border-slate-200 bg-white p-5"><p className="text-xs font-bold tracking-[0.14em] text-leaf uppercase">Server recommendation {index + 1}</p><h3 className="mt-2 text-xl font-bold text-forest">{titleForRecommendation(recommendation, index)}</h3>{asText(recommendation.reason) && <p className="mt-3 text-sm leading-6 text-slate-600">{asText(recommendation.reason)}</p>}{typeof recommendation.match_score === "number" && <p className="mt-4 text-sm font-bold text-forest">Server match score: {recommendation.match_score}%</p>}</article>)}</div>}</section>
        <section className="mt-12 border-t border-slate-300 pt-9" aria-labelledby="shared-catalog-heading">
          <div className="flex items-start gap-3">
            <Database className="mt-1 size-6 shrink-0 text-leaf" />
            <div>
              <p className="text-xs font-bold tracking-[0.14em] text-leaf uppercase">Shared live catalogue</p>
              <h2 id="shared-catalog-heading" className="mt-1 font-display text-3xl font-bold text-forest">Institutions and accredited programme records</h2>
              <p className="mt-2 max-w-3xl leading-7 text-slate-600">These records are read from the same Supabase catalogue used by INPELER and INPOLOR. They are reference data, not generated recommendations.</p>
            </div>
          </div>
          {!catalog && !catalogError && <p className="mt-6 font-bold text-slate-600" role="status">Loading shared catalogue…</p>}
          {!catalog && catalogError && <div className="mt-6 border border-red-200 bg-white p-6"><h3 className="font-bold text-red-800">Shared catalogue is unavailable</h3><p className="mt-2 leading-7 text-slate-600">{catalogError} No sample university or programme data has been substituted.</p></div>}
          {catalog && <>
            <p className="mt-6 text-sm text-slate-600">{catalog.institutions.length} institution records loaded · {catalog.programmes.length} programme records shown</p>
            {catalog.institutions.length === 0 && catalog.programmes.length === 0 ? <div className="mt-5 border border-slate-200 bg-white p-6"><h3 className="font-bold text-forest">The shared catalogue has no published records.</h3><p className="mt-2 text-slate-600">No local or sample records are displayed.</p></div> : <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{catalog.programmes.slice(0, 12).map((programme) => <article key={programme.canonicalRecordId} className="border border-slate-200 bg-white p-5"><p className="text-xs font-bold tracking-wide text-leaf uppercase">NEC {programme.necCode} · {programme.necBroadArea}</p><h3 className="mt-2 text-lg font-bold text-forest">{programme.qualificationName}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{programme.institutionName}</p><dl className="mt-4 grid gap-2 text-xs text-slate-500"><div><dt className="inline font-bold">Reference: </dt><dd className="inline">{programme.referenceNo}</dd></div><div><dt className="inline font-bold">Classification: </dt><dd className="inline">{programme.necDescription}</dd></div></dl></article>)}</div>}
          </>}
        </section>
      </div>
    </section>
  );
}
