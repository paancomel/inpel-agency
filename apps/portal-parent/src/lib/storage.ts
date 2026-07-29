import { STUDY_YEARS, type Review, type ReviewComment } from "./types";

const STORAGE_KEY = "inpolor:reviews:v1";
const SAVE_ERROR = "Your review could not be saved on this device. Please try again.";

function isComment(value: unknown): value is ReviewComment {
  if (!value || typeof value !== "object") return false;
  const comment = value as Record<string, unknown>;
  return (
    typeof comment.id === "string" &&
    typeof comment.authorLabel === "string" &&
    typeof comment.text === "string"
  );
}

function isReview(value: unknown): value is Review {
  if (!value || typeof value !== "object") return false;
  const review = value as Record<string, unknown>;

  return (
    typeof review.id === "string" &&
    typeof review.course === "string" &&
    STUDY_YEARS.includes(review.year as (typeof STUDY_YEARS)[number]) &&
    typeof review.rating === "number" &&
    review.rating >= 1 &&
    review.rating <= 5 &&
    typeof review.greenFlags === "string" &&
    typeof review.redFlags === "string" &&
    typeof review.spillTheTea === "string" &&
    Array.isArray(review.vibeTags) &&
    review.vibeTags.every((tag) => typeof tag === "string") &&
    typeof review.isAnonymous === "boolean" &&
    typeof review.authorLabel === "string" &&
    typeof review.createdAt === "string" &&
    typeof review.likesCount === "number" &&
    Array.isArray(review.comments) &&
    review.comments.every(isComment)
  );
}

export function loadStoredReviews(): Review[] {
  try {
    const stored = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.filter(isReview) : [];
  } catch {
    return [];
  }
}

export function saveStoredReviews(
  reviews: Review[],
): { ok: true } | { ok: false; message: string } {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(reviews));
    return { ok: true };
  } catch {
    return { ok: false, message: SAVE_ERROR };
  }
}
