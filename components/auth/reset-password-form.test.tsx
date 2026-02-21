import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ResetPasswordForm } from "./reset-password-form";

afterEach(() => {
  cleanup();
});

describe("ResetPasswordForm", () => {
  const mockOnSubmit = vi.fn();
  const mockToken = "test-reset-token";

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSubmit.mockResolvedValue({ data: { message: "Success" } });
  });

  describe("Rendering", () => {
    it("should render password fields and submit button", () => {
      render(<ResetPasswordForm token={mockToken} onSubmit={mockOnSubmit} />);

      expect(screen.getByLabelText("New Password")).not.toBeNull();
      expect(screen.getByLabelText("Confirm New Password")).not.toBeNull();
      expect(
        screen.getByRole("button", { name: /reset password/i })
      ).not.toBeNull();
    });

    it("should render heading and description", () => {
      render(<ResetPasswordForm token={mockToken} onSubmit={mockOnSubmit} />);

      expect(screen.getByRole("heading", { name: /reset password/i })).not.toBeNull();
      expect(screen.getByText(/enter your new password/i)).not.toBeNull();
    });
  });

  describe("Validation", () => {
    it("should show error for short password", async () => {
      const user = userEvent.setup();
      render(<ResetPasswordForm token={mockToken} onSubmit={mockOnSubmit} />);

      const passwordInput = screen.getByLabelText("New Password");
      const confirmInput = screen.getByLabelText(/confirm new password/i);
      const submitButton = screen.getByRole("button", {
        name: /reset password/i,
      });

      await user.type(passwordInput, "short");
      await user.type(confirmInput, "short");
      await user.click(submitButton);

      await waitFor(() => {
        // Both password fields show the same error when too short
        const errors = screen.getAllByText(/password must be at least 8 characters/i);
        expect(errors.length).toBeGreaterThan(0);
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it("should show error when passwords do not match", async () => {
      const user = userEvent.setup();
      render(<ResetPasswordForm token={mockToken} onSubmit={mockOnSubmit} />);

      const passwordInput = screen.getByLabelText("New Password");
      const confirmInput = screen.getByLabelText(/confirm new password/i);
      const submitButton = screen.getByRole("button", {
        name: /reset password/i,
      });

      await user.type(passwordInput, "ValidPassword123");
      await user.type(confirmInput, "DifferentPassword456");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/passwords don't match/i)).not.toBeNull();
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe("Successful submission", () => {
    it("should call onSubmit with token and password, then show success", async () => {
      const user = userEvent.setup();
      render(<ResetPasswordForm token={mockToken} onSubmit={mockOnSubmit} />);

      const passwordInput = screen.getByLabelText("New Password");
      const confirmInput = screen.getByLabelText(/confirm new password/i);
      const submitButton = screen.getByRole("button", {
        name: /reset password/i,
      });

      await user.type(passwordInput, "ValidPassword123");
      await user.type(confirmInput, "ValidPassword123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          mockToken,
          "ValidPassword123",
          expect.objectContaining({
            isBot: false,
            honeypotTriggered: false,
          })
        );
      });

      // Should show success message
      await waitFor(() => {
        expect(screen.getByText(/password reset successfully/i)).not.toBeNull();
      });

      // Should show login link
      expect(screen.getByRole("link", { name: /go to login/i })).not.toBeNull();
    });
  });

  describe("Error handling", () => {
    it("should display error message when onSubmit throws", async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockRejectedValue(new Error("Token expired"));
      render(<ResetPasswordForm token={mockToken} onSubmit={mockOnSubmit} />);

      const passwordInput = screen.getByLabelText("New Password");
      const confirmInput = screen.getByLabelText(/confirm new password/i);
      const submitButton = screen.getByRole("button", {
        name: /reset password/i,
      });

      await user.type(passwordInput, "ValidPassword123");
      await user.type(confirmInput, "ValidPassword123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/token expired/i)).not.toBeNull();
      });
    });

    it("should show fallback error message", async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockRejectedValue("unknown error");
      render(<ResetPasswordForm token={mockToken} onSubmit={mockOnSubmit} />);

      const passwordInput = screen.getByLabelText("New Password");
      const confirmInput = screen.getByLabelText(/confirm new password/i);
      const submitButton = screen.getByRole("button", {
        name: /reset password/i,
      });

      await user.type(passwordInput, "ValidPassword123");
      await user.type(confirmInput, "ValidPassword123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/failed to reset password/i)).not.toBeNull();
      });
    });
  });
});