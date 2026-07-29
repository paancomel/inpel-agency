import { SearchX } from "lucide-react";

import type { Review, ReviewFilters, ReviewTab } from "../lib/types";
import { FilterBar } from "./FilterBar";
import { ReviewCard } from "./ReviewCard";

interface ReviewFeedProps {
  reviews: Review[];
  filters: ReviewFilters;
  activeTab: ReviewTab;
  onFiltersChange: (filters: ReviewFilters) => void;
  onUnlockTruth: () => void;
}

const TOPIC_HEADINGS: Record<ReviewTab, string> = {
  Reviews: "Reviews from students, not brochures.",
  Tuition: "What students say about tuition.",
  "Campus Life": "Campus life, without the highlight reel.",
  Academics: "The real academic experience.",
  "Unspoken Truths": "The truths students share after hours.",
};

export function ReviewFeed({ reviews, filters, activeTab, onFiltersChange, onUnlockTruth }: ReviewFeedProps) {
  const query = filters.query.trim().toLowerCase();
  const filtered = reviews.filter((review) => {
    const matchesQuery = !query || [review.course, review.spillTheTea, review.greenFlags, review.redFlags, ...review.vibeTags].join(" ").toLowerCase().includes(query);
    return matchesQuery && (!filters.year || review.year === filters.year) && (!filters.rating || review.rating >= filters.rating);
  });

  return (
    <div className="space-y-4">
      <FilterBar filters={filters} onChange={onFiltersChange} />
      <div className="flex items-baseline justify-between gap-3 pt-3"><h2 className="font-display text-2xl tracking-tight">{TOPIC_HEADINGS[activeTab]}</h2><span className="shrink-0 text-sm text-slate-500">{filtered.length} stories</span></div>
      {filtered.length ? (
        <div className="space-y-4">{filtered.map((review) => <ReviewCard key={review.id} review={review} onUnlockTruth={onUnlockTruth} />)}</div>
      ) : (
        <section className="rounded-[24px] border border-dashed border-sea-fog bg-white px-6 py-14 text-center" role="status">
          <SearchX className="mx-auto text-tidal-teal" size={34} aria-hidden="true" />
          <h3 className="mt-4 font-display text-xl">No reviews match that search</h3>
          <p className="mt-2 text-sm text-slate-500">Try another course, year, or rating.</p>
          <button type="button" onClick={() => onFiltersChange({ query: "", year: "", rating: 0 })} className="mt-5 rounded-full bg-midnight-harbor px-4 py-2 text-sm font-bold text-white">Clear filters</button>
        </section>
      )}
    </div>
  );
}
