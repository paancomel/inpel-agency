import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { completeCachedAuthentication } from "../lib/auth-flow";
import { getAuthenticatedStudent } from "../lib/portal-data";
import { AuthCallback } from "./AuthCallback";

vi.mock("../lib/auth-flow", () => ({ completeCachedAuthentication: vi.fn() }));
vi.mock("../lib/portal-data", () => ({ getAuthenticatedStudent: vi.fn() }));

const sessionId = "312dce99-2f20-49fd-8c69-220d624d35be";

describe("OAuth callback route", () => {
  it("automatically completes the cached transaction before redirecting to the parent view", async () => {
    vi.mocked(completeCachedAuthentication).mockResolvedValue({ id: sessionId } as never);
    render(
      <MemoryRouter initialEntries={[`/auth/callback?sessionId=${sessionId}`]} future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <Routes>
          <Route path="auth/callback" element={<AuthCallback />} />
          <Route path="parent/:id" element={<h1>Parent view</h1>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByRole("heading", { name: "Parent view" }, { timeout: 5_000 })).toBeInTheDocument();
    expect(completeCachedAuthentication).toHaveBeenCalledWith(sessionId, undefined);
  });

  it("keeps the user on a retry screen when the database write fails", async () => {
    vi.mocked(completeCachedAuthentication).mockRejectedValue(new Error("Cloud write failed"));
    render(
      <MemoryRouter initialEntries={[`/auth/callback?sessionId=${sessionId}`]} future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <Routes><Route path="auth/callback" element={<AuthCallback />} /></Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByRole("alert")).toHaveTextContent("Cloud write failed");
    expect(screen.getByRole("button", { name: /retry secure save/i })).toBeInTheDocument();
  });

  it("restores a confirmed parent session before returning to the invitation form", async () => {
    vi.mocked(getAuthenticatedStudent).mockResolvedValue({ source: "cloud", userId: "parent-user", email: "parent@example.com", confirmationRequired: false });
    render(
      <MemoryRouter initialEntries={["/auth/callback#access_token=confirmed"]} future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <Routes>
          <Route path="auth/callback" element={<AuthCallback />} />
          <Route path="/" element={<h1>Parent invitation form</h1>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByRole("heading", { name: "Parent invitation form" })).toBeInTheDocument();
  });
});
