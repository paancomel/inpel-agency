import { Star } from "lucide-react";

interface StarRatingProps { value: number; onChange: (value: number) => void; }

export function StarRating({ value, onChange }: StarRatingProps) {
  return (
    <div className="flex gap-1" role="group" aria-label="Overall rating">
      {[1, 2, 3, 4, 5].map((rating) => (
        <button key={rating} type="button" onClick={() => onChange(rating)} aria-label={`Rate ${rating} out of 5`} aria-pressed={value === rating} className={`rounded-lg p-1 transition hover:scale-110 ${rating <= value ? "text-sun-paper" : "text-slate-300"}`}>
          <Star size={30} fill="currentColor" aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}
