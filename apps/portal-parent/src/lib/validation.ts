import { z } from "zod";

export const backgroundSchema = z.object({
  course: z.string().trim().min(1, "Course is required").max(120),
  year: z.string().trim().min(1, "Please select your year"),
});

export const finalReviewSchema = z.object({
  rating: z.number().min(1, "Please provide a rating").max(5, "Please provide a rating"),
  spillTheTea: z.string().trim().min(20, "Please share your experience").max(1500),
  vibeTags: z.array(z.string()).max(5),
});

export const authEmailSchema = z.object({
  email: z.email("Enter a valid email address"),
});

export const quickReviewSchema = z.object({
  course: backgroundSchema.shape.course,
  year: backgroundSchema.shape.year,
  rating: finalReviewSchema.shape.rating,
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
