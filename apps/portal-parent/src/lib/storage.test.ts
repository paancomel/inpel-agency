import type { Review } from "./types";
import { loadStoredReviews, saveStoredReviews } from "./storage";

const review: Review = {
  id: "review-1",
  course: "Computer Science",
  year: "Year 3",
  rating: 5,
  greenFlags: "Supportive lecturers",
  redFlags: "Busy parking",
  spillTheTea: "The project culture taught me how to work in a real team.",
  vibeTags: ["Career-ready"],
  isAnonymous: true,
  authorLabel: "Anonymous student",
  createdAt: "2026-07-14T00:00:00.000Z",
  likesCount: 0,
  comments: [],
};

describe("review persistence", () => {
  it("recovers from malformed localStorage content", () => {
    localStorage.setItem("inpolor:reviews:v1", "{not valid json");

    expect(loadStoredReviews()).toEqual([]);
  });

  it("round-trips valid reviews", () => {
    expect(saveStoredReviews([review])).toEqual({ ok: true });
    expect(loadStoredReviews()).toEqual([review]);
  });

  it("returns a friendly failure when browser storage is full", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    });

    expect(saveStoredReviews([review])).toEqual({
      ok: false,
      message: "Your review could not be saved on this device. Please try again.",
    });
  });
});
