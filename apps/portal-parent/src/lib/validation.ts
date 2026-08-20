import { z } from "zod";
import { RATING_DIMENSIONS } from "./types";

const ratingsSchema = z.object(
  Object.fromEntries(
    RATING_DIMENSIONS.map(([key]) => [key, z.number().min(1, "Choose a score").max(10)]),
  ) as Record<(typeof RATING_DIMENSIONS)[number][0], z.ZodNumber>,
);

const substantiveReviewSchema = z
  .string()
  .trim()
  .max(3000)
  .refine(
    (value) => value.split(/\s+/).filter(Boolean).length >= 30,
    "Write at least 30 words about your experience",
  );

export const backgroundSchema = z.object({
  course: z.string().trim().min(1, "Course is required").max(120),
  year: z.string().regex(/^(19|20)\d{2}$/, "Please select your year"),
});

export const finalReviewSchema = z.object({
  ratings: ratingsSchema,
  spillTheTea: substantiveReviewSchema,
  livingCost: z.number().int().min(300).max(10_000).optional(),
  declarations: z.object({
    terms: z.literal(true, "Accept the terms"),
    privacy: z.literal(true, "Acknowledge the privacy notice"),
    age: z.literal(true, "Confirm you are 18 or older"),
    rights: z.literal(true, "Confirm your content rights"),
  }),
});

export const authEmailSchema = z.object({ email: z.email("Enter a valid email address") });
export const quickReviewSchema = z.object({
  course: backgroundSchema.shape.course,
  year: backgroundSchema.shape.year,
  rating: z.number().min(1).max(10),
});

export type FieldErrors = Record<string, string | undefined>;
export function toFieldErrors(error: z.ZodError): FieldErrors {
  const fields: FieldErrors = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field === "string" && fields[field] === undefined) fields[field] = issue.message;
  }
  return fields;
}
