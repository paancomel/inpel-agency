import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PortalRoutes } from "./App";

vi.mock("../lib/portal-data", () => ({
  syncParentSession: vi.fn().mockResolvedValue({ source: "local" }),
}));

describe("parent invitation routing", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows the blueprint validation messages before creating an invitation", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/"]} future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <PortalRoutes />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: /generate student link/i }));

    expect(await screen.findByText("Please select your location.")).toBeInTheDocument();
    expect(screen.getByText("Please select your budget/salary range.")).toBeInTheDocument();
    expect(screen.getByText("Please enter a valid email address.")).toBeInTheDocument();
  });

  it("creates a durable invitation and exposes the email preview route", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/"]} future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <PortalRoutes />
      </MemoryRouter>,
    );

    await user.selectOptions(screen.getByLabelText(/preferred study location/i), "Selangor");
    await user.selectOptions(screen.getByLabelText(/annual education budget/i), "RM 40,000 – RM 70,000");
    await user.type(screen.getByLabelText(/parent email/i), "parent@example.com");
    await user.click(screen.getByRole("checkbox", { name: /graduate outcomes/i }));
    await user.click(screen.getByRole("button", { name: /generate student link/i }));

    expect(await screen.findByRole("heading", { name: /your invitation is ready/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /preview email invitation/i })).toHaveAttribute(
      "href",
      expect.stringMatching(/^\/email-notification\/[0-9a-f-]{36}$/),
    );
  });

  it("redirects an invalid session route back to the parent portal", async () => {
    render(
      <MemoryRouter initialEntries={["/student/not-a-uuid"]} future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <PortalRoutes />
      </MemoryRouter>,
    );

    expect(
      await screen.findByRole("heading", { name: /find the right university/i }, { timeout: 5_000 }),
    ).toBeInTheDocument();
  });
});
