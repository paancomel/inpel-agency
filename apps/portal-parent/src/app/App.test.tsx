import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { PortalRoutes } from "./App";

function renderPortal(path = "/") {
  return render(<MemoryRouter initialEntries={[path]} future={{ v7_relativeSplatPath: true, v7_startTransition: true }}><PortalRoutes /></MemoryRouter>);
}

describe("INPOLOR public experience", () => {
  beforeEach(() => localStorage.clear());

  it("renders the KL and Selangor directory with launch discovery controls", () => {
    renderPortal();
    expect(screen.getByRole("heading", { name: /Bantu pelajar lain buat/i })).toBeInTheDocument();
    expect(screen.getByLabelText("Search universities or courses")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Taylor's University" })).toBeInTheDocument();
    expect(screen.getAllByText("Highest rating").length).toBeGreaterThan(0);
  });

  it("shows a complete institution decision page with eight scores and an approved-only feed", () => {
    renderPortal("/universities/taylors");
    expect(screen.getByRole("heading", { name: "Taylor's University" })).toBeInTheDocument();
    expect(screen.getByText("Facilities & equipment")).toBeInTheDocument();
    expect(screen.getByText("Career prospects")).toBeInTheDocument();
    expect(screen.queryByText("Anonymous reviewer")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Reviews from students, not brochures." })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Ask the people who were there." })).toBeInTheDocument();
  });

  it("starts the five-step review wizard and preserves background validation", async () => {
    const user = userEvent.setup();
    renderPortal("/submit-review");
    expect(screen.getByText("STEP 1 OF 5")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Continue/ }));
    expect(screen.getAllByText("Choose an institution").length).toBeGreaterThan(0);
    expect(screen.getByText("Course is required")).toBeInTheDocument();
    expect(screen.getByText("Please select your year")).toBeInTheDocument();
  });
});
