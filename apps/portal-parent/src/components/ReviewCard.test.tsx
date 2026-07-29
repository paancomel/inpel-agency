import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SEED_REVIEWS } from "../lib/seed-data";
import { ReviewCard } from "./ReviewCard";

describe("ReviewCard", () => {
  it("presents an unreadable locked truth teaser and unlock action", async () => {
    const user = userEvent.setup();
    const onUnlockTruth = vi.fn();

    const { container } = render(
      <ReviewCard
        review={SEED_REVIEWS[0]!}
        onUnlockTruth={onUnlockTruth}
      />,
    );

    expect(screen.getByRole("heading", { name: "The Unspoken Truth" })).toBeInTheDocument();
    expect(screen.getByText("Locked")).toBeInTheDocument();

    const hiddenCopy = container.querySelector('[aria-hidden="true"].blur-md');
    expect(hiddenCopy).toHaveClass("select-none", "text-transparent", "bg-clip-text");

    await user.click(screen.getByRole("button", { name: "Contribute to Unlock" }));
    expect(onUnlockTruth).toHaveBeenCalledOnce();
  });
});
