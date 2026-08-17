import type { Database, Json } from "@repo/database";
import { EMPTY_RATINGS, RATING_DIMENSIONS, type Ratings, type Review, type ReviewDraft, type ReviewIdentity } from "./types";

export type ReviewSyncStatus = "submitted" | "local";
const average = (ratings: Ratings) => Number((Object.values(ratings).reduce((sum, value) => sum + value, 0) / 8).toFixed(1));

export function createReviewSubmission(draft: ReviewDraft) {
  if (!draft.universityId) throw new Error("Choose a university before sending a review for moderation.");
  const content = { mainExperience: draft.spillTheTea.trim(), transport: draft.experiences.transport, affordableFoodPlaces: draft.experiences.food?.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean).slice(0, 3), classSchedule: draft.experiences.classes, dailyCommute: draft.experiences.commute, nearbyActivities: draft.experiences.activities, advantagesDisadvantages: draft.experiences.prosCons, livingCost: draft.experiences.livingCost, safety: draft.experiences.safety, hostelCurfew: draft.experiences.curfew, careerProspects: draft.experiences.career, partTimeWork: draft.experiences.partTime, goodLecturers: draft.experiences.lecturers, boringClasses: draft.experiences.boringClasses, betweenClassHangouts: draft.experiences.hangouts };
  const photoIds = Object.values(draft.photos ?? {}).flat().filter((photo) => photo.status === "confirmed").map((photo) => photo.id);
  const declarations = { version: "inpolor-review-v1", age18OrOlder: draft.declarations.age, termsAccepted: draft.declarations.terms, privacyAcknowledged: draft.declarations.privacy, contentRightsConfirmed: draft.declarations.rights };
  const reviewData = { universityId: draft.universityId, kind: draft.reviewType, ...(draft.rewardReviewId ? { reviewId: draft.rewardReviewId } : {}), courseName: draft.course.trim(), studyYear: Number(draft.year), ratingFacilities: draft.ratings.facilities, ratingTeaching: draft.ratings.teaching, ratingClassExperience: draft.ratings.classes, ratingSafety: draft.ratings.safety, ratingValue: draft.ratings.value, ratingTransport: draft.ratings.transport, ratingCampusLife: draft.ratings.campusLife, ratingCareer: draft.ratings.career, ...(draft.livingCost ? { livingCostMonthly: draft.livingCost } : {}), content, photoIds, declarations } as unknown as Json;
  return { universityId: draft.universityId, reviewData, isAnonymous: true };
}

export function createLocalReview(draft: ReviewDraft): Review {
  return { id: globalThis.crypto?.randomUUID?.() ?? `review-${Date.now()}`, ...(draft.universityId ? { universityId: draft.universityId } : {}), course: draft.course.trim(), year: draft.year, ratings: draft.ratings, rating: average(draft.ratings), greenFlags: draft.greenFlags.trim(), redFlags: draft.redFlags.trim(), spillTheTea: draft.spillTheTea.trim(), vibeTags: draft.vibeTags, isAnonymous: true, authorLabel: "Anonymous reviewer", createdAt: new Date().toISOString(), likesCount: 0, comments: [], isComplete: draft.reviewType === "reward", ...(draft.livingCost ? { livingCost: draft.livingCost } : {}), status: "pending" };
}

export async function submitReviewForModeration(draft: ReviewDraft): Promise<ReviewSyncStatus> {
  if (import.meta.env.MODE === "test" || !draft.universityId) return "local";
  try { const { supabase } = await import("@repo/database"); const submission = createReviewSubmission(draft); const client = supabase as unknown as { rpc: (name: string, args: Record<string, unknown>) => PromiseLike<{ error: unknown }> }; const { error } = await client.rpc("submit_inpolor_review", { p_payload: submission.reviewData }); return error ? "local" : "submitted"; } catch { return "local"; }
}

const record = (value: unknown) => typeof value === "object" && value !== null ? value as Record<string, unknown> : null;
const text = (value: unknown) => typeof value === "string" ? value : null;
const number = (value: unknown) => typeof value === "number" && Number.isFinite(value) ? value : null;
export function toPublishedReview(value: unknown): Review | null {
  const row = record(value); if (!row) return null; const payload = record(row.review_data) ?? row;
  const id = text(row.id); const course = text(payload.course); const year = text(payload.year); if (!id || !course || !year) return null;
  const rawRatings = record(payload.ratings); const ratings = { ...EMPTY_RATINGS };
  for (const [key] of RATING_DIMENSIONS) ratings[key] = number(rawRatings?.[key]) ?? number(payload.rating) ?? 0;
  if (Object.values(ratings).some((score) => score < 1 || score > 10)) return null;
  const livingCost = number(payload.living_cost);
  return { id, ...(text(row.university_id) ? { universityId: text(row.university_id)! } : {}), course, year, ratings, rating: average(ratings), greenFlags: text(payload.greenFlags ?? payload.green_flags) ?? "", redFlags: text(payload.redFlags ?? payload.red_flags) ?? "", spillTheTea: text(payload.spillTheTea ?? payload.spill_the_tea) ?? "Student experience submitted for community moderation.", vibeTags: [], isAnonymous: true, authorLabel: "Anonymous reviewer", createdAt: text(row.created_at) ?? new Date(0).toISOString(), likesCount: number(row.likes_count) ?? 0, comments: [], isComplete: payload.review_type === "reward", ...(livingCost !== null ? { livingCost } : {}), status: "published" };
}

export async function loadPublishedReviews(): Promise<{ reviews: Review[]; connected: boolean }> {
  if (import.meta.env.MODE === "test") return { reviews: [], connected: false };
  try { const { supabase } = await import("@repo/database"); const { data, error } = await supabase.from("published_reviews").select("*").order("created_at", { ascending: false }); return error ? { reviews: [], connected: false } : { reviews: (data ?? []).map(toPublishedReview).filter((item): item is Review => Boolean(item)), connected: true }; } catch { return { reviews: [], connected: false }; }
}

export async function getCurrentIdentity(): Promise<ReviewIdentity | null> { if (import.meta.env.MODE === "test") return null; try { const { supabase } = await import("@repo/database"); const { data, error } = await supabase.auth.getUser(); return error || !data.user?.email ? null : { userId: data.user.id, email: data.user.email }; } catch { return null; } }
const PENDING_DOB_KEY = "inpolor_pending_date_of_birth";
function rememberPendingDateOfBirth(dateOfBirth: string) { globalThis.sessionStorage?.setItem(PENDING_DOB_KEY, dateOfBirth); }

export async function completeCommunityOnboarding(): Promise<void> {
  if (import.meta.env.MODE === "test") return;
  const dateOfBirth = globalThis.sessionStorage?.getItem(PENDING_DOB_KEY);
  if (!dateOfBirth) return;
  const { supabase } = await import("@repo/database");
  type OnboardingArgs = Database["public"]["Functions"]["complete_inpolor_community_onboarding"]["Args"];
  const client = supabase as unknown as { rpc: (name: "complete_inpolor_community_onboarding", args: OnboardingArgs) => PromiseLike<{ error: { message: string } | null }> };
  const { error } = await client.rpc("complete_inpolor_community_onboarding", { p_date_of_birth: dateOfBirth, p_locale: navigator.language.toLowerCase().startsWith("ms") ? "ms" : "en" });
  if (error) throw new Error(error.message);
  globalThis.sessionStorage?.removeItem(PENDING_DOB_KEY);
}

export async function requestMagicLink(email: string, dateOfBirth: string): Promise<"sent" | "demo"> { if (import.meta.env.MODE === "test") return "demo"; try { rememberPendingDateOfBirth(dateOfBirth); const { supabase } = await import("@repo/database"); const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: globalThis.location.origin } }); return error ? "demo" : "sent"; } catch { return "demo"; } }
export async function signInWithGoogle(dateOfBirth: string): Promise<"redirecting" | "demo"> { if (import.meta.env.MODE === "test") return "demo"; try { rememberPendingDateOfBirth(dateOfBirth); const { supabase } = await import("@repo/database"); const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: globalThis.location.origin } }); return error ? "demo" : "redirecting"; } catch { return "demo"; } }
