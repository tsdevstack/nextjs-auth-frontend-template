import { StrictMode } from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ConfirmClient } from "./confirm-client";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// The page as the browser opened it
function openUrl(url: string): void {
  window.history.replaceState(null, "", url);
}

// Mock the confirm API call
const mockConfirm = vi.fn();
vi.mock("@/lib/nextApi/auth.api", () => ({
  authAPI: { confirm: (token: string) => mockConfirm(token) },
}));

afterEach(() => {
  cleanup();
});

describe("ConfirmClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    openUrl("/confirm");
    mockConfirm.mockResolvedValue({ data: { message: "Email confirmed" } });
  });

  it("should confirm the token once even when Strict Mode mounts twice", async () => {
    openUrl("/confirm#token=abc123");

    render(
      <StrictMode>
        <ConfirmClient />
      </StrictMode>,
    );

    expect(await screen.findByText(/email confirmed!/i)).toBeInTheDocument();
    expect(mockConfirm).toHaveBeenCalledTimes(1);
    expect(mockConfirm).toHaveBeenCalledWith("abc123");
  });

  it("should show the error state when the confirmation fails", async () => {
    openUrl("/confirm#token=used-token");
    mockConfirm.mockRejectedValue(new Error("Confirmation failed"));

    render(<ConfirmClient />);

    expect(
      await screen.findByRole("heading", { name: /confirmation failed/i }),
    ).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("should show an error and not call the API without a token", async () => {
    render(<ConfirmClient />);

    expect(
      await screen.findByText(/no confirmation token provided/i),
    ).toBeInTheDocument();
    expect(mockConfirm).not.toHaveBeenCalled();
  });

  it("should confirm a link sent before, with ?token=", async () => {
    openUrl("/confirm?token=old456");

    render(<ConfirmClient />);

    expect(await screen.findByText(/email confirmed!/i)).toBeInTheDocument();
    expect(mockConfirm).toHaveBeenCalledWith("old456");
  });

  it("should remove the token from the address bar", async () => {
    openUrl("/confirm#token=abc123");

    render(<ConfirmClient />);

    expect(await screen.findByText(/email confirmed!/i)).toBeInTheDocument();
    expect(window.location.hash).toBe("");
    expect(window.location.pathname).toBe("/confirm");
  });
});
