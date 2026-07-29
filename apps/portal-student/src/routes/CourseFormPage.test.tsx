import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createEmptyPortalDraft } from "../lib/defaults";
import { usePortal } from "../state/usePortal";
import { CourseFormPage } from "./CourseFormPage";

vi.mock("../state/usePortal", () => ({ usePortal: vi.fn() }));

describe("CourseFormPage requirements", () => {
  beforeEach(() => {
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
      setFacilityAsset: vi.fn(),
      setFacilityEnabled: vi.fn(),
      setFacilityImage: vi.fn(),
      setLogoAsset: vi.fn(),
      setPublishResult: vi.fn(),
      signOut: vi.fn(),
      updateProfile: vi.fn(),
      upsertCourse: vi.fn(),
    });
  });

  it("renders every Academic, Financial Aid, and Outcomes field", () => {
    render(<MemoryRouter><CourseFormPage /></MemoryRouter>);

    expect(screen.getByRole("heading", { name: /academic/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/course name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/faculty\/school/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/dual-award degree/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/interview\/portfolio required/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/minimum entry requirements/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/document checklist/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/micro-credentials/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/professional body exemptions/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/industry advisory boards/i)).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: /financial aid/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/total base tuition fee/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/initial registration fee/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cost per credit hour/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/additional material costs/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/ptptn approved/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mara eligible/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/state zakat\/yayasan eligible/i)).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: /outcomes/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/graduate employability rate/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/internship duration/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/on-time graduation rate/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/top hiring companies/i)).toBeInTheDocument();
  });
});
