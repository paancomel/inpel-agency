import { Lock } from "lucide-react";

import { REVIEW_TABS, type ReviewTab } from "../lib/types";

interface ReviewTabsProps { activeTab: ReviewTab; unlocked: boolean; onSelect: (tab: ReviewTab) => void; }

export function ReviewTabs({ activeTab, unlocked, onSelect }: ReviewTabsProps) {
  return (
    <div className="border-b border-sea-fog bg-white">
      <div className="hide-scrollbar mx-auto flex max-w-7xl gap-7 overflow-x-auto px-4 sm:px-6" role="tablist" aria-label="University review topics">
        {REVIEW_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => onSelect(tab)}
            className={`flex shrink-0 items-center gap-1.5 border-b-2 py-4 text-sm font-bold transition ${activeTab === tab ? "border-tidal-teal text-midnight-harbor" : "border-transparent text-slate-500 hover:text-deep-current"}`}
          >
            {tab}
            {tab === "Unspoken Truths" && !unlocked ? <Lock size={13} aria-hidden="true" /> : null}
          </button>
        ))}
      </div>
    </div>
  );
}
