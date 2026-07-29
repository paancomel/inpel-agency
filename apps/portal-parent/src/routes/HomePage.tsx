import type { Review, ReviewFilters, ReviewIdentity, ReviewTab } from "../lib/types";
import { Navbar } from "../components/Navbar";
import { ReviewFeed } from "../components/ReviewFeed";
import { ReviewTabs } from "../components/ReviewTabs";
import { Sidebar } from "../components/Sidebar";
import { UniversityHeader } from "../components/UniversityHeader";

interface HomePageProps {
  activeTab: ReviewTab;
  filters: ReviewFilters;
  identity: ReviewIdentity | null;
  mode: "connected" | "local";
  reviews: Review[];
  unlocked: boolean;
  onFiltersChange: (filters: ReviewFilters) => void;
  onSelectTab: (tab: ReviewTab) => void;
  onSignIn: () => void;
  onUnlockTruth: () => void;
  onWriteReview: () => void;
}

export function HomePage(props: HomePageProps) {
  return (
    <div className="min-h-screen bg-warm-shell">
      <Navbar identity={props.identity} onSignIn={props.onSignIn} onWriteReview={props.onWriteReview} />
      <UniversityHeader mode={props.mode} />
      <ReviewTabs activeTab={props.activeTab} unlocked={props.unlocked} onSelect={props.onSelectTab} />
      <main className="mx-auto grid max-w-7xl gap-7 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start lg:py-10">
        <ReviewFeed activeTab={props.activeTab} reviews={props.reviews} filters={props.filters} onFiltersChange={props.onFiltersChange} onUnlockTruth={props.onUnlockTruth} />
        <div className="lg:sticky lg:top-24"><Sidebar /></div>
      </main>
      <footer className="border-t border-sea-fog bg-white px-4 py-8 text-center text-sm text-slate-500">INPOLOR · Honest student voices, handled with care.</footer>
    </div>
  );
}
