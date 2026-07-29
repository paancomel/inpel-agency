import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { ParentHandoff } from "./ParentHandoff";

vi.mock("../components/ParentSessionGate", () => ({
  ParentSessionGate: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const sessionId = "33333333-3333-4333-8333-333333333333";

describe("parent completion handoff", () => {
  it("keeps the free demo activation on the parent-facing view after server ownership verification", () => {
    render(<MemoryRouter initialEntries={[`/parent/${sessionId}`]} future={{ v7_relativeSplatPath: true, v7_startTransition: true }}><Routes><Route path="parent/:id" element={<ParentHandoff />} /></Routes></MemoryRouter>);

    expect(screen.getByRole("heading", { name: /the assessment is ready for your review/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /activate the free demo report/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /continue to free demo report/i })).toHaveAttribute("href", `/checkout/${sessionId}`);
  });
});
