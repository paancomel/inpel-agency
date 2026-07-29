import { z } from "zod";

import {
  HOUSEHOLD_INCOME_OPTIONS,
  LIKERT_OPTIONS,
  MALAYSIA_LOCATIONS,
  PARENT_PREFERENCE_OPTIONS,
  PERSONALITY_QUESTIONS,
  SPM_SUBJECTS,
} from "./assessment-data";

export const GRADE_OPTIONS = ["A+", "A", "A-", "B+", "B", "C+", "C", "D", "E", "G"] as const;
const preferenceError = "Please answer every parental preference question.";
const emailPattern = /^\S+@\S+\.\S+$/;

export const parentProfileSchema = z.object({
  location: z.enum(MALAYSIA_LOCATIONS, { error: "Please select your location." }),
  income: z.enum(HOUSEHOLD_INCOME_OPTIONS, { error: "Please select your monthly household income." }),
  email: z.string().trim().regex(emailPattern, "Please enter a valid email address."),
  studentEmail: z.string().trim().regex(emailPattern, "Please enter a valid student email address."),
  preferences: z.object({
    campusVibe: z.enum(PARENT_PREFERENCE_OPTIONS.campusVibe, { error: preferenceError }),
    campusConcern: z.enum(PARENT_PREFERENCE_OPTIONS.campusConcern, { error: preferenceError }),
    ultimateWin: z.enum(PARENT_PREFERENCE_OPTIONS.ultimateWin, { error: preferenceError }),
    independence: z.enum(PARENT_PREFERENCE_OPTIONS.independence, { error: preferenceError }),
  }),
});

export const studentAccountSchema = z.object({
  email: z.string().trim().regex(emailPattern, "Please enter a valid student email address."),
  password: z.string().min(8, "Password must be at least 8 characters long."),
});

const psychometricValueSchema = z.number().min(0, "Invalid assessment value.").max(100, "Invalid assessment value.");
const likertValues = LIKERT_OPTIONS.map((option) => option.value) as [number, ...number[]];
const personalityAnswerSchema = z.number().refine((value) => likertValues.includes(value), "Invalid personality answer.");
const gradeSchema = z.enum(GRADE_OPTIONS, { error: "Choose a valid grade for every subject." });

export const academicSubjectSchema = z.object({
  subject: z.enum(SPM_SUBJECTS, { error: "Choose a valid SPM subject." }),
  grade: gradeSchema,
});

const academicSubjectsSchema = z.array(academicSubjectSchema)
  .min(1, "Add at least one SPM subject.")
  .max(20, "You can add up to 20 SPM subjects.")
  .superRefine((rows, context) => {
    const seen = new Set<string>();
    rows.forEach((row, index) => {
      if (seen.has(row.subject)) context.addIssue({ code: "custom", message: "Each SPM subject can only be added once.", path: [index, "subject"] });
      seen.add(row.subject);
    });
  });

export const vibeAnswersSchema = z.object({
  fridayNight: z.enum(["cozy", "networking"], { error: "Please complete all 6 Vibe Check questions." }),
  campusSetting: z.enum(["nature", "city"], { error: "Please complete all 6 Vibe Check questions." }),
  teamStyle: z.enum(["solo", "collaborative"], { error: "Please complete all 6 Vibe Check questions." }),
  scheduleStyle: z.enum(["spontaneous", "structured"], { error: "Please complete all 6 Vibe Check questions." }),
  learningStyle: z.enum(["creative", "research"], { error: "Please complete all 6 Vibe Check questions." }),
  futureHorizon: z.enum(["local", "global"], { error: "Please complete all 6 Vibe Check questions." }),
});

export const studentAssessmentSchema = z.object({
  personalityAnswers: z.array(personalityAnswerSchema).length(PERSONALITY_QUESTIONS.length, "Please answer all 16 personality questions."),
  psychometric: z.object({
    analytical: psychometricValueSchema,
    creative: psychometricValueSchema,
    social: psychometricValueSchema,
    practical: psychometricValueSchema,
    enterprising: psychometricValueSchema,
  }),
  subjects: academicSubjectsSchema,
  vibeAnswers: vibeAnswersSchema,
  careerSuggestions: z.array(z.string().trim().min(1)).min(1),
});

export const sessionIdSchema = z.string().uuid();

export type ParentProfile = z.infer<typeof parentProfileSchema>;
export type StudentAccount = z.infer<typeof studentAccountSchema>;
export type StudentAssessment = z.infer<typeof studentAssessmentSchema>;
export type AcademicSubject = z.infer<typeof academicSubjectSchema>;
export type Grade = (typeof GRADE_OPTIONS)[number];
