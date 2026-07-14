import { z } from "zod";

export const BUDGET_OPTIONS = [
  "Below RM 25,000",
  "RM 25,000 – RM 40,000",
  "RM 40,000 – RM 70,000",
  "Above RM 70,000",
] as const;

export const GRADE_OPTIONS = ["A+", "A", "A-", "B+", "B", "C+", "C", "D", "E", "G"] as const;
export const CORE_SUBJECTS = [
  "Bahasa Melayu",
  "English",
  "Mathematics",
  "Science",
  "History",
] as const;

const emailPattern = /^\S+@\S+\.\S+$/;

export const parentProfileSchema = z.object({
  location: z.string().trim().min(1, "Please select your location."),
  budget: z.enum(BUDGET_OPTIONS, {
    error: "Please select your budget/salary range.",
  }),
  email: z
    .string()
    .trim()
    .regex(emailPattern, "Please enter a valid email address."),
  expectations: z.array(z.string().trim().min(1)).min(1, "Choose at least one family priority."),
});

export const studentAccountSchema = z.object({
  email: z
    .string()
    .trim()
    .regex(emailPattern, "Please enter a valid student email address."),
  password: z.string().min(8, "Password must be at least 8 characters long."),
});

const psychometricValueSchema = z
  .number()
  .min(0, "Invalid assessment value.")
  .max(100, "Invalid assessment value.");

const gradeSchema = z.enum(GRADE_OPTIONS, {
  error: "Please provide grades for all core subjects.",
});

export const studentAssessmentSchema = z.object({
  hobbies: z
    .array(z.string().trim().min(1))
    .min(1, "Please select at least one hobby to continue."),
  psychometric: z.object({
    analytical: psychometricValueSchema,
    creative: psychometricValueSchema,
    social: psychometricValueSchema,
    practical: psychometricValueSchema,
    enterprising: psychometricValueSchema,
  }),
  coreGrades: z.object({
    "Bahasa Melayu": gradeSchema,
    English: gradeSchema,
    Mathematics: gradeSchema,
    Science: gradeSchema,
    History: gradeSchema,
  }),
  electives: z
    .array(z.string().trim().min(1))
    .max(5, "Invalid elective selection."),
});

export const sessionIdSchema = z.string().uuid();

export type ParentProfile = z.infer<typeof parentProfileSchema>;
export type StudentAccount = z.infer<typeof studentAccountSchema>;
export type StudentAssessment = z.infer<typeof studentAssessmentSchema>;
