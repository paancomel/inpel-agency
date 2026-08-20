export const RATING_DIMENSIONS = [
  ["facilities", "Facilities & equipment"],
  ["teaching", "Teaching & lecturers"],
  ["classes", "Timetable & classes"],
  ["safety", "Safety"],
  ["value", "Cost & value"],
  ["transport", "Transport & location"],
  ["campusLife", "Campus life"],
  ["career", "Career prospects"],
] as const;
export type RatingKey = (typeof RATING_DIMENSIONS)[number][0];
export type Ratings = Record<RatingKey, number>;
export const EMPTY_RATINGS: Ratings = { facilities: 0, teaching: 0, classes: 0, safety: 0, value: 0, transport: 0, campusLife: 0, career: 0 };
export const STUDY_YEARS = Array.from({ length: new Date().getFullYear() - 1989 }, (_, index) => String(new Date().getFullYear() - index));
export type StudyYear = string;
export const REVIEW_TABS = ["Reviews", "Q&A", "Gallery", "Unspoken Truths"] as const;
export type ReviewTab = (typeof REVIEW_TABS)[number];

export interface ReviewComment { id: string; authorLabel: string; text: string }
export interface Review {
  id: string; universityId?: string; course: string; year: StudyYear; ratings: Ratings; rating: number;
  greenFlags: string; redFlags: string; spillTheTea: string; vibeTags: string[]; isAnonymous: boolean;
  authorLabel: string; createdAt: string; likesCount: number; comments: ReviewComment[]; isComplete?: boolean;
  helpful?: boolean; livingCost?: number; status?: "draft" | "pending" | "correction" | "published" | "rejected";
  visibilityStatus?: "published" | "hidden_under_review";
}
export interface ReviewIdentity { userId: string; email: string }
export type ExperienceKey = "transport" | "food" | "classes" | "commute" | "activities" | "prosCons" | "livingCost" | "safety" | "curfew" | "career" | "partTime" | "lecturers" | "boringClasses" | "hangouts";
export type PhotoCategory = "class" | "library" | "affordable_food" | "daily_route" | "campus" | "accommodation" | "hangout" | "nearby_activity";
export interface RewardPhotoAsset { id: string; category: PhotoCategory; status: "redacted" | "confirmed"; previewUrl: string }
export interface ReviewDraft {
  universityId?: string; course: string; year: StudyYear; ratings: Ratings; rating: number;
  greenFlags: string; redFlags: string; spillTheTea: string; vibeTags: string[]; isAnonymous: true;
  identity?: ReviewIdentity; reviewType: "standard" | "reward"; experiences: Partial<Record<ExperienceKey, string>>;
  livingCost?: number; rewardReviewId?: string; photos: Partial<Record<PhotoCategory, RewardPhotoAsset[]>>;
  /** Legacy drafts only. Counts never qualify a reward submission. */
  photoCounts?: Record<string, number>;
  declarations: { terms: boolean; privacy: boolean; age: boolean; rights: boolean };
}
export interface UniversityTarget { id: string; name: string; location: string | null; courses?: string[] }
export interface University extends UniversityTarget {
  /** Source-catalogue provenance only. Product writes always use `id`. */
  referenceInstitutionId?: string;
  shortName: string; type: string; address: string; website: string; mapUrl: string; rating: number; ratings: Ratings;
  reviewCount: number; livingCost?: number; latestReviewAt: string; strengths: string[]; weaknesses: string[];
  rankingEligible?: boolean;
}
export interface ReviewFilters { query: string; year: string; rating: number; course?: string; sort?: "helpful" | "newest" | "highest" | "lowest" }
