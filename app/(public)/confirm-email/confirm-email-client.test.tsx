import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import ConfirmEmailClient from "./confirm-email-client";

const mockResend = vi.fn();
vi.mock("@/lib/nextApi/auth.api", () => ({
  authAPI: {
    resendConfirmation: (email: string) => mockResend(email),
  },
}));

afterEach(() => {
  cleanup();
});

describe("ConfirmEmailClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockResend.mockResolvedValue({ data: { message: "sent" } });
  });

  it("should resend the link to the login's address", async () => {
    render(<ConfirmEmailClient email="ann@example.com" />);

    expect(screen.getByText("ann@example.com")).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: /resend confirmation email/i }),
    );

    expect(
      await screen.findByText(/confirmation email sent/i),
    ).toBeInTheDocument();
    expect(mockResend).toHaveBeenCalledWith("ann@example.com");
  });

  it("should send to the login without an address", () => {
    render(<ConfirmEmailClient email="" />);

    expect(screen.getByText(/please log in/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /go to login/i })).toHaveAttribute(
      "href",
      "/login",
    );
  });

  it("should show the error when sending fails", async () => {
    mockResend.mockRejectedValue(new Error("Too many requests"));
    render(<ConfirmEmailClient email="ann@example.com" />);

    fireEvent.click(
      screen.getByRole("button", { name: /resend confirmation email/i }),
    );

    expect(await screen.findByText("Too many requests")).toBeInTheDocument();
  });
});
