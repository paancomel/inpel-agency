import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createSessionRecord, saveSession, type SessionRecord } from "../lib/storage";
import { Checkout } from "./Checkout";

vi.mock("../lib/portal-data", () => ({
  syncPayment: vi.fn().mockResolvedValue({ source: "local" }),
}));

describe("checkout route", () => {
  beforeEach(() => localStorage.clear());

  it("unlocks the report and routes to results", async () => {
    const user = userEvent.setup();
    const base = createSessionRecord({
      location: "Selangor",
      budget: "RM 40,000 – RM 70,000",
      email: "parent@example.com",
      expectations: ["Strong graduate outcomes"],
    });
    const completed: SessionRecord = {
      ...base,
      status: "completed",
      studentProgress: 3,
      student: {
        email: "student@example.com",
        submittedAt: new Date().toISOString(),
        assessment: {
          hobbies: ["Coding"],
          psychometric: { analytical: 70, creative: 55, social: 50, practical: 60, enterprising: 45 },
          coreGrades: { "Bahasa Melayu": "A", English: "A", Mathematics: "A+", Science: "A", History: "B+" },
          electives: ["Computer Science"],
        },
      },
    };
    saveSession(completed);

    render(
      <MemoryRouter initialEntries={[`/checkout/${completed.id}`]} future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <Routes>
          <Route path="checkout/:id" element={<Checkout />} />
          <Route path="results/:id" element={<h1>Report unlocked</h1>} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: /unlock full report/i }));
    expect(await screen.findByRole("heading", { name: /report unlocked/i }, { timeout: 2000 })).toBeInTheDocument();
  });
});
