import { EMPTY_RATINGS } from "./types";
import { finalReviewSchema } from "./validation";

const ratings = {
  ...EMPTY_RATINGS,
  facilities: 8,
  teaching: 8,
  classes: 8,
  safety: 8,
  value: 8,
  transport: 8,
  campusLife: 8,
  career: 8,
};
const declarations = { terms: true, privacy: true, age: true, rights: true } as const;

describe("INPOLOR review validation", () => {
  it("requires a substantive thirty-word public experience", () => {
    expect(finalReviewSchema.safeParse({
      ratings,
      spillTheTea: "This sentence has more than thirty characters but far fewer than thirty words.",
      declarations,
    }).success).toBe(false);

    expect(finalReviewSchema.safeParse({
      ratings,
      spillTheTea: Array.from({ length: 30 }, (_, index) => `word${index}`).join(" "),
      declarations,
    }).success).toBe(true);
  });

  it("keeps living-cost evidence inside the same server bounds", () => {
    const review = Array.from({ length: 30 }, (_, index) => `word${index}`).join(" ");
    expect(finalReviewSchema.safeParse({
      ratings,
      spillTheTea: review,
      livingCost: 299,
      declarations,
    }).success).toBe(false);
    expect(finalReviewSchema.safeParse({
      ratings,
      spillTheTea: review,
      livingCost: 10_001,
      declarations,
    }).success).toBe(false);
    expect(finalReviewSchema.safeParse({
      ratings,
      spillTheTea: review,
      livingCost: 1_800,
      declarations,
    }).success).toBe(true);
  });
});
