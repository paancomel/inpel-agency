import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { PortalRoutes } from "./App";

const { liveUniversity } = vi.hoisted(() => ({ liveUniversity: {
  id: "11111111-1111-4111-8111-111111111111", name: "Universiti Data Sebenar", location: "Kuala Lumpur", address: "Kuala Lumpur", shortName: "UDS", type: "Verified institution", website: "", mapUrl: "https://www.google.com/maps", rating: 0, ratings: { facilities: 0, teaching: 0, classes: 0, safety: 0, value: 0, transport: 0, campusLife: 0, career: 0 }, reviewCount: 0, latestReviewAt: "", strengths: [], weaknesses: [], courses: ["Diploma Teknologi Maklumat"],
} }));

vi.mock("../lib/community-data", () => ({
  loadCommunityDirectory: vi.fn().mockResolvedValue({ universities: [liveUniversity], reviewTargets: [liveUniversity], reviews: [], connected: true, message: null }),
  loadCloudSaves: vi.fn().mockResolvedValue([]),
  setCloudSave: vi.fn().mockResolvedValue(undefined),
}));

function renderPortal(path = "/") {
  return render(<MemoryRouter initialEntries={[path]} future={{ v7_relativeSplatPath: true, v7_startTransition: true }}><PortalRoutes /></MemoryRouter>);
}

describe("INPOLOR public experience", () => {
  beforeEach(() => localStorage.clear());

  it("renders the live catalogue directory with launch discovery controls", async () => {
    renderPortal();
    expect(screen.getByRole("heading", { name: /Bantu pelajar lain buat/i })).toBeInTheDocument();
    expect(screen.getByLabelText("Search universities or courses")).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "Universiti Data Sebenar" })).toBeInTheDocument();
    expect(screen.getAllByText("Highest rating").length).toBeGreaterThan(0);
  });

  it("shows a complete institution decision page with eight scores and an approved-only feed", async () => {
    renderPortal(`/universities/${liveUniversity.id}`);
    expect(await screen.findByRole("heading", { name: "Universiti Data Sebenar" })).toBeInTheDocument();
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
    expect(await screen.findByRole("option", { name: /Universiti Data Sebenar/ })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Continue/ }));
    expect(screen.getAllByText("Choose an institution").length).toBeGreaterThan(0);
    expect(screen.getByText("Course is required")).toBeInTheDocument();
    expect(screen.getByText("Please select your year")).toBeInTheDocument();
  });

  it("returns a field error instead of crashing when only the institution is missing", async () => {
    const user = userEvent.setup();
    renderPortal("/submit-review");
    await screen.findByRole("option", { name: /Universiti Data Sebenar/ });

    await user.type(screen.getByLabelText("Course"), "Diploma Teknologi Maklumat");
    await user.selectOptions(
      screen.getByLabelText("Calendar year studied"),
      String(new Date().getFullYear()),
    );
    await user.click(screen.getByRole("button", { name: /Continue/ }));

    expect(screen.getByText("Choose an institution")).toBeInTheDocument();
    expect(screen.getByText("STEP 1 OF 5")).toBeInTheDocument();
  });

  it("serves legal documents and exposes all footer legal links", () => {
    renderPortal("/legal/privacy-ms");
    expect(screen.getByText(/Dasar Privasi dan Notis Perlindungan Data Peribadi/)).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Terms & Conditions" })[0]).toHaveAttribute("href", "/legal/terms");
    expect(screen.getAllByRole("link", { name: "Privacy Policy (English)" })[0]).toHaveAttribute("href", "/legal/privacy");
  });
});
