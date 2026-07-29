import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import { App, PortalRoutes } from "./App";

function renderPortal(path = "/") {
  return render(
    <MemoryRouter
      initialEntries={[path]}
      future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
    >
      <PortalRoutes />
    </MemoryRouter>,
  );
}

describe("INPOLOR portal routes", () => {
  it("mounts the shared cookie consent banner at the application root", async () => {
    localStorage.clear();
    window.history.replaceState({}, "", "/");
    render(<App />);

    expect(await screen.findByRole("region", { name: "Cookie consent" })).toBeInTheDocument();
  });

  it("renders the university profile, review feed, and sidebar metrics", async () => {
    renderPortal();

    await screen.findByText("Device preview");

    expect(screen.getByRole("heading", { name: "Taylor's University" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Reviews from students, not brochures." })).toBeInTheDocument();
    expect(screen.getByText("4.4 / 5")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Reviews" })).toHaveAttribute("aria-selected", "true");
  });

  it("moves the community unlock prompt into every review card", async () => {
    const user = userEvent.setup();
    renderPortal();

    expect(screen.queryByText("Community unlock", { exact: false })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "The things brochures skip." })).not.toBeInTheDocument();
    expect(screen.getAllByRole("heading", { name: "The Unspoken Truth" })).toHaveLength(3);

    await user.click(screen.getAllByRole("button", { name: "Contribute to Unlock" })[0]!);
    expect(screen.getByRole("dialog", { name: "Unlock Unspoken Truths" })).toBeInTheDocument();
  });

  it("shows a friendly empty state when filters yield no results", async () => {
    const user = userEvent.setup();
    renderPortal();

    await user.type(screen.getByRole("searchbox", { name: "Search reviews" }), "quantum dentistry");

    expect(screen.getByRole("heading", { name: "No reviews match that search" })).toBeInTheDocument();
    expect(screen.getByText("Try another course, year, or rating.")).toBeInTheDocument();
  });

  it("updates the main content heading when a topic tab is selected", async () => {
    const user = userEvent.setup();
    renderPortal();

    await user.click(screen.getByRole("tab", { name: "Tuition" }));

    expect(screen.getByRole("heading", { name: "What students say about tuition." })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Tuition" })).toHaveAttribute("aria-selected", "true");
  });

  it("opens the gamified quick review route for gated truths", async () => {
    const user = userEvent.setup();
    renderPortal();

    await user.click(screen.getByRole("tab", { name: "Unspoken Truths" }));
    const dialog = screen.getByRole("dialog", { name: "Unlock Unspoken Truths" });
    await user.click(within(dialog).getByRole("button", { name: "Submit & Unlock Secrets" }));

    expect(within(dialog).getByText("Course is required")).toBeInTheDocument();
    expect(within(dialog).getByText("Please select your year")).toBeInTheDocument();
    expect(within(dialog).getByText("Please provide a rating")).toBeInTheDocument();
  });

  it("validates and completes the multi-step review route", async () => {
    const user = userEvent.setup();
    renderPortal("/submit-review");

    const dialog = screen.getByRole("dialog", { name: "Write a Review" });
    await user.click(within(dialog).getByRole("button", { name: "Next" }));
    expect(within(dialog).getByText("Course is required")).toBeInTheDocument();
    expect(within(dialog).getByText("Please select your year")).toBeInTheDocument();

    await user.type(within(dialog).getByLabelText("Course or major"), "Interaction Design");
    await user.selectOptions(within(dialog).getByLabelText("Year of study"), "Year 3");
    await user.click(within(dialog).getByRole("button", { name: "Next" }));
    await user.type(within(dialog).getByLabelText("Green flags"), "Excellent studio mentors");
    await user.type(within(dialog).getByLabelText("Red flags"), "Late critique sessions");
    await user.click(within(dialog).getByRole("button", { name: "Next" }));
    await user.click(within(dialog).getByRole("button", { name: "Rate 5 out of 5" }));
    await user.type(
      within(dialog).getByLabelText("Spill the tea"),
      "The studio culture is demanding, but the feedback made my portfolio much stronger.",
    );
    await user.click(within(dialog).getByRole("button", { name: "Submit review" }));

    expect(within(dialog).getByRole("heading", { name: "Your review is saved on this device." })).toBeInTheDocument();
    expect(localStorage.getItem("inpolor:reviews:v1")).toContain("Interaction Design");
    await user.click(within(dialog).getByRole("button", { name: "Close" }));
    expect(screen.getByText(/Interaction Design/)).toBeInTheDocument();
  }, 15_000);

  it("keeps likes and comments unavailable until their server-authorized flows exist", async () => {
    renderPortal();

    await screen.findByText("Device preview");

    const helpful = screen.getAllByRole("button", { name: /Helpful/ })[0]!;
    const comment = screen.getAllByRole("button", { name: "Comment" })[0]!;
    expect(helpful).toBeDisabled();
    expect(helpful).toHaveAttribute("title", "Helpful votes are not available yet.");
    expect(comment).toBeDisabled();
    expect(comment).toHaveAttribute("title", "Comments are not available yet.");
  });
});
