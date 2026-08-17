import { describe, expect, it } from "vitest";

import { buildParentSessionPayload, buildStudentAssessmentPayload } from "./database-payloads";
import { createSessionRecord, type SessionRecord } from "./storage";
import type { StudentAssessment } from "./validation";

const parent = {
  location: "Selangor",
  income: "RM 6,000 - RM 9,999",
  email: "parent@example.com",
  studentEmail: "student@example.com",
  studentAgeBand: "18+",
  guardianConsentConfirmed: false,
  preferences: {
    campusVibe: "Public (IPTA) - Warm & Local",
    campusConcern: "Campus safety & physical well-being",
    ultimateWin: "Guaranteed high-paying employment",
    independence: "Needs some structural guidance",
  },
} as const;

const assessment: StudentAssessment = {
  personalityAnswers: [5, 4, 3, 2, 1, 5, 4, 3, 2, 1, 5, 4, 3, 2, 1, 5],
  psychometric: { analytical: 80, creative: 60, social: 40, practical: 70, enterprising: 50 },
  subjects: [{ subject: "Biology", grade: "A" }, { subject: "Chemistry", grade: "B+" }],
  vibeAnswers: {
    fridayNight: "cozy",
    campusSetting: "nature",
    teamStyle: "solo",
    scheduleStyle: "structured",
    learningStyle: "research",
    futureHorizon: "local",
  },
  careerSuggestions: ["Science & Research"],
};

describe("database payload builders", () => {
  it("serializes the complete parent contract and preserves the legacy aggregate", () => {
    const session = createSessionRecord(parent);

    expect(buildParentSessionPayload(session)).toEqual({
      id: session.id,
      parent_email: "parent@example.com",
      preferred_location: "Selangor",
      monthly_household_income: "RM 6,000 - RM 9,999",
      parental_preferences: {
        campus_vibe: "Public (IPTA) - Warm & Local",
        campus_concern: "Campus safety & physical well-being",
        ultimate_win: "Guaranteed high-paying employment",
        independence: "Needs some structural guidance",
      },
      parent_preferences: parent,
      student_age_band: "18+",
      guardian_consent_given: false,
      status: "invited",
    });
  });

  it("serializes dynamic SPM rows, all 16 Likert values, and all six vibe choices", () => {
    const base = createSessionRecord(parent);
    const session: SessionRecord = {
      ...base,
      status: "completed",
      studentProgress: 4,
      authentication: { provider: "google", authenticatedAt: "2026-07-14T04:00:00.000Z" },
      student: { email: "student@example.com", assessment, submittedAt: "2026-07-14T04:00:00.000Z" },
    };

    expect(buildStudentAssessmentPayload(session)).toEqual({
      id: session.id,
      session_id: session.id,
      academic_record: [{ subject: "Biology", grade: "A" }, { subject: "Chemistry", grade: "B+" }],
      personality_test: [5, 4, 3, 2, 1, 5, 4, 3, 2, 1, 5, 4, 3, 2, 1, 5],
      vibe_check_quiz: {
        friday_night: "cozy",
        campus_setting: "nature",
        team_style: "solo",
        schedule_style: "structured",
        learning_style: "research",
        future_horizon: "local",
      },
      assessment_data: assessment,
    });
  });

  it("rejects incomplete sessions instead of writing partial student data", () => {
    expect(() => buildStudentAssessmentPayload(createSessionRecord(parent))).toThrow("Student assessment is incomplete.");
  });
});
