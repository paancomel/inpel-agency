import type { Json } from "@repo/database";

import { STUDY_YEARS, type Review, type ReviewDraft, type ReviewIdentity, type StudyYear, type UniversityTarget } from "./types";

interface DatabaseError {
  message: string;
}

interface RpcClient {
  rpc(
    functionName: "submit_review_for_moderation",
    args: {
      p_university_id: string;
      p_review_data: Json;
      p_is_anonymous: boolean;
    },
  ): PromiseLike<{ data: unknown; error: DatabaseError | null }>;
}

interface PublicQueryClient {
  from(table: "universities" | "published_reviews"): {
    select(columns: string): {
      order(column: string, options?: { ascending?: boolean }): PromiseLike<{
        data: unknown[] | null;
        error: DatabaseError | null;
      }>;
    };
  };
}

export type ReviewSyncStatus = "submitted" | "local";

export function createReviewSubmission(draft: ReviewDraft): {
  universityId: string;
  reviewData: Json;
  isAnonymous: boolean;
} {
  if (!draft.universityId) {
    throw new Error("Choose a university before sending a review for moderation.");
  }

  const reviewData: Record<string, Json> = {
    course: draft.course.trim(),
    year: draft.year,
    rating: draft.rating,
    greenFlags: draft.greenFlags.trim(),
    redFlags: draft.redFlags.trim(),
    spillTheTea: draft.spillTheTea.trim(),
    vibeTags: draft.vibeTags,
  };

  return {
    universityId: draft.universityId,
    reviewData,
    isAnonymous: draft.isAnonymous,
  };
}

export function createLocalReview(draft: ReviewDraft): Review {
  return {
    id: globalThis.crypto?.randomUUID?.() ?? `review-${Date.now()}`,
    ...(draft.universityId ? { universityId: draft.universityId } : {}),
    course: draft.course.trim(),
    year: draft.year as StudyYear,
    rating: draft.rating,
    greenFlags: draft.greenFlags.trim(),
    redFlags: draft.redFlags.trim(),
    spillTheTea: draft.spillTheTea.trim(),
    vibeTags: draft.vibeTags,
    isAnonymous: draft.isAnonymous,
    authorLabel: draft.isAnonymous ? "Anonymous community member" : "Signed-in community member",
    createdAt: new Date().toISOString(),
    likesCount: 0,
    comments: [],
  };
}

export async function submitReviewForModeration(draft: ReviewDraft): Promise<ReviewSyncStatus> {
  if (import.meta.env.MODE === "test") return "local";
  if (!draft.universityId) return "local";

  try {
    const { supabase } = await import("@repo/database");
    const submission = createReviewSubmission(draft);
    const { error } = await (supabase as unknown as RpcClient).rpc("submit_review_for_moderation", {
      p_university_id: submission.universityId,
      p_review_data: submission.reviewData,
      p_is_anonymous: submission.isAnonymous,
    });
    return error ? "local" : "submitted";
  } catch {
    return "local";
  }
}

function record(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null ? value as Record<string, unknown> : null;
}

function text(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function number(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function stringArray(value: unknown): string[] | null {
  return Array.isArray(value) && value.every((item) => typeof item === "string") ? value : null;
}

export function toPublishedReview(value: unknown): Review | null {
  const row = record(value);
  if (!row) return null;

  const payload = record(row.review_data) ?? row;
  const id = text(row.id);
  const course = text(payload.course);
  const year = text(payload.year);
  const rating = number(payload.rating);
  const spillTheTea = text(payload.spillTheTea ?? payload.spill_the_tea);
  const vibeTags = stringArray(payload.vibeTags ?? payload.vibe_tags);
  const isAnonymous = row.is_anonymous === true;

  if (
    !id || !course || !year || !STUDY_YEARS.includes(year as StudyYear) || !rating ||
    rating < 1 || rating > 5 || !spillTheTea || !vibeTags
  ) return null;

  return {
    id,
    ...(text(row.university_id) ? { universityId: text(row.university_id)! } : {}),
    course,
    year: year as StudyYear,
    rating,
    greenFlags: text(payload.greenFlags ?? payload.green_flags) ?? "",
    redFlags: text(payload.redFlags ?? payload.red_flags) ?? "",
    spillTheTea,
    vibeTags,
    isAnonymous,
    authorLabel: isAnonymous ? "Anonymous community member" : "Signed-in community member",
    createdAt: text(row.created_at) ?? new Date(0).toISOString(),
    likesCount: number(row.likes_count) ?? 0,
    comments: [],
  };
}

export async function loadPublishedReviews(): Promise<{ reviews: Review[]; connected: boolean }> {
  if (import.meta.env.MODE === "test") return { reviews: [], connected: false };

  try {
    const { supabase } = await import("@repo/database");
    const { data, error } = await (supabase as unknown as PublicQueryClient)
      .from("published_reviews")
      .select("id, university_id, course, year, rating, green_flags, red_flags, spill_the_tea, vibe_tags, is_anonymous, likes_count, created_at")
      .order("created_at", { ascending: false });

    return error ? { reviews: [], connected: false } : {
      reviews: (data ?? []).map(toPublishedReview).filter((review): review is Review => review !== null),
      connected: true,
    };
  } catch {
    return { reviews: [], connected: false };
  }
}

export async function loadUniversityTargets(): Promise<
  | { status: "ready"; targets: UniversityTarget[] }
  | { status: "unavailable"; targets: UniversityTarget[]; message: string }
> {
  if (import.meta.env.MODE === "test") {
    return { status: "unavailable", targets: [], message: "University selection is unavailable in preview mode." };
  }

  try {
    const { supabase } = await import("@repo/database");
    const { data, error } = await (supabase as unknown as PublicQueryClient)
      .from("universities")
      .select("id, name, location")
      .order("name");
    const targets = (data ?? []).flatMap((value) => {
      const row = record(value);
      const id = text(row?.id);
      const name = text(row?.name);
      return id && name ? [{ id, name, location: text(row?.location) }] : [];
    });

    return error || targets.length === 0
      ? { status: "unavailable", targets: [], message: "University selection is unavailable. This review can be saved only on this device." }
      : { status: "ready", targets };
  } catch {
    return { status: "unavailable", targets: [], message: "University selection is unavailable. This review can be saved only on this device." };
  }
}

export async function getCurrentIdentity(): Promise<ReviewIdentity | null> {
  if (import.meta.env.MODE === "test") return null;

  try {
    const { supabase } = await import("@repo/database");
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user?.email) return null;
    return { userId: data.user.id, email: data.user.email };
  } catch {
    return null;
  }
}

export async function requestMagicLink(email: string): Promise<"sent" | "demo"> {
  if (import.meta.env.MODE === "test") return "demo";

  try {
    const { supabase } = await import("@repo/database");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: globalThis.location.origin },
    });
    return error ? "demo" : "sent";
  } catch {
    return "demo";
  }
}
