import { CookieConsent } from "@repo/ui";
import { useEffect, useMemo, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from "react-router-dom";

import { AuthModal } from "../components/AuthModal";
import { QuickReviewModal } from "../components/QuickReviewModal";
import { ReviewWizard } from "../components/ReviewWizard";
import {
  createLocalReview,
  getCurrentIdentity,
  loadPublishedReviews,
  loadUniversityTargets,
  submitReviewForModeration,
  type ReviewSyncStatus,
} from "../lib/review-data";
import { SEED_REVIEWS } from "../lib/seed-data";
import { loadStoredReviews, saveStoredReviews } from "../lib/storage";
import type { Review, ReviewDraft, ReviewFilters, ReviewIdentity, ReviewTab, UniversityTarget } from "../lib/types";
import { HomePage } from "../routes/HomePage";

type ModalKind = "review" | "quick" | null;

interface PortalPageProps {
  activeTab: ReviewTab;
  filters: ReviewFilters;
  identity: ReviewIdentity | null;
  modal: ModalKind;
  mode: "connected" | "local";
  reviews: Review[];
  universitySelection: { status: "loading" | "ready" | "unavailable"; targets: UniversityTarget[]; message?: string };
  unlocked: boolean;
  onFiltersChange: (filters: ReviewFilters) => void;
  onReviewSubmit: (draft: ReviewDraft) => Promise<{ ok: true; status: ReviewSyncStatus } | { ok: false; message: string }>;
  onSelectTab: (tab: ReviewTab) => void;
  onShowAuth: () => void;
  onUnlock: () => void;
}

function PortalPage(props: PortalPageProps) {
  const navigate = useNavigate();
  const closeRouteModal = () => navigate("/");

  return (
    <>
      <HomePage
        activeTab={props.activeTab}
        filters={props.filters}
        identity={props.identity}
        mode={props.mode}
        reviews={props.reviews}
        unlocked={props.unlocked}
        onFiltersChange={props.onFiltersChange}
        onSelectTab={props.onSelectTab}
        onSignIn={props.onShowAuth}
        onUnlockTruth={() => navigate("/quick-review")}
        onWriteReview={() => navigate("/submit-review")}
      />
      {props.modal === "review" ? <ReviewWizard identity={props.identity} universitySelection={props.universitySelection} onClose={closeRouteModal} onRequireAuth={props.onShowAuth} onSubmit={props.onReviewSubmit} /> : null}
      {props.modal === "quick" ? <QuickReviewModal onClose={closeRouteModal} onUnlock={props.onUnlock} /> : null}
    </>
  );
}

export function PortalRoutes() {
  const navigate = useNavigate();
  const storedReviews = useMemo(() => loadStoredReviews(), []);
  const [localReviews, setLocalReviews] = useState<Review[]>(storedReviews);
  const [publishedReviews, setPublishedReviews] = useState<Review[] | null>(null);
  const [universitySelection, setUniversitySelection] = useState<{
    status: "loading" | "ready" | "unavailable";
    targets: UniversityTarget[];
    message?: string;
  }>({ status: "loading", targets: [] });
  const [filters, setFilters] = useState<ReviewFilters>({ query: "", year: "", rating: 0 });
  const [activeTab, setActiveTab] = useState<ReviewTab>("Reviews");
  const [identity, setIdentity] = useState<ReviewIdentity | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [mode, setMode] = useState<"connected" | "local">("local");

  useEffect(() => {
    let active = true;
    void getCurrentIdentity().then((currentIdentity) => {
      if (active) setIdentity(currentIdentity);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    void loadPublishedReviews().then(({ reviews: cloudReviews, connected }) => {
      if (!active) return;
      setPublishedReviews(connected ? cloudReviews : null);
      setMode(connected ? "connected" : "local");
    });
    void loadUniversityTargets().then((result) => {
      if (!active) return;
      setUniversitySelection(result);
    });
    return () => { active = false; };
  }, []);

  function selectTab(tab: ReviewTab) {
    if (tab === "Unspoken Truths" && !unlocked) {
      navigate("/quick-review");
      return;
    }
    setActiveTab(tab);
  }

  async function submitReview(draft: ReviewDraft) {
    const review = createLocalReview(draft);
    const nextStored = [review, ...loadStoredReviews()];
    const saved = saveStoredReviews(nextStored);
    if (!saved.ok) return saved;
    setLocalReviews((current) => [review, ...current]);
    const status = await submitReviewForModeration(draft);
    setMode(status === "submitted" ? "connected" : "local");
    return { ok: true, status } as const;
  }

  function unlockTruths() {
    setUnlocked(true);
    setActiveTab("Unspoken Truths");
    navigate("/");
  }

  const reviews = [...localReviews, ...(publishedReviews ?? SEED_REVIEWS)];
  const pageProps = {
    activeTab,
    filters,
    identity,
    mode,
    reviews,
    universitySelection,
    unlocked,
    onFiltersChange: setFilters,
    onReviewSubmit: submitReview,
    onSelectTab: selectTab,
    onShowAuth: () => setAuthOpen(true),
    onUnlock: unlockTruths,
  };

  return (
    <>
      <Routes>
        <Route path="/" element={<PortalPage {...pageProps} modal={null} />} />
        <Route path="/submit-review" element={<PortalPage {...pageProps} modal="review" />} />
        <Route path="/quick-review" element={<PortalPage {...pageProps} modal="quick" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {authOpen ? <AuthModal onClose={() => setAuthOpen(false)} /> : null}
    </>
  );
}

export function App() {
  return (
    <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <PortalRoutes />
      <CookieConsent />
    </BrowserRouter>
  );
}
