import { z } from "zod";

import type {
  InstitutionImportPayload,
  PendingUniversityAssets,
  PortalDraft,
} from "../types/portal";

const optionalTrimmedString = z.string().max(2_000).trim();
const optionalNumericString = z
  .string()
  .trim()
  .refine((value) => value === "" || /^\d+(?:\.\d{1,2})?$/.test(value), {
    message: "Enter a valid non-negative number.",
  });
const optionalPercentageString = optionalNumericString.refine(
  (value) => value === "" || Number(value) <= 100,
  { message: "Enter a percentage between 0 and 100." },
);
const optionalWholeNumberString = z
  .string()
  .trim()
  .refine((value) => value === "" || /^\d+$/.test(value), {
    message: "Enter a whole number.",
  });

export const PUBLIC_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "icloud.com",
]);

export function isPublicEmailDomain(email: string): boolean {
  const domain = email.trim().toLowerCase().split("@")[1];
  return Boolean(domain && PUBLIC_EMAIL_DOMAINS.has(domain));
}

export const institutionalEmailSchema = z
  .string()
  .trim()
  .email("Enter a valid institutional email address.")
  .refine((email) => !isPublicEmailDomain(email), {
    message: "Use an official institution email address, not a public email provider.",
  });

export const loginSchema = z.object({
  email: institutionalEmailSchema,
  password: z.string().min(8, "Password must contain at least 8 characters.").max(128),
});

export const universityProfileSchema = z.object({
  name: z.string().trim().min(1, "Institution name is required.").max(200),
  location: z.string().trim().max(200),
  address: z.string().trim().max(500),
  website: z.string().trim().refine(
    (value) => value === "" || z.url().safeParse(value).success,
    { message: "Enter a complete website URL, including https://." },
  ),
  contactEmail: z.string().trim().refine(
    (value) => value === "" || z.email().safeParse(value).success,
    { message: "Enter a valid contact email address." },
  ),
  contactPhone: z.string().trim().max(40),
  logoUrl: z.string().trim().refine(
    (value) => value === "" || z.url().safeParse(value).success,
    { message: "Enter a complete logo URL, including https://." },
  ),
  tuitionFees: optionalNumericString,
  acceptanceRate: z.string().trim().refine(
    (value) => value === ""
      || (/^\d+(?:\.\d{1,2})?$/.test(value) && Number(value) >= 0 && Number(value) <= 100),
    { message: "Acceptance rate must be between 0 and 100." },
  ),
});

const universityProfileDraftSchema = z.object({
  name: z.string().max(200),
  location: z.string().max(200),
  address: z.string().max(500),
  website: z.string().max(500),
  contactEmail: z.string().max(320),
  contactPhone: z.string().max(40),
  logoUrl: z.string().max(500),
  tuitionFees: z.string().max(40),
  acceptanceRate: z.string().max(40),
});

export const galleryImageSchema = z.object({
  id: z.string().min(1),
  category: z.string().trim().max(80),
  previewUrl: z.url("Enter a complete image URL, including https://.").trim(),
});

export const courseSchema = z.object({
  name: z.string().trim().min(1, "Program name is required.").max(200),
  facultySchool: z.string().trim().min(1, "Faculty/School is required.").max(200),
  mqaCode: z.string().trim().min(1, "MQA Accreditation Code is required.").max(80),
  studyMode: z.string().trim().min(1, "Study mode is required.").max(120),
  studentLecturerRatio: z.string().trim().max(40),
  dualAwardDegree: z.boolean(),
  interviewPortfolioRequired: z.boolean(),
  minimumEntryRequirements: z.string().trim().max(4_000),
  documentChecklist: z.string().trim().max(4_000),
  microCredentials: optionalTrimmedString,
  professionalBodyExemptions: optionalTrimmedString,
  industryAdvisoryBoards: optionalTrimmedString,
  totalBaseTuitionFee: optionalNumericString,
  initialRegistrationFee: optionalNumericString,
  costPerCreditHour: optionalNumericString,
  additionalMaterialCosts: optionalNumericString,
  ptptnApproved: z.boolean(),
  maraEligible: z.boolean(),
  stateZakatYayasanEligible: z.boolean(),
  graduateEmployabilityRate: optionalPercentageString,
  internshipDurationMonths: optionalWholeNumberString,
  onTimeGraduationRate: optionalPercentageString,
  topHiringCompanies: optionalTrimmedString,
});

const storedCourseSchema = courseSchema.extend({ id: z.string().min(1) });

export const portalDraftSchema = z.object({
  version: z.literal(1),
  profile: universityProfileDraftSchema,
  facilities: z.object({
    library: z.boolean(),
    labs: z.boolean(),
    accommodation: z.boolean(),
    sports: z.boolean(),
    career: z.boolean(),
    counselling: z.boolean(),
  }),
  facilityImages: z.object({
    library: z.string().url().optional(),
    labs: z.string().url().optional(),
    accommodation: z.string().url().optional(),
    sports: z.string().url().optional(),
    career: z.string().url().optional(),
    counselling: z.string().url().optional(),
  }).default({}),
  gallery: z.array(galleryImageSchema).max(20),
  accuracyAttested: z.boolean().default(false),
  courses: z.array(storedCourseSchema).max(100),
  updatedAt: z.iso.datetime(),
});

export const institutionImportSchema: z.ZodType<InstitutionImportPayload> = z.object({
  profile: universityProfileDraftSchema.partial().optional(),
  facilities: z.object({
    library: z.boolean().optional(),
    labs: z.boolean().optional(),
    accommodation: z.boolean().optional(),
    sports: z.boolean().optional(),
    career: z.boolean().optional(),
    counselling: z.boolean().optional(),
  }).optional(),
  facilityImages: z.object({
    library: z.string().url().optional(),
    labs: z.string().url().optional(),
    accommodation: z.string().url().optional(),
    sports: z.string().url().optional(),
    career: z.string().url().optional(),
    counselling: z.string().url().optional(),
  }).optional(),
  gallery: z.array(galleryImageSchema.omit({ id: true })).max(20).optional(),
  courses: z.array(courseSchema).max(100).optional(),
  accuracyAttested: z.boolean().optional(),
});

export function getPublishBlockers(
  courses: readonly unknown[],
  isAttested: boolean,
): string[] {
  const blockers: string[] = [];
  if (courses.length === 0) blockers.push("Add at least one programme before publishing.");
  if (!isAttested) blockers.push("Confirm the institution accuracy attestation before publishing.");
  return blockers;
}

export type WizardStep = {
  id: "identity" | "contacts" | "programmes" | "fees" | "facilities" | "gallery" | "accuracy";
  label: string;
  complete: boolean;
};

export function getWizardSteps(
  draft: PortalDraft,
  pendingAssets: PendingUniversityAssets = { logo: null, facilities: {} },
): WizardStep[] {
  const profile = draft.profile;
  const hasValidProgramme = draft.courses.length > 0
    && draft.courses.every((course) => courseSchema.safeParse(course).success);
  const hasProgrammeFee = draft.courses.some((course) => course.totalBaseTuitionFee.trim() !== "");
  const hasFacilityImage = Object.entries(draft.facilities).some(([key, enabled]) => {
    if (!enabled) return false;
    const facilityKey = key as keyof typeof draft.facilities;
    return Boolean(draft.facilityImages[facilityKey] || pendingAssets.facilities[facilityKey]);
  });

  return [
    { id: "identity", label: "Identity and location", complete: Boolean(profile.name && profile.location && profile.address && profile.website) },
    { id: "contacts", label: "Official contacts", complete: Boolean(profile.contactEmail && profile.contactPhone) },
    { id: "programmes", label: "Programmes and MQA", complete: hasValidProgramme },
    { id: "fees", label: "Fees", complete: Boolean(profile.tuitionFees || hasProgrammeFee) },
    { id: "facilities", label: "Facilities", complete: hasFacilityImage },
    { id: "gallery", label: "Gallery", complete: draft.gallery.length > 0 },
    { id: "accuracy", label: "Accuracy attestation", complete: draft.accuracyAttested },
  ];
}

export function getWizardBlockers(
  draft: PortalDraft,
  pendingAssets: PendingUniversityAssets = { logo: null, facilities: {} },
): string[] {
  const blockerCopy: Record<WizardStep["id"], string> = {
    identity: "Complete institution identity, location, address, and official website.",
    contacts: "Add an official institution email address and contact phone number.",
    programmes: "Add at least one programme with complete MQA accreditation details.",
    fees: "Add published institution or programme fee information.",
    facilities: "Add at least one facility with a verified image.",
    gallery: "Add at least one public gallery image.",
    accuracy: "Confirm the institution accuracy attestation before publishing.",
  };
  return getWizardSteps(draft, pendingAssets)
    .filter((step) => !step.complete)
    .map((step) => blockerCopy[step.id]);
}
