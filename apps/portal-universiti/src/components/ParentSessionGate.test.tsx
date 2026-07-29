import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { confirmCurrentParentOwnership } from "../lib/portal-data";
import { ParentSessionGate } from "./ParentSessionGate";

vi.mock("../lib/portal-data", () => ({
  authenticateParentAccount: vi.fn(),
  confirmCurrentParentOwnership: vi.fn(),
}));

const sessionId = "44444444-4444-4444-8444-444444444444";

describe("ParentSessionGate", () => {
  beforeEach(() => vi.clearAllMocks());

  it("keeps private content hidden until the server confirms current parent ownership", async () => {
    vi.mocked(confirmCurrentParentOwnership).mockResolvedValue(undefined);
    render(<ParentSessionGate sessionId={sessionId}><p>Private assessment</p></ParentSessionGate>);

    expect(screen.getByRole("status")).toHaveTextContent("Checking the parent account");
    expect(screen.queryByText("Private assessment")).not.toBeInTheDocument();
    expect(await screen.findByText("Private assessment")).toBeInTheDocument();
    expect(confirmCurrentParentOwnership).toHaveBeenCalledWith(sessionId);
  });

  it("requires parent authentication when the server denies ownership", async () => {
    vi.mocked(confirmCurrentParentOwnership).mockRejectedValue(new Error("This parent account does not own this invitation."));
    render(<ParentSessionGate sessionId={sessionId}><p>Private assessment</p></ParentSessionGate>);

    expect(await screen.findByRole("alert")).toHaveTextContent("This parent account does not own this invitation.");
    expect(screen.getByRole("heading", { name: /secure your family invitation/i })).toBeInTheDocument();
    expect(screen.queryByText("Private assessment")).not.toBeInTheDocument();
  });
});
