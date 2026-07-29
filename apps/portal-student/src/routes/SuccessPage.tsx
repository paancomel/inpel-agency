import { ArrowRight, Check, Eye, Layers3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { usePortal } from "../state/usePortal";

export function SuccessPage() {
  const { draft, publishResult } = usePortal();
  const navigate = useNavigate();
  const result = publishResult ?? {
    mode: "demo" as const,
    universityId: "local-draft",
    publishedCourseCount: draft.courses.length,
    publishedGalleryCount: draft.gallery.length,
    publishedAt: new Date().toISOString(),
  };
  const isDemo = result.mode === "demo";

  return (
    <div className="mx-auto max-w-5xl py-5 text-center sm:py-12">
      <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-500 text-white shadow-[0_0_0_12px_rgba(16,185,129,0.12)]"><Check aria-hidden="true" size={38} strokeWidth={3} /></div>
      <p className="eyebrow mt-9">{isDemo ? "Preview only" : "Publication complete"}</p>
      <h2 className="mx-auto mt-3 max-w-2xl font-display text-4xl leading-tight text-navy sm:text-5xl">{isDemo ? "Your institution draft is ready for review." : "Your institution data is ready for discovery."}</h2>
      <p className="mx-auto mt-5 max-w-2xl leading-7 text-slate-600">{isDemo ? "No live institution record, programme, or asset was published from this preview." : "The latest approved profile and programme catalogue have been processed by the INPELER publishing flow."}</p>
      {isDemo ? <p className="mx-auto mt-4 max-w-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">Local preview mode: configure the shared Supabase environment to publish live records.</p> : null}

      <dl className="mt-10 grid gap-4 text-left sm:grid-cols-3">
        <div className="metric-card"><dt><Layers3 aria-hidden="true" size={18} /> {isDemo ? "Programmes in draft" : "Programmes live"}</dt><dd>{result.publishedCourseCount}</dd></div>
        <div className="metric-card"><dt><Eye aria-hidden="true" size={18} /> {isDemo ? "Gallery assets in draft" : "Gallery assets"}</dt><dd>{result.publishedGalleryCount}</dd></div>
        <div className="metric-card"><dt><Check aria-hidden="true" size={18} /> Profile status</dt><dd className="text-2xl">{isDemo ? "Not published" : "Current"}</dd></div>
      </dl>

      <p className="mt-6 text-xs text-slate-400">{isDemo ? "Previewed" : "Published"} {new Intl.DateTimeFormat("en-MY", { dateStyle: "medium", timeStyle: "short" }).format(new Date(result.publishedAt))}</p>
      <button className="primary-button mt-9" onClick={() => navigate("/dashboard/global-profile")} type="button">Return to Admin Dashboard <ArrowRight aria-hidden="true" size={18} /></button>
    </div>
  );
}
