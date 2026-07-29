import type {
  Json,
  ParentalPreferences,
  PersonalityTestAnswers,
  TablesInsert,
  VibeCheckQuiz,
} from "@repo/database";

import type { SessionRecord } from "./storage";
import { studentAssessmentSchema } from "./validation";

function asJson(value: unknown): Json {
  return JSON.parse(JSON.stringify(value)) as Json;
}

function personalityTuple(values: number[]): PersonalityTestAnswers {
  const validated = studentAssessmentSchema.shape.personalityAnswers.parse(values);
  return validated as PersonalityTestAnswers;
}

export function buildParentSessionPayload(session: SessionRecord): TablesInsert<"sessions"> {
  if (!session.parent) throw new Error("Parent ownership data is required to create an invitation.");
  const preferences: ParentalPreferences = {
    campus_vibe: session.parent.preferences.campusVibe,
    campus_concern: session.parent.preferences.campusConcern,
    ultimate_win: session.parent.preferences.ultimateWin,
    independence: session.parent.preferences.independence,
  };

  return {
    id: session.id,
    parent_email: session.parent.email,
    preferred_location: session.parent.location,
    monthly_household_income: session.parent.income,
    parental_preferences: preferences,
    parent_preferences: asJson(session.parent),
    status: session.status,
  };
}

export function buildStudentAssessmentPayload(
  session: SessionRecord,
): TablesInsert<"student_assessments"> {
  if (!session.student) throw new Error("Student assessment is incomplete.");
  const assessment = studentAssessmentSchema.parse(session.student.assessment);
  const vibe: VibeCheckQuiz = {
    friday_night: assessment.vibeAnswers.fridayNight,
    campus_setting: assessment.vibeAnswers.campusSetting,
    team_style: assessment.vibeAnswers.teamStyle,
    schedule_style: assessment.vibeAnswers.scheduleStyle,
    learning_style: assessment.vibeAnswers.learningStyle,
    future_horizon: assessment.vibeAnswers.futureHorizon,
  };

  return {
    // A stable primary key makes callback retries idempotent without deleting or
    // merging any other session's assessment.
    id: session.id,
    session_id: session.id,
    academic_record: assessment.subjects,
    personality_test: personalityTuple(assessment.personalityAnswers),
    vibe_check_quiz: vibe,
    assessment_data: asJson(assessment),
  };
}
