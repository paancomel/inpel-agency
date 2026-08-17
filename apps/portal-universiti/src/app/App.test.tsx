import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { App, PortalRoutes } from "./App";
import { syncParentSession } from "../lib/portal-data";

vi.mock("../lib/portal-data", () => ({
  getAuthenticatedStudent: vi.fn().mockRejectedValue(new Error("No active session")),
  authenticateParentAccount: vi.fn().mockResolvedValue({
    source: "cloud",
    userId: "11111111-1111-4111-8111-111111111111",
    email: "parent@example.com",
    confirmationRequired: false,
  }),
  beginStudentOAuth: vi.fn().mockResolvedValue(undefined),
  syncParentSession: vi.fn().mockResolvedValue({
    source: "cloud",
    sessionId: "22222222-2222-4222-8222-222222222222",
    invitationToken: "a".repeat(64),
    expiresAt: "2026-08-01T00:00:00.000Z",
  }),
  revokeParentStudentInvitation: vi.fn().mockResolvedValue(undefined),
}));

function renderRoutes(path = "/") {
  return render(
    <MemoryRouter initialEntries={[path]} future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <PortalRoutes />
    </MemoryRouter>,
  );
}

describe("parent invitation routing", () => {
  beforeEach(() => { localStorage.clear(); localStorage.setItem("inpel-language", "en"); vi.clearAllMocks(); });

  async function completePriorities(user: ReturnType<typeof userEvent.setup>, ageBand: "15-17" | "18+" = "18+") {
    await user.selectOptions(screen.getByLabelText(/where would they like to study/i), "Selangor");
    await user.selectOptions(screen.getByLabelText(/family’s monthly budget/i), "RM 6,000 - RM 9,999");
    await user.type(screen.getByLabelText(/^student email$/i), "student@example.com");
    await user.selectOptions(screen.getByLabelText(/student age group/i), ageBand);
    await user.click(screen.getByRole("radio", { name: /public \(ipta\)/i }));
    await user.click(screen.getByRole("radio", { name: /campus safety/i }));
    await user.click(screen.getByRole("radio", { name: /high-paying employment/i }));
    await user.click(screen.getByRole("radio", { name: /structural guidance/i }));
    await user.click(screen.getByRole("button", { name: /continue to secure your invitation/i }));
  }

  async function authenticateParent(user: ReturnType<typeof userEvent.setup>) {
    await user.type(screen.getByLabelText(/^parent email$/i), "parent@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "a-secure-demo-password");
    await user.click(screen.getByRole("button", { name: /create parent account/i }));
    await screen.findByRole("button", { name: /create invitation/i });
  }

  it("shows every required parent validation message", async () => {
    const user = userEvent.setup();
    renderRoutes();
    await user.click(screen.getByRole("button", { name: /continue to secure your invitation/i }));

    expect(await screen.findByText("Please select your location.")).toBeInTheDocument();
    expect(screen.getByText("Please select your monthly household income.")).toBeInTheDocument();
    expect(screen.getByText("Please enter a valid student email address.")).toBeInTheDocument();
    expect(screen.getAllByText("Please answer every parental preference question.")).toHaveLength(4);
  });

  it("offers every Malaysian state and creates a durable invitation", async () => {
    const user = userEvent.setup();
    renderRoutes();
    expect(screen.getByRole("option", { name: "Perlis" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Labuan" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Putrajaya" })).toBeInTheDocument();
    await completePriorities(user);
    await authenticateParent(user);
    await user.click(screen.getByRole("button", { name: /confirm account and create invitation/i }));

    expect(await screen.findByRole("heading", { name: /your invitation is ready/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /preview email invitation/i })).toHaveAttribute(
      "href",
      expect.stringMatching(/^\/email-notification\/[0-9a-f-]{36}\?token=[a-f0-9]{64}$/),
    );
  });

  it("requires and submits an explicit guardian declaration for a 15-to-17-year-old student", async () => {
    const user = userEvent.setup();
    renderRoutes();
    await completePriorities(user, "15-17");
    await authenticateParent(user);

    const createButton = screen.getByRole("button", { name: /record consent and create invitation/i });
    expect(createButton).toBeDisabled();
    await user.click(screen.getByRole("checkbox", { name: /i declare that i am the student's parent or legal guardian/i }));
    expect(createButton).toBeEnabled();
    await user.click(createButton);

    expect(syncParentSession).toHaveBeenCalledWith(expect.objectContaining({
      studentAgeBand: "15-17",
      guardianConsentConfirmed: true,
    }));
  });

  it("redirects an invalid session route back to the parent portal", async () => {
    renderRoutes("/student/not-a-uuid");
    expect(await screen.findByRole("heading", { name: /what matters to your family/i }, { timeout: 5_000 })).toBeInTheDocument();
  });

  it("mounts the shared cookie consent banner at the application root", async () => {
    window.history.replaceState({}, "", "/");
    render(<App />);

    expect(await screen.findByRole("region", { name: "Cookie consent" })).toBeInTheDocument();
  });

  it("serves the full legal documents and exposes all legal links", () => {
    renderRoutes("/legal/terms");
    expect(screen.getByText(/Terms and Conditions/)).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Privacy Policy (English)" })[0]).toHaveAttribute("href", "/legal/privacy");
    expect(screen.getAllByRole("link", { name: "Dasar Privasi (Bahasa Malaysia)" })[0]).toHaveAttribute("href", "/legal/privacy-ms");
  });

  it("defaults to Bahasa Melayu and keeps a selected language for the next route", async () => {
    localStorage.clear();
    const user = userEvent.setup();
    renderRoutes();

    expect(screen.getByRole("heading", { name: "Jom cari universiti yang sesuai." })).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText("Pilih bahasa"), "ta");
    expect(document.documentElement.lang).toBe("ta");
    expect(localStorage.getItem("inpel-language")).toBe("ta");
  });
});
