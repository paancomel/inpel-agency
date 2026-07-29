import { describe, expect, it } from "vitest";

import { createEmptyCourse, createEmptyPortalDraft } from "./defaults";
import {
  buildCoursePayload,
  buildGalleryPayload,
  buildUniversityPayload,
} from "./database";

describe("database payload mapping", () => {
  it("maps the institution draft to @repo/database insert fields", () => {
    const draft = createEmptyPortalDraft();
    draft.profile = {
      ...draft.profile,
      name: "University of the Future",
      location: "Kuala Lumpur",
      tuitionFees: "45000",
      acceptanceRate: "72.5",
      website: "https://example.edu.my",
      contactEmail: "hello@example.edu.my",
    };
    draft.facilities.library = true;
    draft.facilityImages.library = "https://project.supabase.co/storage/v1/object/public/university-assets/owner/university/facilities/library/file.webp";

    expect(buildUniversityPayload(draft)).toMatchObject({
      name: "University of the Future",
      location: "Kuala Lumpur",
      tuition_fees: 45000,
      acceptance_rate: "72.5",
      facilities_flags: {
        library: { enabled: true, imageUrl: "https://project.supabase.co/storage/v1/object/public/university-assets/owner/university/facilities/library/file.webp" },
      },
      contacts: {
        website: "https://example.edu.my",
        email: "hello@example.edu.my",
      },
    });
  });

  it("maps programme and gallery records to the shared schema", () => {
    const course = {
      ...createEmptyCourse("course-1"),
      name: "Bachelor of Computing",
      facultySchool: "Faculty of Computing",
      mqaCode: "MQA/FA12345",
      totalBaseTuitionFee: "56000",
      studyMode: "100% Face-to-Face",
      studentLecturerRatio: "18:1",
      dualAwardDegree: true,
      ptptnApproved: true,
      graduateEmployabilityRate: "94.5",
      internshipDurationMonths: "6",
    };

    expect(buildCoursePayload(course, "university-1")).toEqual({
      university_id: "university-1",
      name: "Bachelor of Computing",
      mqa_code: "MQA/FA12345",
      tuition_fee: 56000,
      course_details: {
        academic: {
          facultySchool: "Faculty of Computing",
          studyMode: "100% Face-to-Face",
          studentLecturerRatio: "18:1",
          dualAwardDegree: true,
          interviewPortfolioRequired: false,
          minimumEntryRequirements: "",
          documentChecklist: "",
          microCredentials: "",
          professionalBodyExemptions: "",
          industryAdvisoryBoards: "",
        },
        financialAid: {
          initialRegistrationFee: null,
          costPerCreditHour: null,
          additionalMaterialCosts: null,
          ptptnApproved: true,
          maraEligible: false,
          stateZakatYayasanEligible: false,
        },
        outcomes: {
          graduateEmployabilityRate: 94.5,
          internshipDurationMonths: 6,
          onTimeGraduationRate: null,
          topHiringCompanies: "",
        },
      },
    });
    expect(
      buildGalleryPayload(
        { id: "image-1", category: "Campus", previewUrl: "https://project.supabase.co/storage/v1/object/public/university-assets/owner/university/facilities/library/file.jpg" },
        "university-1",
      ),
    ).toEqual({
      university_id: "university-1",
      category: "Campus",
      preview_url: "https://project.supabase.co/storage/v1/object/public/university-assets/owner/university/facilities/library/file.jpg",
    });
  });
});
