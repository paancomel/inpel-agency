import { CookieConsent } from "@repo/ui";
import { useEffect, useMemo, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useSearchParams } from "react-router-dom";
import { AuthModal } from "../components/AuthModal";
import { AccountPage, ComparePage, DirectoryPage, SavedPage, SiteShell, UniversityPage } from "../components/PortalExperience";
import { ReviewWizard } from "../components/ReviewWizard";
import { loadCloudSaves, loadCommunityDirectory, setCloudSave } from "../lib/community-data";
import { completeCommunityOnboarding, createLocalReview, getCurrentIdentity, loadUniversityTargets, submitReviewForModeration, type ReviewSyncStatus } from "../lib/review-data";
import { UNIVERSITIES } from "../lib/seed-data";
import { loadStoredReviews, saveStoredReviews } from "../lib/storage";
import type { Review, ReviewDraft, ReviewIdentity, University, UniversityTarget } from "../lib/types";

function ReviewRoute({ identity, targets, onAuth, onSubmit }: { identity: ReviewIdentity | null; targets: UniversityTarget[]; onAuth: () => void; onSubmit: (draft: ReviewDraft) => Promise<{ ok: true; status: ReviewSyncStatus } | { ok: false; message: string }> }) { const [params] = useSearchParams(); const initialUniversityId = params.get("university"); return <ReviewWizard identity={identity} universities={targets} {...(initialUniversityId ? { initialUniversityId } : {})} onRequireAuth={onAuth} onSubmit={onSubmit} />; }

export function PortalRoutes() {
  const [identity, setIdentity] = useState<ReviewIdentity | null>(null); const [authOpen, setAuthOpen] = useState(false);
  const [localReviews, setLocalReviews] = useState<Review[]>(() => loadStoredReviews()); const [cloudReviews, setCloudReviews] = useState<Review[]>([]);
  const [universities, setUniversities] = useState<University[]>(() => import.meta.env.MODE === "test" ? UNIVERSITIES : []); const [directoryMessage, setDirectoryMessage] = useState<string | null>(null);
  const [targets, setTargets] = useState<UniversityTarget[]>(() => import.meta.env.MODE === "test" ? UNIVERSITIES : []); const [saved, setSaved] = useState<string[]>([]); const [compare, setCompare] = useState<string[]>([]);
  useEffect(() => {
    void getCurrentIdentity().then(setIdentity);
    void loadCommunityDirectory().then((result) => { if (result.universities.length) setUniversities(result.universities); setCloudReviews(result.reviews); setDirectoryMessage(result.message); });
    void loadUniversityTargets().then((result) => { if (result.status === "ready") setTargets(result.targets); });
    let unsubscribe: (() => void) | undefined;
    if (import.meta.env.MODE !== "test") void import("@repo/database").then(({ supabase }) => { const listener = supabase.auth.onAuthStateChange((_event, session) => { const user = session?.user; setIdentity(user?.email ? { userId: user.id, email: user.email } : null); if (!user) setSaved([]); }); unsubscribe = () => listener.data.subscription.unsubscribe(); });
    return () => unsubscribe?.();
  }, []);
  useEffect(() => { if (!identity) return; void completeCommunityOnboarding().catch(() => undefined); void loadCloudSaves(identity.userId).then(setSaved).catch(() => setSaved([])); }, [identity]);
  const reviews = useMemo(() => cloudReviews, [cloudReviews]);
  async function toggleSaved(id: string) { if (!identity) { setAuthOpen(true); return; } const active = !saved.includes(id); const kind = universities.some((item) => item.id === id) ? "university" : "review"; setSaved((current) => active ? [...current, id] : current.filter((item) => item !== id)); try { await setCloudSave(kind, id, identity.userId, active); } catch { setSaved((current) => active ? current.filter((item) => item !== id) : [...current, id]); } }
  const handleToggleSaved = (id: string) => { void toggleSaved(id); };
  function toggleCompare(id: string) { if (!identity) { setAuthOpen(true); return; } setCompare((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length >= 3 ? [...current.slice(1), id] : [...current, id]); }
  async function submitReview(draft: ReviewDraft) { const status = await submitReviewForModeration(draft); if (status !== "submitted") return { ok: false, message: "We could not send your review securely. Your draft is still saved—please try again." } as const; const review = createLocalReview(draft); const next = [review, ...loadStoredReviews()]; const stored = saveStoredReviews(next); if (!stored.ok) return stored; setLocalReviews((current) => [review, ...current]); return { ok: true, status } as const; }
  const shellProps = { identity, saved, compare, onAuth: () => setAuthOpen(true), onToggleSaved: handleToggleSaved, onToggleCompare: toggleCompare };
  return <><SiteShell {...shellProps}><Routes><Route path="/" element={<DirectoryPage universities={universities} message={directoryMessage} saved={saved} compare={compare} onToggleSaved={handleToggleSaved} onToggleCompare={toggleCompare} />} /><Route path="/universities/:id" element={<UniversityPage universities={universities} reviews={reviews} saved={saved} compare={compare} onToggleSaved={handleToggleSaved} onToggleCompare={toggleCompare} />} /><Route path="/compare" element={identity ? <ComparePage universities={universities} compare={compare} onToggleCompare={toggleCompare} /> : <Navigate to="/" replace />} /><Route path="/saved" element={<SavedPage universities={universities} reviews={reviews} saved={saved} />} /><Route path="/account/reviews" element={<AccountPage identity={identity} reviews={localReviews} />} /><Route path="/submit-review" element={<ReviewRoute identity={identity} targets={targets} onAuth={() => setAuthOpen(true)} onSubmit={submitReview} />} /><Route path="*" element={<Navigate to="/" replace />} /></Routes></SiteShell>{authOpen ? <AuthModal onClose={() => setAuthOpen(false)} /> : null}</>;
}

export function App() { return <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}><PortalRoutes /><CookieConsent /></BrowserRouter>; }
