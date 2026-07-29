import { z } from "zod";

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

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid institutional email address."),
  password: z.string().min(8, "Password must contain at least 8 characters.").max(128),
});

export const universityProfileSchema = z.object({
  name: z.string().trim().min(1, "Institution name is required.").max(200),
  location: z.string().trim().max(200),
  address: z.string().trim().max(500),
  website: z
    .string()
    .trim()
    .refine((value) => value === "" || z.url().safeParse(value).success, {
      message: "Enter a complete website URL, including https://.",
    }),
  contactEmail: z
    .string()
    .trim()
    .refine((value) => value === "" || z.email().safeParse(value).success, {
      message: "Enter a valid contact email address.",
    }),
  contactPhone: z.string().trim().max(40),
  logoUrl: z
    .string()
    .trim()
    .refine((value) => value === "" || z.url().safeParse(value).success, {
      message: "Enter a complete logo URL, including https://.",
    }),
  tuitionFees: optionalNumericString,
  acceptanceRate: z
    .string()
    .trim()
    .refine(
      (value) =>
        value === "" ||
        (/^\d+(?:\.\d{1,2})?$/.test(value) && Number(value) >= 0 && Number(value) <= 100),
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
  courses: z.array(storedCourseSchema).max(100),
  updatedAt: z.iso.datetime(),
});

export function getPublishBlockers(
  courses: readonly unknown[],
  isAttested: boolean,
): string[] {
  const blockers: string[] = [];

  if (courses.length === 0) {
    blockers.push("Add at least one programme before publishing.");
  }

  if (!isAttested) {
    blockers.push("Confirm the institution accuracy attestation before publishing.");
  }

  return blockers;
}
