import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { PortalProvider } from "../state/PortalContext";
import { App, AppRoutes } from "./App";

function renderApp(initialEntry = "/login") {
  return render(
    <MemoryRouter
      initialEntries={[initialEntry]}
      future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
    >
      <PortalProvider>
        <AppRoutes />
      </PortalProvider>
    </MemoryRouter>,
  );
}

describe("INPELER portal routing", () => {
  it("mounts the shared cookie consent banner at the application root", async () => {
    localStorage.clear();
    window.history.replaceState({}, "", "/login");
    render(<App />);

    expect(await screen.findByRole("region", { name: "Cookie consent" })).toBeInTheDocument();
  });

  it("protects dashboard routes until the representative is authenticated", async () => {
    renderApp("/dashboard/global-profile");

    expect(
      await screen.findByRole("heading", { name: /institutional portal/i }, { timeout: 5_000 }),
    ).toBeInTheDocument();
  });

  it("supports the blueprint add-programme flow", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(await screen.findByRole("button", { name: /preview dashboard/i }));
    await user.click(screen.getByRole("link", { name: /^programmes$/i }));
    const addProgramLinks = screen.getAllByRole("link", { name: /add new program/i });
    await user.click(addProgramLinks[0]!);
    await user.type(screen.getByLabelText(/course name/i), "Bachelor of Computing");
    await user.type(screen.getByLabelText(/faculty\/school/i), "School of Computing");
    await user.type(screen.getByLabelText(/mqa accreditation code/i), "MQA/FA12345");
    await user.click(screen.getByRole("button", { name: /review data/i }));

    expect(
      await screen.findByRole("heading", { level: 2, name: /review and publish/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Bachelor of Computing")).toBeInTheDocument();
  }, 15_000);

  it("shows both publish blockers for an empty unattested draft", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(await screen.findByRole("button", { name: /preview dashboard/i }));
    await user.click(screen.getByRole("link", { name: /review and publish/i }));
    await user.click(screen.getByRole("button", { name: /publish to inpeler portal/i }));

    expect(screen.getByText(/add at least one programme/i)).toBeInTheDocument();
    expect(screen.getByText(/confirm the institution accuracy attestation/i)).toBeInTheDocument();
  });

  it("returns to protected login state after signing out", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(await screen.findByRole("button", { name: /preview dashboard/i }));
    await user.click(await screen.findByRole("button", { name: /sign out/i }));

    expect(
      await screen.findByRole("heading", { name: /institutional portal/i }),
    ).toBeInTheDocument();
  });

  it("keeps legal documents public and links all available versions", () => {
    renderApp("/legal/privacy");
    expect(screen.getByText(/Privacy Policy and Personal Data Protection Notice/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Terms & Conditions" })).toHaveAttribute("href", "/legal/terms");
    expect(screen.getByRole("link", { name: "Dasar Privasi (Bahasa Malaysia)" })).toHaveAttribute("href", "/legal/privacy-ms");
  });
});
