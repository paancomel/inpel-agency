import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { COOKIE_CONSENT_CHANGED_EVENT, COOKIE_CONSENT_KEY, CookieConsent, OptionalTrackingGate } from "./CookieConsent.js";

function renderConsent() {
  return render(
    <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <CookieConsent />
    </MemoryRouter>,
  );
}

describe("CookieConsent", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("shows the consent choices and routes the privacy link to the English notice", async () => {
    renderConsent();

    expect(await screen.findByRole("region", { name: "Cookie consent" })).toBeInTheDocument();
    expect(screen.getByText(/We use cookies and tracking technologies to improve your browsing experience/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Read our Privacy Policy" })).toHaveAttribute("href", "/legal/privacy");
    expect(screen.getByRole("button", { name: "Accept All" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Essential Only" })).toBeInTheDocument();
  });

  it.each(["all", "essential"])("stays hidden when %s consent is already stored", async (storedConsent) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, storedConsent);
    const getItem = vi.spyOn(Storage.prototype, "getItem");
    renderConsent();

    await waitFor(() => expect(getItem).toHaveBeenCalledWith(COOKIE_CONSENT_KEY));
    expect(screen.queryByRole("region", { name: "Cookie consent" })).not.toBeInTheDocument();
  });

  it("fails closed and asks again when the stored value is invalid", async () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "unexpected");
    renderConsent();

    expect(await screen.findByRole("region", { name: "Cookie consent" })).toBeInTheDocument();
  });

  it("stores all consent, hides the banner, and dispatches consentGranted", async () => {
    const user = userEvent.setup();
    const consentGranted = vi.fn();
    window.addEventListener("consentGranted", consentGranted);
    renderConsent();

    await user.click(await screen.findByRole("button", { name: "Accept All" }));

    expect(localStorage.getItem(COOKIE_CONSENT_KEY)).toBe("all");
    expect(screen.queryByRole("region", { name: "Cookie consent" })).not.toBeInTheDocument();
    expect(consentGranted).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: "Cookie settings" })).toBeInTheDocument();
    window.removeEventListener("consentGranted", consentGranted);
  });

  it("keeps optional integrations gated until opt-in and unmounts them when consent is withdrawn", async () => {
    const user = userEvent.setup();
    const changed = vi.fn();
    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, changed);
    render(
      <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <CookieConsent />
        <OptionalTrackingGate><div>Optional vendor loader</div></OptionalTrackingGate>
      </MemoryRouter>,
    );

    expect(screen.queryByText("Optional vendor loader")).not.toBeInTheDocument();
    await user.click(await screen.findByRole("button", { name: "Accept All" }));
    expect(await screen.findByText("Optional vendor loader")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cookie settings" }));
    await user.click(screen.getByRole("button", { name: "Essential Only" }));
    expect(screen.queryByText("Optional vendor loader")).not.toBeInTheDocument();
    expect(changed).toHaveBeenLastCalledWith(expect.objectContaining({ detail: { choice: "essential", optionalTrackingAllowed: false } }));
    window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, changed);
  });

  it("stores essential consent and hides without granting advertising consent", async () => {
    const user = userEvent.setup();
    const consentGranted = vi.fn();
    window.addEventListener("consentGranted", consentGranted);
    renderConsent();

    await user.click(await screen.findByRole("button", { name: "Essential Only" }));

    expect(localStorage.getItem(COOKIE_CONSENT_KEY)).toBe("essential");
    expect(screen.queryByRole("region", { name: "Cookie consent" })).not.toBeInTheDocument();
    expect(consentGranted).not.toHaveBeenCalled();
    window.removeEventListener("consentGranted", consentGranted);
  });

  it("keeps tracking disabled when the consent choice cannot be stored", async () => {
    const user = userEvent.setup();
    const consentGranted = vi.fn();
    window.addEventListener("consentGranted", consentGranted);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Storage is unavailable", "QuotaExceededError");
    });
    renderConsent();

    await user.click(await screen.findByRole("button", { name: "Accept All" }));

    expect(screen.getByRole("region", { name: "Cookie consent" })).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("We couldn't save your choice");
    expect(consentGranted).not.toHaveBeenCalled();
    window.removeEventListener("consentGranted", consentGranted);
  });
});
