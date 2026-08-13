import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { App, PortalRoutes } from "./App";

vi.mock("../lib/portal-data", () => ({
  getAuthenticatedStudent: vi.fn().mockRejectedValue(new Error("No active session")),
  authenticateParentAccount: vi.fn().mockResolvedValue({
    source: "cloud",
    userId: "11111111-1111-4111-8111-111111111111",
    email: "parent@example.com",
    confirmationRequired: false,
  }),
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
  beforeEach(() => { localStorage.clear(); vi.clearAllMocks(); });

  async function authenticateParent(user: ReturnType<typeof userEvent.setup>) {
    await user.type(screen.getByLabelText(/^parent email$/i), "parent@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "a-secure-demo-password");
    await user.click(screen.getByRole("button", { name: /create parent account/i }));
    await screen.findByRole("button", { name: /generate student link/i });
  }

  it("shows every required parent validation message", async () => {
    const user = userEvent.setup();
    renderRoutes();
    await authenticateParent(user);
    await user.click(screen.getByRole("button", { name: /generate student link/i }));

    expect(await screen.findByText("Please select your location.")).toBeInTheDocument();
    expect(screen.getByText("Please select your monthly household income.")).toBeInTheDocument();
    expect(screen.getByText("Please enter a valid student email address.")).toBeInTheDocument();
    expect(screen.getAllByText("Please answer every parental preference question.")).toHaveLength(4);
  });

  it("offers every Malaysian state and creates a durable invitation", async () => {
    const user = userEvent.setup();
    renderRoutes();
    await authenticateParent(user);

    const location = screen.getByLabelText(/preferred study location/i);
    expect(screen.getByRole("option", { name: "Perlis" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Labuan" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Putrajaya" })).toBeInTheDocument();
    await user.selectOptions(location, "Selangor");
    await user.selectOptions(screen.getByLabelText(/monthly household income/i), "RM 6,000 - RM 9,999");
    await user.type(screen.getByLabelText(/^student email$/i), "student@example.com");
    await user.click(screen.getByRole("radio", { name: /public \(ipta\)/i }));
    await user.click(screen.getByRole("radio", { name: /campus safety/i }));
    await user.click(screen.getByRole("radio", { name: /high-paying employment/i }));
    await user.click(screen.getByRole("radio", { name: /structural guidance/i }));
    await user.click(screen.getByRole("button", { name: /generate student link/i }));

    expect(await screen.findByRole("heading", { name: /your invitation is ready/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /preview email invitation/i })).toHaveAttribute(
      "href",
      expect.stringMatching(/^\/email-notification\/[0-9a-f-]{36}\?token=[a-f0-9]{64}$/),
    );
  });

  it("redirects an invalid session route back to the parent portal", async () => {
    renderRoutes("/student/not-a-uuid");
    expect(await screen.findByRole("heading", { name: /secure your family invitation/i }, { timeout: 5_000 })).toBeInTheDocument();
  });

  it("mounts the shared cookie consent banner at the application root", async () => {
    window.history.replaceState({}, "", "/");
    render(<App />);

    expect(await screen.findByRole("region", { name: "Cookie consent" })).toBeInTheDocument();
  });
});
