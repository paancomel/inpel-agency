import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { authenticateStudentAccount, beginStudentOAuth } from "../lib/portal-data";
import { createSessionRecord, readSession, saveSession } from "../lib/storage";
import { StudentPortal } from "./StudentPortal";

vi.mock("../lib/portal-data", () => ({
  authenticateStudentAccount: vi.fn((email: string) => Promise.resolve({ source: "cloud", userId: "student-user", email, confirmationRequired: false })),
  beginStudentOAuth: vi.fn().mockResolvedValue(undefined),
  getAuthenticatedStudent: vi.fn(),
  claimStudentInvitation: vi.fn().mockImplementation(() => Promise.resolve({ sessionId: activeSessionId, status: "claimed" })),
  syncStudentAssessment: vi.fn().mockResolvedValue({ source: "cloud" }),
}));

let activeSessionId = "";
const invitationToken = "a".repeat(64);

const parentProfile = {
  location: "Selangor",
  income: "RM 6,000 - RM 9,999",
  email: "parent@example.com",
  studentEmail: "student@example.com",
  preferences: {
    campusVibe: "Public (IPTA) - Warm & Local",
    campusConcern: "Campus safety & physical well-being",
    ultimateWin: "Guaranteed high-paying employment",
    independence: "Needs some structural guidance",
  },
} as const;

function renderStudent(id: string) {
  activeSessionId = id;
  return render(
    <MemoryRouter initialEntries={[`/student/${id}?token=${invitationToken}`]} future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <Routes>
        <Route path="student/:id" element={<StudentPortal />} />
        <Route path="parent/:id" element={<h1>Parent notification handoff</h1>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("student assessment wizard", () => {
  beforeEach(() => { localStorage.clear(); sessionStorage.clear(); vi.clearAllMocks(); });

  it("starts with the 16-question personality test and requires every answer", async () => {
    const user = userEvent.setup();
    const session = createSessionRecord(parentProfile);
    saveSession(session);
    renderStudent(session.id);

    expect(screen.getByRole("heading", { name: /personality and career compass/i })).toBeInTheDocument();
    expect(screen.getAllByRole("radio", { name: /^agree$/i })).toHaveLength(16);
    await user.click(screen.getByRole("button", { name: /^next$/i }));
    expect(await screen.findByText("Please answer all 16 personality questions.")).toBeInTheDocument();

    for (const option of screen.getAllByRole("radio", { name: /^agree$/i })) await user.click(option);
    await user.click(screen.getByRole("button", { name: /^next$/i }));
    expect(await screen.findByRole("heading", { name: /how do you naturally work/i })).toBeInTheDocument();
  }, 30_000);

  it("recovers an incomplete progress marker at the personality step", () => {
    const base = createSessionRecord(parentProfile);
    saveSession({ ...base, studentProgress: 3 });
    renderStudent(base.id);
    expect(screen.getByRole("heading", { name: /personality and career compass/i })).toBeInTheDocument();
  });

  it("completes personality, dynamic SPM subjects, Vibe Check, and the mandatory auth handoff", async () => {
    const user = userEvent.setup();
    const session = createSessionRecord(parentProfile);
    saveSession(session);
    renderStudent(session.id);

    for (const option of screen.getAllByRole("radio", { name: /^agree$/i })) await user.click(option);
    await user.click(screen.getByRole("button", { name: /^next$/i }));
    await user.click(await screen.findByRole("button", { name: /^next$/i }));

    await user.type(await screen.findByLabelText(/spm subject 1/i), "Biology");
    await user.selectOptions(screen.getByLabelText(/^grade$/i), "A");
    await user.click(screen.getByRole("button", { name: /add subject/i }));
    await user.type(screen.getByLabelText(/spm subject 2/i), "Chemistry");
    await user.selectOptions(screen.getAllByLabelText(/^grade$/i)[1]!, "B+");
    await user.click(screen.getByRole("button", { name: /^next$/i }));

    expect(await screen.findByRole("heading", { name: /the vibe check quiz/i })).toBeInTheDocument();
    for (const choice of [/cozy night in/i, /green & peaceful/i, /independent focus/i, /room to explore/i, /studio & making/i, /build impact at home/i]) {
      await user.click(screen.getByRole("button", { name: choice }));
    }
    await user.click(screen.getByRole("button", { name: /lock in profile/i }));

    expect(await screen.findByRole("heading", { name: /let’s lock in your profile/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^log in$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /google/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /facebook/i })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /facebook/i }));
    expect(beginStudentOAuth).toHaveBeenCalledWith(
      "facebook",
      expect.stringMatching(new RegExp(`/auth/callback\\?sessionId=${session.id}&token=${invitationToken}$`)),
    );
    const redirectDraft = localStorage.getItem(`inpel:auth-draft:v1:${session.id}`);
    expect(redirectDraft).toContain('"provider":"facebook"');
    expect(redirectDraft).not.toContain("password");

    await user.type(screen.getByLabelText(/student email/i), "student@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "a-secure-demo-password");
    await user.click(screen.getByRole("button", { name: /create account & notify parent/i }));
    expect(await screen.findByRole("heading", { name: /parent notification handoff/i })).toBeInTheDocument();
    expect(authenticateStudentAccount).toHaveBeenCalledWith(
      "student@example.com",
      "a-secure-demo-password",
      "signup",
      expect.stringMatching(new RegExp(`/auth/callback\\?sessionId=${session.id}&token=${invitationToken}$`)),
    );

    const completed = readSession(session.id);
    expect(completed?.authentication?.provider).toBe("password");
    expect(completed?.student?.assessment.subjects).toEqual([{ subject: "Biology", grade: "A" }, { subject: "Chemistry", grade: "B+" }]);
    expect(completed?.student?.assessment.vibeAnswers.futureHorizon).toBe("local");
    expect(localStorage.getItem(`inpel:session:${session.id}`)).not.toContain("a-secure-demo-password");
  }, 30_000);
});
