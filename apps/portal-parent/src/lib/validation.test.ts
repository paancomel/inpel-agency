import {
  authEmailSchema,
  backgroundSchema,
  finalReviewSchema,
  quickReviewSchema,
} from "./validation";

describe("INPOLOR form validation", () => {
  it("uses the blueprint messages for missing student background", () => {
    const result = backgroundSchema.safeParse({ course: "", year: "" });

    expect(result.error?.flatten().fieldErrors).toEqual({
      course: ["Course is required"],
      year: ["Please select your year"],
    });
  });

  it("requires a rating and a meaningful experience", () => {
    const result = finalReviewSchema.safeParse({ rating: 0, spillTheTea: "", vibeTags: [] });

    expect(result.error?.flatten().fieldErrors).toEqual({
      rating: ["Please provide a rating"],
      spillTheTea: ["Please share your experience"],
    });
  });

  it("rejects malformed authentication email addresses", () => {
    const result = authEmailSchema.safeParse({ email: "not-an-email" });

    expect(result.error?.flatten().fieldErrors.email).toEqual([
      "Enter a valid email address",
    ]);
  });

  it("validates every field required to unlock Unspoken Truths", () => {
    const result = quickReviewSchema.safeParse({ course: "", year: "", rating: 0 });

    expect(result.error?.flatten().fieldErrors).toEqual({
      course: ["Course is required"],
      year: ["Please select your year"],
      rating: ["Please provide a rating"],
    });
  });
});
