import { LockKeyhole, MessageCircle, Sparkles, Star, ThumbsUp } from "lucide-react";

import type { Review } from "../lib/types";

interface ReviewCardProps {
  review: Review;
  onUnlockTruth: () => void;
}

const LOCKED_TRUTH_COPY = [
  "The part nobody mentions until orientation is over: the unofficial rules shape your semester more than the handbook does.",
  "Students learn which promises hold up, what quietly changes, and what they wish someone had told them before enrolling.",
];

export function ReviewCard({ review, onUnlockTruth }: ReviewCardProps) {
  const truthHeadingId = `unspoken-truth-${review.id}`;

  return (
    <article className="rounded-[24px] border border-sea-fog bg-white p-5 shadow-sm sm:p-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-bold text-midnight-harbor">
            {review.authorLabel}
          </div>
          <p className="mt-1 text-sm text-slate-500">{review.course} · {review.year}</p>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-sun-paper/30 px-3 py-1.5 font-bold text-midnight-harbor" aria-label={`${review.rating} out of 5 stars`}>
          <Star size={15} fill="currentColor" aria-hidden="true" /> {review.rating}.0
        </div>
      </header>

      <blockquote className="mt-5 border-l-4 border-coral-note pl-4 text-lg font-bold leading-snug text-ink">“{review.spillTheTea}”</blockquote>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <section className="rounded-xl bg-ice-tint p-3"><h3 className="text-xs font-bold uppercase tracking-wider text-tidal-teal">Green flags</h3><p className="mt-1.5 text-sm leading-relaxed">{review.greenFlags || "Nothing added."}</p></section>
        <section className="rounded-xl bg-coral-note/10 p-3"><h3 className="text-xs font-bold uppercase tracking-wider text-red-700">Red flags</h3><p className="mt-1.5 text-sm leading-relaxed">{review.redFlags || "Nothing added."}</p></section>
      </div>

      <section
        aria-labelledby={truthHeadingId}
        className="mt-3 overflow-hidden rounded-2xl border border-sky-100 bg-slate-100/90 p-4 sm:p-5"
      >
        <header className="flex items-center justify-between gap-3">
          <h3
            id={truthHeadingId}
            className="flex min-w-0 items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-deep-current"
          >
            <Sparkles className="shrink-0 text-blue-600" size={17} aria-hidden="true" />
            <span>The Unspoken Truth</span>
          </h3>
          <span className="shrink-0 rounded-full bg-slate-200 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
            Locked
          </span>
        </header>

        <div className="relative mt-3 min-h-32 overflow-hidden rounded-xl sm:min-h-28">
          <div
            aria-hidden="true"
            className="select-none space-y-2 bg-slate-400 bg-clip-text px-1 text-sm leading-relaxed text-transparent filter blur-md"
          >
            {LOCKED_TRUTH_COPY.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-white/20 px-3">
            <div className="rounded-full bg-white/60 p-2 shadow-sm backdrop-blur-sm">
              <button
                type="button"
                onClick={onUnlockTruth}
                className="flex min-h-11 items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-2.5 text-sm font-extrabold text-white shadow-md shadow-blue-900/20 transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 active:translate-y-px sm:px-5"
              >
                <LockKeyhole size={16} aria-hidden="true" />
                Contribute to Unlock
              </button>
            </div>
          </div>
        </div>
      </section>

      <ul className="mt-4 flex flex-wrap gap-2" aria-label="Campus vibe tags">
        {review.vibeTags.map((tag) => <li key={tag} className="rounded-full border border-sea-fog px-3 py-1 text-xs font-bold text-deep-current">#{tag}</li>)}
      </ul>

      {review.comments.length > 0 ? (
        <section className="mt-5 border-t border-sea-fog pt-4" aria-label="Comments">
          {review.comments.map((comment) => <p key={comment.id} className="text-sm"><strong>{comment.authorLabel}:</strong> {comment.text}</p>)}
        </section>
      ) : null}

      <footer className="mt-5 flex items-center gap-2 border-t border-sea-fog pt-4">
        <button type="button" disabled title="Helpful votes are not available yet." className="flex cursor-not-allowed items-center gap-2 rounded-full px-3 py-2 text-sm font-bold text-slate-400"><ThumbsUp size={16} aria-hidden="true" /> Helpful ({review.likesCount})</button>
        <button type="button" disabled title="Comments are not available yet." className="flex cursor-not-allowed items-center gap-2 rounded-full px-3 py-2 text-sm font-bold text-slate-400"><MessageCircle size={16} aria-hidden="true" /> Comment</button>
      </footer>
    </article>
  );
}
