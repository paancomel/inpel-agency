import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";

import { createSessionRecord, saveSession } from "../lib/storage";
import { EmailNotification } from "./EmailNotification";

const invitationToken = "a".repeat(64);
const parent = {
  location: "Selangor", income: "RM 6,000 - RM 9,999", email: "parent@example.com", studentEmail: "student@example.com",
  studentAgeBand: "18+", guardianConsentConfirmed: false,
  preferences: {
    campusVibe: "Public (IPTA) - Warm & Local", campusConcern: "Campus safety & physical well-being",
    ultimateWin: "Guaranteed high-paying employment", independence: "Needs some structural guidance",
  },
} as const;

describe("invitation email preview", () => {
  beforeEach(() => localStorage.clear());

  it("retains the opaque token in the student link", () => {
    const session = createSessionRecord(parent);
    saveSession(session);
    render(<MemoryRouter initialEntries={[`/email-notification/${session.id}?token=${invitationToken}`]} future={{ v7_relativeSplatPath: true, v7_startTransition: true }}><Routes><Route path="email-notification/:id" element={<EmailNotification />} /></Routes></MemoryRouter>);

    expect(screen.getByRole("link", { name: /start student assessment/i })).toHaveAttribute("href", `/student/${session.id}?token=${invitationToken}`);
  });
});
