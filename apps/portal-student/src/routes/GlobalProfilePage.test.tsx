import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createEmptyPortalDraft } from "../lib/defaults";
import { usePortal } from "../state/usePortal";
import { GlobalProfilePage } from "./GlobalProfilePage";

vi.mock("../state/usePortal", () => ({ usePortal: vi.fn() }));

const setLogoAsset = vi.fn();
const setFacilityAsset = vi.fn();
const setFacilityEnabled = vi.fn();

describe("GlobalProfilePage asset controls", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePortal).mockReturnValue({
      draft: createEmptyPortalDraft(),
      pendingAssets: { logo: null, facilities: {} },
      addGalleryImage: vi.fn(),
      clearPendingAssets: vi.fn(),
      isAuthenticated: true,
      isAuthResolved: true,
      publishResult: null,
      removeCourse: vi.fn(),
      removeGalleryImage: vi.fn(),
      setAuthenticated: vi.fn(),
      setFacilityAsset,
      setFacilityEnabled,
      setFacilityImage: vi.fn(),
      setLogoAsset,
      setPublishResult: vi.fn(),
      signOut: vi.fn(),
      updateProfile: vi.fn(),
      upsertCourse: vi.fn(),
    });
  });

  it("uses a logo file input and removes the living-cost field", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><GlobalProfilePage /></MemoryRouter>);

    expect(screen.queryByLabelText(/logo url/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/estimated annual living cost/i)).not.toBeInTheDocument();

    const logo = screen.getByLabelText(/institution logo/i);
    const file = new File(["logo"], "logo.png", { type: "image/png" });
    await user.upload(logo, file);
    expect(setLogoAsset).toHaveBeenCalledWith(file);
  });

  it("reveals the selected facility's image upload from a dropdown", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><GlobalProfilePage /></MemoryRouter>);

    expect(screen.queryByLabelText(/24-hour library image/i)).not.toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText(/choose a facility/i), "library");

    expect(setFacilityEnabled).toHaveBeenCalledWith("library", true);
    expect(screen.getByLabelText(/24-hour library image/i)).toBeInTheDocument();
  });
});
