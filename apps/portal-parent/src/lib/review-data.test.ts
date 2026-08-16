import { createLocalReview, createReviewSubmission } from "./review-data";
import { EMPTY_RATINGS, type ReviewDraft } from "./types";

const draft: ReviewDraft = { universityId: "taylors", course: "Computer Science", year: "2025", ratings: { ...EMPTY_RATINGS, facilities: 8, teaching: 8, classes: 8, safety: 8, value: 8, transport: 8, campusLife: 8, career: 8 }, rating: 0, greenFlags: "", redFlags: "", spillTheTea: "A detailed student experience that future students can use to decide.", vibeTags: [], isAnonymous: true, reviewType: "standard", experiences: {}, photos: {}, declarations: { terms: true, privacy: true, age: true, rights: true } };

describe("review data adapter", () => {
  it("calculates a private pending review without public identity", () => {
    const review = createLocalReview(draft);
    expect(review.rating).toBe(8);
    expect(review.authorLabel).toBe("Anonymous reviewer");
    expect(review.status).toBe("pending");
  });

  it("uses the server moderation contract", () => {
    const submission = createReviewSubmission(draft);
    expect(submission).toMatchObject({ universityId: "taylors", isAnonymous: true });
  });
});
