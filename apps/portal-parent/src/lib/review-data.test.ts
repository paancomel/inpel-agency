import { createReviewSubmission } from "./review-data";

describe("database review payloads", () => {
  it("scrubs user identity when an anonymous review is submitted", () => {
    const payload = createReviewSubmission({
      universityId: "university-123",
      course: "Design",
      year: "Year 2",
      rating: 4,
      greenFlags: "Great studio culture",
      redFlags: "Limited electives",
      spillTheTea: "The feedback is direct but always useful.",
      vibeTags: ["Creative"],
      isAnonymous: true,
      identity: { userId: "user-123", email: "student@example.com" },
    });

    expect(payload.universityId).toBe("university-123");
    expect(payload.isAnonymous).toBe(true);
    expect(JSON.stringify(payload.reviewData)).not.toContain("user-123");
    expect(JSON.stringify(payload.reviewData)).not.toContain("student@example.com");
  });

  it("never includes a signed-in identity in a moderated review payload", () => {
    const payload = createReviewSubmission({
      universityId: "university-456",
      course: "Engineering",
      year: "Year 4",
      rating: 5,
      greenFlags: "Industry projects",
      redFlags: "Heavy workload",
      spillTheTea: "The capstone opened doors to my first internship.",
      vibeTags: ["Career-ready"],
      isAnonymous: false,
      identity: { userId: "user-456", email: "verified@example.com" },
    });

    expect(payload.isAnonymous).toBe(false);
    expect(payload.reviewData).toMatchObject({
      course: "Engineering",
    });
    expect(JSON.stringify(payload.reviewData)).not.toContain("user-456");
    expect(JSON.stringify(payload.reviewData)).not.toContain("verified@example.com");
  });
});
