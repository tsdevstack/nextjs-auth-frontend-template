import { StrictMode } from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ConfirmClient } from "./confirm-client";

// Mock next/navigation
const mockSearchParams = new Map<string, string>();
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: (key: string) => mockSearchParams.get(key) ?? null,
  }),
  useRouter: () => ({ push: mockPush }),
}));

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
    mockSearchParams.clear();
    mockConfirm.mockResolvedValue({ data: { message: "Email confirmed" } });
  });

  it("should confirm the token once even when Strict Mode mounts twice", async () => {
    mockSearchParams.set("token", "abc123");

    render(
      <StrictMode>
        <ConfirmClient />
      </StrictMode>
    );

    expect(await screen.findByText(/email confirmed!/i)).toBeInTheDocument();
    expect(mockConfirm).toHaveBeenCalledTimes(1);
    expect(mockConfirm).toHaveBeenCalledWith("abc123");
  });

  it("should show the error state when the confirmation fails", async () => {
    mockSearchParams.set("token", "used-token");
    mockConfirm.mockRejectedValue(new Error("Confirmation failed"));

    render(<ConfirmClient />);

    expect(
      await screen.findByRole("heading", { name: /confirmation failed/i })
    ).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("should show an error and not call the API without a token", () => {
    render(<ConfirmClient />);

    expect(
      screen.getByText(/no confirmation token provided/i)
    ).toBeInTheDocument();
    expect(mockConfirm).not.toHaveBeenCalled();
  });
});
