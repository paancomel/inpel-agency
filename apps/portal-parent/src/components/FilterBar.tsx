import { Search, SlidersHorizontal } from "lucide-react";

import { STUDY_YEARS, type ReviewFilters } from "../lib/types";

interface FilterBarProps { filters: ReviewFilters; onChange: (filters: ReviewFilters) => void; }

export function FilterBar({ filters, onChange }: FilterBarProps) {
  return (
    <section className="rounded-2xl border border-sea-fog bg-ice-tint p-4" aria-label="Review filters">
      <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-deep-current"><SlidersHorizontal size={15} aria-hidden="true" /> Find your people</div>
      <div className="grid gap-3 md:grid-cols-[1fr_10rem_9rem]">
        <label className="relative">
          <span className="sr-only">Search reviews</span>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} aria-hidden="true" />
          <input type="search" aria-label="Search reviews" value={filters.query} onChange={(event) => onChange({ ...filters, query: event.target.value })} placeholder="Search course or keyword" className="w-full rounded-xl border border-sea-fog bg-white py-2.5 pl-10 pr-3 text-sm focus:border-tidal-teal focus:outline-none" />
        </label>
        <label><span className="sr-only">Filter by year</span><select aria-label="Filter by year" value={filters.year} onChange={(event) => onChange({ ...filters, year: event.target.value })} className="w-full rounded-xl border border-sea-fog bg-white px-3 py-2.5 text-sm focus:border-tidal-teal focus:outline-none"><option value="">All years</option>{STUDY_YEARS.map((year) => <option key={year}>{year}</option>)}</select></label>
        <label><span className="sr-only">Filter by rating</span><select aria-label="Filter by rating" value={filters.rating} onChange={(event) => onChange({ ...filters, rating: Number(event.target.value) })} className="w-full rounded-xl border border-sea-fog bg-white px-3 py-2.5 text-sm focus:border-tidal-teal focus:outline-none"><option value={0}>Any rating</option><option value={5}>5 stars</option><option value={4}>4+ stars</option><option value={3}>3+ stars</option></select></label>
      </div>
    </section>
  );
}
