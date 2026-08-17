import { randomUUID } from "node:crypto";

import {
  buildCoursePayload,
  buildGalleryPayload,
  buildUniversityPayload,
} from "../../apps/portal-student/src/lib/database.js";
import { createEmptyCourse } from "../../apps/portal-student/src/lib/defaults.js";
import {
  courseSchema,
  galleryImageSchema,
  portalDraftSchema,
  universityProfileSchema,
} from "../../apps/portal-student/src/lib/validation.js";
import {
  buildParentSessionPayload,
  buildStudentAssessmentPayload,
} from "../../apps/portal-universiti/src/lib/database-payloads.js";
import { sessionRecordSchema } from "../../apps/portal-universiti/src/lib/storage.js";
import {
  parentProfileSchema,
  studentAccountSchema,
  studentAssessmentSchema,
} from "../../apps/portal-universiti/src/lib/validation.js";

import type { TablesInsert } from "./types.js";

type AuditAccountRole = "parent" | "student" | "university_rep" | "admin";

export interface AuditAccount {
  email: string;
  password: string;
  role: AuditAccountRole;
}

export interface AuditFixtures {
  runId: string;
  ids: {
    university: string;
    course: string;
    galleryImage: string;
    session: string;
    assessment: string;
    recommendation: string;
    payment: string;
    cascadeUniversity: string;
    cascadeCourse: string;
    cascadeGalleryImage: string;
    anonymousUniversityAttempt: string;
    unauthorizedCourseAttempt: string;
    unauthorizedSessionAttempt: string;
  };
  generatedRowIds: string[];
  accounts: Record<"parent" | "student" | "representative" | "admin", AuditAccount>;
  institution: {
    university: TablesInsert<"universities">;
    course: TablesInsert<"courses">;
    galleryImage: TablesInsert<"gallery_images">;
  };
  student: {
    session: TablesInsert<"sessions">;
    assessment: TablesInsert<"student_assessments">;
  };
  inpel: {
    recommendation: TablesInsert<"recommendation_results">;
    payment: TablesInsert<"payments">;
  };
  review: {
    submission: {
      university_id: string;
      is_anonymous: boolean;
      review_data: {
        course: string;
        year: string;
        rating: number;
        greenFlags: string;
        redFlags: string;
        spillTheTea: string;
        vibeTags: string[];
      };
    };
  };
}

function account(runTag: string, role: AuditAccountRole): AuditAccount {
  const candidate = {
    email: `qa-audit+${runTag}-${role}@example.test`,
    password: `Qa!${runTag}-9z`,
  };

  if (role === "student") {
    studentAccountSchema.parse(candidate);
  }

  return { ...candidate, role };
}

/**
 * Builds deterministic-shape, unique-value fixtures using the exact Zod
 * schemas and payload mappers currently called by the two input portals.
 */
export function createAuditFixtures(): AuditFixtures {
  const runId = randomUUID();
  const runTag = runId.replaceAll("-", "");
  const sessionId = randomUUID();
  const assetOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "https://xrmrhjgkttxzvwdsjazs.supabase.co";
  const ids = {
    university: randomUUID(),
    course: randomUUID(),
    galleryImage: randomUUID(),
    session: sessionId,
    // The production mapper intentionally reuses the session UUID so retries
    // are idempotent for that one assessment.
    assessment: sessionId,
    recommendation: randomUUID(),
    payment: randomUUID(),
    cascadeUniversity: randomUUID(),
    cascadeCourse: randomUUID(),
    cascadeGalleryImage: randomUUID(),
    anonymousUniversityAttempt: randomUUID(),
    unauthorizedCourseAttempt: randomUUID(),
    unauthorizedSessionAttempt: randomUUID(),
  };
  const accounts = {
    parent: account(runTag, "parent"),
    student: account(runTag, "student"),
    representative: account(runTag, "university_rep"),
    admin: account(runTag, "admin"),
  };

  const profile = universityProfileSchema.parse({
    name: `QA Audit University ${runId}`,
    location: "Selangor",
    address: "1 Integration Way, 47500 Subang Jaya",
    website: "https://qa-audit.example.test",
    contactEmail: accounts.representative.email,
    contactPhone: "+60 3-5555 0101",
    logoUrl: `${assetOrigin}/storage/v1/object/public/university-assets/fixture/${ids.university}/logo/${ids.university}.png`,
    tuitionFees: "48000",
    acceptanceRate: "65",
  });
  const course = courseSchema.parse({
    ...createEmptyCourse(ids.course),
    name: "Bachelor of Biomedical Integration Testing",
    facultySchool: "Faculty of Health Sciences",
    mqaCode: `QA-${runTag.slice(0, 24)}`,
    totalBaseTuitionFee: "48000",
    studyMode: "100% Face-to-Face",
    minimumEntryRequirements: "Biology grade B or better",
    graduateEmployabilityRate: "92",
    internshipDurationMonths: "6",
  });
  const galleryImage = galleryImageSchema.parse({
    id: ids.galleryImage,
    category: "Campus",
    previewUrl: `${assetOrigin}/storage/v1/object/public/university-assets/fixture/${ids.university}/facilities/library/${ids.galleryImage}.png`,
  });
  const institutionDraft = portalDraftSchema.parse({
    version: 1,
    profile,
    facilities: {
      library: true,
      labs: true,
      accommodation: true,
      sports: false,
      career: true,
      counselling: true,
    },
    gallery: [galleryImage],
    courses: [{ ...course, id: ids.course }],
    updatedAt: new Date().toISOString(),
  });

  const parent = parentProfileSchema.parse({
    location: "Selangor",
    income: "RM 6,000 - RM 9,999",
    email: accounts.parent.email,
    studentEmail: accounts.student.email,
    studentAgeBand: "18+",
    guardianConsentConfirmed: false,
    preferences: {
      campusVibe: "Private (IPTS) - Modern & Vibrant",
      campusConcern: "Academic rigor & faculty quality",
      ultimateWin: "Guaranteed high-paying employment",
      independence: "Highly independent self-starter",
    },
  });
  const assessment = studentAssessmentSchema.parse({
    personalityAnswers: [5, 4, 4, 5, 3, 4, 3, 5, 4, 5, 3, 4, 5, 4, 4, 5],
    psychometric: {
      analytical: 88,
      creative: 72,
      social: 75,
      practical: 81,
      enterprising: 69,
    },
    subjects: [
      { subject: "Biology", grade: "A" },
      { subject: "Chemistry", grade: "A-" },
      { subject: "Matematik Tambahan", grade: "B+" },
    ],
    vibeAnswers: {
      fridayNight: "cozy",
      campusSetting: "nature",
      teamStyle: "collaborative",
      scheduleStyle: "structured",
      learningStyle: "research",
      futureHorizon: "local",
    },
    careerSuggestions: ["Science & Research", "Health & Human Services"],
  });
  const sessionRecord = sessionRecordSchema.parse({
    id: ids.session,
    createdAt: new Date().toISOString(),
    status: "completed",
    parent,
    studentProgress: 4,
    student: {
      email: accounts.student.email,
      assessment,
      submittedAt: new Date().toISOString(),
    },
  });

  return {
    runId,
    ids,
    generatedRowIds: [...new Set(Object.values(ids))],
    accounts,
    institution: {
      university: { ...buildUniversityPayload(institutionDraft), id: ids.university },
      course: {
        ...buildCoursePayload(institutionDraft.courses[0]!, ids.university),
        id: ids.course,
      },
      galleryImage: {
        ...buildGalleryPayload(institutionDraft.gallery[0]!, ids.university),
        id: ids.galleryImage,
      },
    },
    student: {
      session: { ...buildParentSessionPayload(sessionRecord), id: ids.session },
      assessment: {
        ...buildStudentAssessmentPayload(sessionRecord),
        id: ids.assessment,
        session_id: ids.session,
      },
    },
    inpel: {
      recommendation: {
        id: ids.recommendation,
        session_id: ids.session,
        university_id: ids.university,
        match_score: 94,
        roi_and_career: {
          matchedCourseId: ids.course,
          rationale: "Biology result and research-oriented preferences satisfy the programme profile.",
          projectedStartingSalary: 4200,
        },
      },
      payment: {
        id: ids.payment,
        session_id: ids.session,
        tier: 2,
        status: "success",
      },
    },
    review: {
      submission: {
        university_id: ids.university,
        is_anonymous: true,
        review_data: {
          course: "Biomedical Science",
          year: "Year 2",
          rating: 4,
          greenFlags: "Supportive lab demonstrators",
          redFlags: "Limited late-night study space",
          spillTheTea: "Plan laboratory group work early in the semester.",
          vibeTags: ["research", "collaborative"],
        },
      },
    },
  };
}
