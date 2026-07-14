import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createSessionRecord, saveSession } from "../lib/storage";
import { StudentPortal } from "./StudentPortal";

vi.mock("../lib/portal-data", () => ({
  syncStudentAssessment: vi.fn().mockResolvedValue({ source: "local" }),
}));

describe("student assessment wizard", () => {
  beforeEach(() => localStorage.clear());

  it("validates account credentials and prevents empty hobby progress", async () => {
    const user = userEvent.setup();
    const session = createSessionRecord({
      location: "Selangor",
      budget: "RM 40,000 – RM 70,000",
      email: "parent@example.com",
      expectations: ["Strong graduate outcomes"],
    });
    saveSession(session);

    render(
      <MemoryRouter initialEntries={[`/student/${session.id}`]} future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <Routes>
          <Route path="student/:id" element={<StudentPortal />} />
        </Routes>
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText(/student email/i), "student@example.com");
    await user.type(screen.getByLabelText(/^password/i), "short");
    await user.click(screen.getByRole("button", { name: /continue to assessment/i }));
    expect(await screen.findByText("Password must be at least 8 characters long.")).toBeInTheDocument();

    await user.clear(screen.getByLabelText(/^password/i));
    await user.type(screen.getByLabelText(/^password/i), "a-secure-demo-password");
    await user.click(screen.getByRole("button", { name: /continue to assessment/i }));
    expect(await screen.findByRole("heading", { name: /what pulls you in/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^next$/i }));
    expect(await screen.findByText("Please select at least one hobby to continue.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Coding" }));
    await user.click(screen.getByRole("button", { name: /^next$/i }));
    expect(await screen.findByRole("heading", { name: /how do you naturally work/i })).toBeInTheDocument();
  });

  it("recovers an incomplete legacy progress marker at the account step", () => {
    const base = createSessionRecord({
      location: "Selangor",
      budget: "RM 40,000 – RM 70,000",
      email: "parent@example.com",
      expectations: ["Affordable total cost"],
    });
    saveSession({ ...base, studentProgress: 2 });

    render(
      <MemoryRouter initialEntries={[`/student/${base.id}`]} future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <Routes>
          <Route path="student/:id" element={<StudentPortal />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: /first, make this session yours/i })).toBeInTheDocument();
  });
});
