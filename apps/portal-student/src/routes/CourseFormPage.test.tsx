import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createEmptyPortalDraft } from "../lib/defaults";
import { listSharedCatalogProgrammes } from "../lib/catalog";
import { usePortal } from "../state/usePortal";
import { CourseFormPage } from "./CourseFormPage";

vi.mock("../state/usePortal", () => ({ usePortal: vi.fn() }));
vi.mock("../lib/catalog", () => ({ listSharedCatalogProgrammes: vi.fn() }));

describe("CourseFormPage requirements", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(listSharedCatalogProgrammes).mockResolvedValue([]);
    vi.mocked(usePortal).mockReturnValue({
      draft: createEmptyPortalDraft(),
      importDraft: vi.fn(),
      pendingAssets: { logo: null, facilities: {} },
      addGalleryImage: vi.fn(),
      clearPendingAssets: vi.fn(),
      isAuthenticated: true,
      isAuthResolved: true,
      publishResult: null,
      removeCourse: vi.fn(),
      removeGalleryImage: vi.fn(),
      setAuthenticated: vi.fn(),
      setAccuracyAttested: vi.fn(),
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

  it("fills accreditation fields from the institution's live programme catalog", async () => {
    const portal = vi.mocked(usePortal)();
    const draft = createEmptyPortalDraft();
    draft.profile.name = "Universiti Data Sebenar";
    vi.mocked(usePortal).mockReturnValue({ ...portal, draft });
    vi.mocked(listSharedCatalogProgrammes).mockResolvedValue([{
      referenceInstitutionId: "reference-institution-1",
      institutionName: "Universiti Data Sebenar",
      canonicalRecordId: "programme-1",
      referenceNo: "MQA/FA12345",
      referenceFamily: "MQA",
      qualificationName: "Diploma Teknologi Maklumat",
      previousQualificationName: null,
      necCode: "0611",
      necDescription: "Computer use",
      necBroadArea: "Information and Communication Technologies",
      courseId: null,
      isLinkedToCourse: false,
    }]);

    const user = userEvent.setup();
    render(<MemoryRouter><CourseFormPage /></MemoryRouter>);
    await user.selectOptions(await screen.findByLabelText(/live accredited programme catalog/i), "programme-1");

    expect(screen.getByLabelText(/course name/i)).toHaveValue("Diploma Teknologi Maklumat");
    expect(screen.getByLabelText(/mqa accreditation code/i)).toHaveValue("MQA/FA12345");
    expect(listSharedCatalogProgrammes).toHaveBeenCalledWith("Universiti Data Sebenar");
  });

  it("shows an unavailable state without fabricating programme options", async () => {
    vi.mocked(listSharedCatalogProgrammes).mockRejectedValue(new Error("offline"));

    render(<MemoryRouter><CourseFormPage /></MemoryRouter>);

    expect(await screen.findByRole("alert")).toHaveTextContent(/no placeholder programme data/i);
    expect(screen.queryByRole("option", { name: /contoh|example/i })).not.toBeInTheDocument();
  });
});
