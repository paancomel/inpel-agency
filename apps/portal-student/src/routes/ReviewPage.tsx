import { Building2, CheckCircle2, Image, LoaderCircle, Pencil, Send } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { ToastNotification } from "../components/ToastNotification";
import { publishPortalDraft } from "../lib/database";
import { canUseInstitutionDemo } from "../lib/runtime";
import { courseSchema, getPublishBlockers, universityProfileSchema } from "../lib/validation";
import { usePortal } from "../state/usePortal";
import { FACILITIES, type FacilityKey, type PublishResult } from "../types/portal";

function DisplayValue({ value }: { value: string }) {
  return value ? <span className="text-slate-800">{value}</span> : <span className="italic text-slate-400">Not Specified</span>;
}

function createDemoResult(courseCount: number, galleryCount: number): PublishResult {
  return {
    mode: "demo",
    universityId: "demo-university",
    publishedCourseCount: courseCount,
    publishedGalleryCount: galleryCount,
    publishedAt: new Date().toISOString(),
  };
}

export function ReviewPage() {
  const { clearPendingAssets, draft, pendingAssets, setFacilityImage, setPublishResult, updateProfile } = usePortal();
  const navigate = useNavigate();
  const [isAttested, setAttested] = useState(false);
  const [isPublishing, setPublishing] = useState(false);
  const [blockers, setBlockers] = useState<string[]>([]);
  const [publishError, setPublishError] = useState<string | null>(null);

  async function handlePublish() {
    if (isPublishing) return;

    const nextBlockers = getPublishBlockers(draft.courses, isAttested);
    const profileResult = universityProfileSchema.safeParse(draft.profile);
    if (!profileResult.success) {
      nextBlockers.push("Complete the required institution profile fields before publishing.");
    }
    if (draft.courses.some((course) => !courseSchema.safeParse(course).success)) {
      nextBlockers.push("Review programme accreditation and required fields before publishing.");
    }

    setBlockers(nextBlockers);
    setPublishError(null);
    if (nextBlockers.length > 0) return;

    setPublishing(true);
    try {
      const result = await publishPortalDraft(draft, pendingAssets);
      if (result.logoUrl) updateProfile({ logoUrl: result.logoUrl });
      for (const [facility, imageUrl] of Object.entries(result.facilityImageUrls ?? {})) {
        if (imageUrl) setFacilityImage(facility as FacilityKey, imageUrl);
      }
      clearPendingAssets();
      setPublishResult(result);
      navigate("/dashboard/success");
    } catch (error) {
      if (
            canUseInstitutionDemo() &&
        error instanceof Error &&
        error.name === "SupabaseConfigurationError"
      ) {
        await new Promise((resolve) => setTimeout(resolve, 650));
        setPublishResult(createDemoResult(draft.courses.length, draft.gallery.length));
        navigate("/dashboard/success");
      } else {
        setPublishError(error instanceof Error ? error.message : "Publishing failed. Please try again.");
      }
    } finally {
      setPublishing(false);
    }
  }

  const enabledFacilities = FACILITIES.filter((facility) => draft.facilities[facility.key]).map((facility) => facility.label);

  return (
    <div className="mx-auto max-w-6xl">
      {publishError ? <ToastNotification message={publishError} onDismiss={() => setPublishError(null)} tone="error" /> : null}
      <div className="max-w-3xl"><p className="eyebrow">Final checkpoint</p><h2 className="page-title">Review and publish</h2><p className="page-intro">Confirm every public-facing detail. Empty optional values are marked clearly so omissions are never mistaken for saved data.</p></div>

      <div className="mt-9 grid gap-7 lg:grid-cols-[1fr_19rem]">
        <div className="space-y-6">
          <section className="review-card" aria-labelledby="review-profile"><div className="review-card-header"><div className="flex items-center gap-3"><span className="review-icon"><Building2 aria-hidden="true" size={19} /></span><h3 id="review-profile">Global profile</h3></div><Link className="edit-link" to="/dashboard/global-profile"><Pencil aria-hidden="true" size={15} /> Edit</Link></div><dl className="grid gap-x-8 gap-y-5 p-6 sm:grid-cols-2"><div><dt>Institution</dt><dd><DisplayValue value={draft.profile.name} /></dd></div><div><dt>Location</dt><dd><DisplayValue value={draft.profile.location} /></dd></div><div className="sm:col-span-2"><dt>Address</dt><dd><DisplayValue value={draft.profile.address} /></dd></div><div><dt>Website</dt><dd><DisplayValue value={draft.profile.website} /></dd></div><div><dt>Contact email</dt><dd><DisplayValue value={draft.profile.contactEmail} /></dd></div><div><dt>Annual tuition</dt><dd><DisplayValue value={draft.profile.tuitionFees ? `RM ${Number(draft.profile.tuitionFees).toLocaleString("en-MY")}` : ""} /></dd></div><div><dt>Acceptance rate</dt><dd><DisplayValue value={draft.profile.acceptanceRate ? `${draft.profile.acceptanceRate}%` : ""} /></dd></div><div className="sm:col-span-2"><dt>Facilities</dt><dd>{enabledFacilities.length > 0 ? enabledFacilities.join(", ") : <span className="italic text-slate-400">Empty</span>}</dd></div></dl></section>

          <section className="review-card" aria-labelledby="review-gallery"><div className="review-card-header"><div className="flex items-center gap-3"><span className="review-icon"><Image aria-hidden="true" size={19} /></span><h3 id="review-gallery">Gallery</h3></div><Link className="edit-link" to="/dashboard/global-profile"><Pencil aria-hidden="true" size={15} /> Edit</Link></div>{draft.gallery.length === 0 ? <p className="p-6 italic text-slate-400">Empty</p> : <ul className="grid gap-3 p-6 sm:grid-cols-2">{draft.gallery.map((image) => <li className="flex items-center gap-3 border border-frost p-3" key={image.id}><img alt="" className="h-12 w-16 object-cover" src={image.previewUrl} /><div className="min-w-0"><p className="truncate text-sm font-bold">{image.category || "Not Specified"}</p><p className="truncate text-xs text-slate-400">{image.previewUrl}</p></div></li>)}</ul>}</section>

          <section className="review-card" aria-labelledby="review-programmes"><div className="review-card-header"><div className="flex items-center gap-3"><span className="review-icon"><CheckCircle2 aria-hidden="true" size={19} /></span><h3 id="review-programmes">Programmes</h3></div><Link className="edit-link" to="/dashboard/courses"><Pencil aria-hidden="true" size={15} /> Edit</Link></div>{draft.courses.length === 0 ? <p className="p-6 italic text-slate-400">Empty</p> : <ul className="divide-y divide-frost">{draft.courses.map((course) => <li className="p-6" key={course.id}><div className="flex flex-wrap items-start justify-between gap-3"><div><h4 className="font-bold text-navy">{course.name}</h4><p className="mt-1 text-sm text-slate-500">{course.facultySchool} · {course.mqaCode}</p></div><span className="bg-mist px-3 py-1 text-xs font-bold text-slate-600">{course.totalBaseTuitionFee ? `RM ${Number(course.totalBaseTuitionFee).toLocaleString("en-MY")}` : "Fee Not Specified"}</span></div><p className="mt-3 text-sm leading-6 text-slate-600"><DisplayValue value={course.minimumEntryRequirements} /></p></li>)}</ul>}</section>
        </div>

        <aside className="h-fit border border-frost bg-white p-5 lg:sticky lg:top-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-coral">Publish readiness</p>
          <h3 className="mt-2 text-xl font-bold text-navy">Accuracy attestation</h3>
          <p className="mt-3 text-sm leading-6 text-slate-500">Publication makes this information visible to students. Confirm it is approved and current.</p>
          <label className="mt-5 flex cursor-pointer items-start gap-3 border border-slate-200 bg-mist/50 p-4"><input checked={isAttested} className="mt-0.5 h-4 w-4 accent-coral" onChange={(event) => { setAttested(event.target.checked); setBlockers([]); }} type="checkbox" /><span className="text-sm font-semibold leading-6 text-slate-700">Institution Accuracy Attestation</span></label>
          {blockers.length > 0 ? <div className="mt-4" role="alert"><p className="text-sm font-bold text-rose-800">Publishing is not ready:</p><ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-5 text-rose-700">{blockers.map((blocker) => <li key={blocker}>{blocker}</li>)}</ul></div> : null}
          <button className="primary-button mt-5 w-full" disabled={isPublishing} onClick={() => void handlePublish()} type="button">{isPublishing ? <><LoaderCircle aria-hidden="true" className="animate-spin" size={18} /> Publishing…</> : <><Send aria-hidden="true" size={18} /> Publish to INPELER PORTAL</>}</button>
          <p className="mt-3 text-center text-xs text-slate-400">Double-submission protection is active.</p>
        </aside>
      </div>
    </div>
  );
}
