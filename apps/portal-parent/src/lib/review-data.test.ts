import {
  createLocalReview,
  createReviewSubmission,
  requestMagicLink,
  toPublishedReview,
} from "./review-data";
import { loadPendingCommunityOnboarding } from "./storage";
import { EMPTY_RATINGS, type ReviewDraft } from "./types";

const universityId = "11111111-1111-4111-8111-111111111111";
const draft: ReviewDraft = {
  universityId,
  course: "Computer Science",
  year: "2025",
  ratings: {
    ...EMPTY_RATINGS,
    facilities: 8,
    teaching: 8,
    classes: 8,
    safety: 8,
    value: 8,
    transport: 8,
    campusLife: 8,
    career: 8,
  },
  rating: 0,
  greenFlags: "",
  redFlags: "",
  spillTheTea: "A detailed student experience that future students can use to decide.",
  vibeTags: [],
  isAnonymous: true,
  reviewType: "standard",
  experiences: {},
  photos: {},
  declarations: { terms: true, privacy: true, age: true, rights: true },
};

describe("review data adapter", () => {
  beforeEach(() => localStorage.clear());

  it("calculates a private pending review without public identity", () => {
    const review = createLocalReview(draft);
    expect(review.rating).toBe(8);
    expect(review.authorLabel).toBe("Anonymous reviewer");
    expect(review.status).toBe("pending");
  });

  it("uses the canonical product university and structured moderation contract", () => {
    const submission = createReviewSubmission(draft);
    expect(submission).toMatchObject({ universityId, isAnonymous: true });
    expect(submission.reviewData).toMatchObject({
      universityId,
      content: {
        mainExperience: draft.spillTheTea,
      },
      declarations: {
        version: "inpolor-review-v1",
        age18OrOlder: true,
        termsAccepted: true,
        privacyAcknowledged: true,
        contentRightsConfirmed: true,
      },
    });
  });

  it("reads the structured public projection without flattening all eight ratings", () => {
    const review = toPublishedReview({
      id: "22222222-2222-4222-8222-222222222222",
      university_id: universityId,
      course: "Computer Science",
      year: "2025",
      rating: 7.9,
      rating_facilities: 7,
      rating_teaching: 8,
      rating_class_experience: 9,
      rating_safety: 6,
      rating_value: 8,
      rating_transport: 7,
      rating_campus_life: 9,
      rating_career: 9,
      spill_the_tea: null,
      content: { mainExperience: "The structured experience remains available after moderation." },
      likes_count: 0,
      created_at: "2026-08-17T00:00:00.000Z",
      is_complete_review: false,
    });

    expect(review).toMatchObject({
      universityId,
      spillTheTea: "The structured experience remains available after moderation.",
      ratings: {
        facilities: 7,
        teaching: 8,
        classes: 9,
        safety: 6,
        value: 8,
        transport: 7,
        campusLife: 9,
        career: 9,
      },
    });
  });

  it("persists the age-verification draft before a magic-link navigation", async () => {
    await expect(requestMagicLink("student@example.test", "2000-01-02")).resolves.toBe("demo");
    expect(loadPendingCommunityOnboarding()).toMatchObject({ dateOfBirth: "2000-01-02" });
  });
});
