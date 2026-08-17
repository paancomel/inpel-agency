import type { Course, PortalDraft } from "../types/portal";

export function createEmptyCourse(id: string = crypto.randomUUID()): Course {
  return {
    id,
    name: "",
    facultySchool: "",
    mqaCode: "",
    studyMode: "100% Face-to-Face",
    studentLecturerRatio: "",
    dualAwardDegree: false,
    interviewPortfolioRequired: false,
    minimumEntryRequirements: "",
    documentChecklist: "",
    microCredentials: "",
    professionalBodyExemptions: "",
    industryAdvisoryBoards: "",
    totalBaseTuitionFee: "",
    initialRegistrationFee: "",
    costPerCreditHour: "",
    additionalMaterialCosts: "",
    ptptnApproved: false,
    maraEligible: false,
    stateZakatYayasanEligible: false,
    graduateEmployabilityRate: "",
    internshipDurationMonths: "",
    onTimeGraduationRate: "",
    topHiringCompanies: "",
  };
}

export function createEmptyPortalDraft(now = new Date().toISOString()): PortalDraft {
  return {
    version: 1,
    profile: {
      name: "",
      location: "",
      address: "",
      website: "",
      contactEmail: "",
      contactPhone: "",
      logoUrl: "",
      tuitionFees: "",
      acceptanceRate: "",
    },
    facilities: {
      library: false,
      labs: false,
      accommodation: false,
      sports: false,
      career: false,
      counselling: false,
    },
    facilityImages: {},
    gallery: [],
    accuracyAttested: false,
    courses: [],
    updatedAt: now,
  };
}
