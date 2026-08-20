import { EMPTY_RATINGS, type Review, type University, type UniversityTarget } from "./types";

const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === "object" && value !== null ? value as Record<string, unknown> : null;
const asText = (value: unknown): string | null =>
  typeof value === "string" && value.trim() ? value.trim() : null;
const asNumber = (value: unknown): number | null =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter((part) => part.length > 2)
    .slice(0, 4)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || name.slice(0, 3).toUpperCase();
}

function reviewFromRow(value: unknown): Review | null {
  const row = asRecord(value);
  if (!row) return null;

  const id = asText(row.id);
  const universityId = asText(row.university_id);
  const visibility = asText(row.visibility_status);
  if (!id || !universityId || (visibility !== "published" && visibility !== "hidden_under_review")) {
    return null;
  }

  if (visibility === "hidden_under_review") {
    return {
      id,
      universityId,
      course: "Review",
      year: "",
      ratings: { ...EMPTY_RATINGS },
      rating: 0,
      greenFlags: "",
      redFlags: "",
      spillTheTea: "Kandungan ini sedang disemak",
      vibeTags: [],
      isAnonymous: true,
      authorLabel: "Anonymous reviewer",
      createdAt: asText(row.created_at) ?? new Date(0).toISOString(),
      likesCount: 0,
      comments: [],
      status: "published",
      visibilityStatus: visibility,
    };
  }

  const ratings = {
    facilities: asNumber(row.rating_facilities) ?? 0,
    teaching: asNumber(row.rating_teaching) ?? 0,
    classes: asNumber(row.rating_class_experience) ?? 0,
    safety: asNumber(row.rating_safety) ?? 0,
    value: asNumber(row.rating_value) ?? 0,
    transport: asNumber(row.rating_transport) ?? 0,
    campusLife: asNumber(row.rating_campus_life) ?? 0,
    career: asNumber(row.rating_career) ?? 0,
  };
  if (Object.values(ratings).some((rating) => rating < 1 || rating > 10)) return null;

  const content = asRecord(row.content);
  const mainExperience = asText(row.spill_the_tea)
    ?? asText(content?.mainExperience)
    ?? asText(content?.spillTheTea)
    ?? "Student experience submitted for community moderation.";

  return {
    id,
    universityId,
    course: asText(row.course) ?? "Course not disclosed",
    year: asText(row.year) ?? "Year not disclosed",
    ratings,
    rating: asNumber(row.rating) ?? 0,
    greenFlags: asText(row.green_flags) ?? "",
    redFlags: asText(row.red_flags) ?? "",
    spillTheTea: mainExperience,
    vibeTags: [],
    isAnonymous: true,
    authorLabel: "Anonymous reviewer",
    createdAt: asText(row.created_at) ?? new Date(0).toISOString(),
    likesCount: asNumber(row.likes_count) ?? 0,
    comments: [],
    isComplete: row.is_complete_review === true,
    status: "published",
    visibilityStatus: visibility,
  };
}

interface InstitutionRow {
  university_id: string;
  university_name: string;
  location: string | null;
  address: string | null;
  reference_institution_id: string;
  reference_institution_name: string;
  linked_programme_count: number;
}

interface ProgrammeRow {
  university_id: string;
  qualification_name: string;
}

interface SummaryRow {
  university_id: string;
  review_count: number;
  overall_rating: number | null;
  rating_facilities: number | null;
  rating_teaching: number | null;
  rating_class_experience: number | null;
  rating_safety: number | null;
  rating_value: number | null;
  rating_transport: number | null;
  rating_campus_life: number | null;
  rating_career: number | null;
  living_cost_monthly: number | null;
  ranking_eligible: boolean;
  newest_review_at: string | null;
}

export async function loadCommunityDirectory(): Promise<{
  universities: University[];
  reviewTargets: UniversityTarget[];
  reviews: Review[];
  connected: boolean;
  message: string | null;
}> {
  try {
    const { supabase } = await import("@repo/database");
    const [universitiesResult, programmesResult, summariesResult, reviewsResult] = await Promise.all([
      supabase
        .from("inpolor_catalog_institutions")
        .select("university_id,university_name,location,address,reference_institution_id,reference_institution_name,linked_programme_count")
        .order("university_name"),
      supabase
        .from("inpolor_catalog_programmes")
        .select("university_id,qualification_name"),
      supabase.from("inpolor_university_summaries").select("*"),
      supabase.from("published_reviews").select("*").order("created_at", { ascending: false }),
    ]);

    if (universitiesResult.error) {
      return {
        universities: [],
        reviewTargets: [],
        reviews: [],
        connected: false,
        message: "The verified university directory is temporarily unavailable.",
      };
    }

    const universityRows = (universitiesResult.data ?? []) as unknown as InstitutionRow[];
    const programmeRows = programmesResult.error
      ? []
      : (programmesResult.data ?? []) as unknown as ProgrammeRow[];
    const summaryRows = summariesResult.error
      ? []
      : (summariesResult.data ?? []) as unknown as SummaryRow[];
    const reviews = reviewsResult.error
      ? []
      : (reviewsResult.data ?? [])
        .map(reviewFromRow)
        .filter((item): item is Review => Boolean(item));

    const programmes = new Map<string, string[]>();
    for (const row of programmeRows) {
      if (!row.university_id || !row.qualification_name) continue;
      const current = programmes.get(row.university_id) ?? [];
      if (!current.includes(row.qualification_name)) current.push(row.qualification_name);
      programmes.set(row.university_id, current);
    }

    const summaries = new Map(summaryRows.map((item) => [item.university_id, item]));
    const universities = universityRows.map((row) => {
      const summary = summaries.get(row.university_id);
      const relevantReviews = reviews.filter(
        (review) => review.universityId === row.university_id
          && review.visibilityStatus === "published",
      );
      const location = row.location?.trim() || "Location pending verification";
      const address = row.address?.trim() || location;

      return {
        id: row.university_id,
        referenceInstitutionId: row.reference_institution_id,
        name: row.university_name,
        location,
        address,
        shortName: initials(row.university_name),
        type: "Verified institution",
        website: "",
        mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
        rating: Number(summary?.overall_rating ?? 0),
        reviewCount: Number(summary?.review_count ?? 0),
        ...(summary?.living_cost_monthly != null
          ? { livingCost: summary.living_cost_monthly }
          : {}),
        latestReviewAt: summary?.newest_review_at ?? "",
        rankingEligible: summary?.ranking_eligible ?? false,
        ratings: {
          facilities: Number(summary?.rating_facilities ?? 0),
          teaching: Number(summary?.rating_teaching ?? 0),
          classes: Number(summary?.rating_class_experience ?? 0),
          safety: Number(summary?.rating_safety ?? 0),
          value: Number(summary?.rating_value ?? 0),
          transport: Number(summary?.rating_transport ?? 0),
          campusLife: Number(summary?.rating_campus_life ?? 0),
          career: Number(summary?.rating_career ?? 0),
        },
        strengths: relevantReviews.map((review) => review.greenFlags).filter(Boolean).slice(0, 3),
        weaknesses: relevantReviews.map((review) => review.redFlags).filter(Boolean).slice(0, 3),
        courses: programmes.get(row.university_id) ?? [],
      } satisfies University;
    });

    const reviewTargets = universities.map((university) => ({
      id: university.id,
      name: university.name,
      location: university.location,
      courses: university.courses,
    }));
    const partial = Boolean(programmesResult.error || summariesResult.error || reviewsResult.error);

    return {
      universities,
      reviewTargets,
      reviews,
      connected: !partial,
      message: universityRows.length === 0
        ? "No verified institutions are published for INPOLOR yet."
        : partial
          ? "Some programme or community evidence is temporarily unavailable."
          : null,
    };
  } catch {
    return {
      universities: [],
      reviewTargets: [],
      reviews: [],
      connected: false,
      message: "The verified university directory is temporarily unavailable.",
    };
  }
}

export async function setCloudSave(
  kind: "university" | "review",
  id: string,
  userId: string,
  active: boolean,
) {
  const { supabase } = await import("@repo/database");
  const table = kind === "university" ? "university_saves" : "review_saves";
  const idColumn = kind === "university" ? "university_id" : "review_id";
  const result = active
    ? await supabase.from(table).insert({ [idColumn]: id, user_id: userId } as never)
    : await supabase.from(table).delete().eq(idColumn, id).eq("user_id", userId);
  if (result.error) throw new Error(result.error.message);
}

export async function loadCloudSaves(userId: string) {
  const { supabase } = await import("@repo/database");
  const [universities, reviews] = await Promise.all([
    supabase.from("university_saves").select("university_id").eq("user_id", userId),
    supabase.from("review_saves").select("review_id").eq("user_id", userId),
  ]);
  if (universities.error || reviews.error) throw new Error("Unable to load saved items.");
  const universityRows = (universities.data ?? []) as unknown as Array<{ university_id: string }>;
  const reviewRows = (reviews.data ?? []) as unknown as Array<{ review_id: string }>;
  return [
    ...universityRows.map((row) => row.university_id),
    ...reviewRows.map((row) => row.review_id),
  ];
}
