export const FACILITIES = [
  { key: "library", label: "24-hour library" },
  { key: "labs", label: "Specialist laboratories" },
  { key: "accommodation", label: "On-campus accommodation" },
  { key: "sports", label: "Sports and recreation centre" },
  { key: "career", label: "Career development centre" },
  { key: "counselling", label: "Student counselling services" },
] as const;

export type FacilityKey = (typeof FACILITIES)[number]["key"];
export type FacilityFlags = Record<FacilityKey, boolean>;
export type FacilityImages = Partial<Record<FacilityKey, string | undefined>>;

export interface PendingUniversityAssets {
  logo: File | null;
  facilities: Partial<Record<FacilityKey, File>>;
}

export interface UniversityProfile {
  name: string;
  location: string;
  address: string;
  website: string;
  contactEmail: string;
  contactPhone: string;
  logoUrl: string;
  tuitionFees: string;
  acceptanceRate: string;
}

export interface GalleryImage {
  id: string;
  category: string;
  previewUrl: string;
}

export interface Course {
  id: string;
  name: string;
  facultySchool: string;
  mqaCode: string;
  studyMode: string;
  studentLecturerRatio: string;
  dualAwardDegree: boolean;
  interviewPortfolioRequired: boolean;
  minimumEntryRequirements: string;
  documentChecklist: string;
  microCredentials: string;
  professionalBodyExemptions: string;
  industryAdvisoryBoards: string;
  totalBaseTuitionFee: string;
  initialRegistrationFee: string;
  costPerCreditHour: string;
  additionalMaterialCosts: string;
  ptptnApproved: boolean;
  maraEligible: boolean;
  stateZakatYayasanEligible: boolean;
  graduateEmployabilityRate: string;
  internshipDurationMonths: string;
  onTimeGraduationRate: string;
  topHiringCompanies: string;
}

export interface PortalDraft {
  version: 1;
  profile: UniversityProfile;
  facilities: FacilityFlags;
  facilityImages: FacilityImages;
  gallery: GalleryImage[];
  courses: Course[];
  updatedAt: string;
}

export type PublishMode = "cloud" | "demo";

export interface PublishResult {
  mode: PublishMode;
  universityId: string;
  publishedCourseCount: number;
  publishedGalleryCount: number;
  publishedAt: string;
  logoUrl?: string | undefined;
  facilityImageUrls?: FacilityImages | undefined;
}
