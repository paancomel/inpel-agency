import type { Review, ReviewDraft } from "./types";

const REVIEWS_KEY = "inpolor:reviews:v2";
const DRAFT_KEY = "inpolor:review-draft:v2";
const SAVED_KEY = "inpolor:saved:v1";
const COMMUNITY_ONBOARDING_KEY = "inpolor:community-onboarding:v1";
const SAVE_ERROR = "Your review could not be saved on this device. Please try again.";

export const COMMUNITY_ONBOARDING_TTL_MS = 24 * 60 * 60 * 1_000;

interface CommunityOnboardingDraft {
  version: 1;
  dateOfBirth: string;
  createdAt: string;
  expiresAt: string;
}

function isDateOnly(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function isCommunityOnboardingDraft(value: unknown): value is CommunityOnboardingDraft {
  if (!value || typeof value !== "object") return false;
  const draft = value as Record<string, unknown>;
  return draft.version === 1
    && isDateOnly(draft.dateOfBirth)
    && typeof draft.createdAt === "string"
    && Number.isFinite(Date.parse(draft.createdAt))
    && typeof draft.expiresAt === "string"
    && Number.isFinite(Date.parse(draft.expiresAt));
}

export function savePendingCommunityOnboarding(
  dateOfBirth: string,
  now = new Date(),
): boolean {
  if (!isDateOnly(dateOfBirth)) return false;
  try {
    const draft: CommunityOnboardingDraft = {
      version: 1,
      dateOfBirth,
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + COMMUNITY_ONBOARDING_TTL_MS).toISOString(),
    };
    globalThis.localStorage?.setItem(COMMUNITY_ONBOARDING_KEY, JSON.stringify(draft));
    return true;
  } catch {
    return false;
  }
}

export function loadPendingCommunityOnboarding(
  now = new Date(),
): CommunityOnboardingDraft | null {
  try {
    const raw = globalThis.localStorage?.getItem(COMMUNITY_ONBOARDING_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isCommunityOnboardingDraft(parsed) || Date.parse(parsed.expiresAt) <= now.getTime()) {
      globalThis.localStorage?.removeItem(COMMUNITY_ONBOARDING_KEY);
      return null;
    }
    return parsed;
  } catch {
    globalThis.localStorage?.removeItem(COMMUNITY_ONBOARDING_KEY);
    return null;
  }
}

export function clearPendingCommunityOnboarding(): void {
  globalThis.localStorage?.removeItem(COMMUNITY_ONBOARDING_KEY);
}

export function loadStoredReviews(): Review[] {
  try {
    const value = JSON.parse(globalThis.localStorage?.getItem(REVIEWS_KEY) ?? "[]") as unknown;
    return Array.isArray(value) ? value as Review[] : [];
  } catch {
    return [];
  }
}

export function saveStoredReviews(reviews: Review[]): { ok: true } | { ok: false; message: string } {
  try {
    globalThis.localStorage?.setItem(REVIEWS_KEY, JSON.stringify(reviews));
    return { ok: true };
  } catch {
    return { ok: false, message: SAVE_ERROR };
  }
}

export function loadDraft(): ReviewDraft | null {
  try {
    return JSON.parse(globalThis.localStorage?.getItem(DRAFT_KEY) ?? "null") as ReviewDraft | null;
  } catch {
    return null;
  }
}

export function saveDraft(draft: ReviewDraft) {
  try {
    globalThis.localStorage?.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // Best-effort local recovery. Submission still requires server validation.
  }
}

export function clearDraft() {
  globalThis.localStorage?.removeItem(DRAFT_KEY);
}

export function loadSaved(): string[] {
  try {
    const value = JSON.parse(globalThis.localStorage?.getItem(SAVED_KEY) ?? "[]") as unknown;
    return Array.isArray(value)
      ? value.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export function saveSaved(ids: string[]) {
  globalThis.localStorage?.setItem(SAVED_KEY, JSON.stringify(ids));
}
