export const STUDY_YEARS = ["Year 1", "Year 2", "Year 3", "Year 4", "Postgraduate"] as const;

export const REVIEW_TABS = [
  "Reviews",
  "Tuition",
  "Campus Life",
  "Academics",
  "Unspoken Truths",
] as const;

export type StudyYear = (typeof STUDY_YEARS)[number];
export type ReviewTab = (typeof REVIEW_TABS)[number];

export interface ReviewComment {
  id: string;
  authorLabel: string;
  text: string;
}

export interface Review {
  id: string;
  universityId?: string;
  course: string;
  year: StudyYear;
  rating: number;
  greenFlags: string;
  redFlags: string;
  spillTheTea: string;
  vibeTags: string[];
  isAnonymous: boolean;
  authorLabel: string;
  createdAt: string;
  likesCount: number;
  comments: ReviewComment[];
}

export interface ReviewIdentity {
  userId: string;
  email: string;
}

export interface ReviewDraft {
  universityId?: string;
  course: string;
  year: StudyYear | "";
  rating: number;
  greenFlags: string;
  redFlags: string;
  spillTheTea: string;
  vibeTags: string[];
  isAnonymous: boolean;
  identity?: ReviewIdentity;
}

export interface UniversityTarget {
  id: string;
  name: string;
  location: string | null;
}

export interface ReviewFilters {
  query: string;
  year: string;
  rating: number;
}
