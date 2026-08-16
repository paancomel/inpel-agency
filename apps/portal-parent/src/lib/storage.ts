import type { Review, ReviewDraft } from "./types";

const REVIEWS_KEY = "inpolor:reviews:v2";
const DRAFT_KEY = "inpolor:review-draft:v2";
const SAVED_KEY = "inpolor:saved:v1";
const SAVE_ERROR = "Your review could not be saved on this device. Please try again.";

export function loadStoredReviews(): Review[] {
  try { const value = JSON.parse(globalThis.localStorage?.getItem(REVIEWS_KEY) ?? "[]") as unknown; return Array.isArray(value) ? value as Review[] : []; } catch { return []; }
}
export function saveStoredReviews(reviews: Review[]): { ok: true } | { ok: false; message: string } {
  try { globalThis.localStorage?.setItem(REVIEWS_KEY, JSON.stringify(reviews)); return { ok: true }; } catch { return { ok: false, message: SAVE_ERROR }; }
}
export function loadDraft(): ReviewDraft | null {
  try { return JSON.parse(globalThis.localStorage?.getItem(DRAFT_KEY) ?? "null") as ReviewDraft | null; } catch { return null; }
}
export function saveDraft(draft: ReviewDraft) { try { globalThis.localStorage?.setItem(DRAFT_KEY, JSON.stringify(draft)); } catch { /* best-effort local recovery */ } }
export function clearDraft() { globalThis.localStorage?.removeItem(DRAFT_KEY); }
export function loadSaved(): string[] { try { const value = JSON.parse(globalThis.localStorage?.getItem(SAVED_KEY) ?? "[]") as unknown; return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []; } catch { return []; } }
export function saveSaved(ids: string[]) { globalThis.localStorage?.setItem(SAVED_KEY, JSON.stringify(ids)); }
