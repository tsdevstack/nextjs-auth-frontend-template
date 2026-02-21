import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ForgotPasswordForm } from "./forgot-password-form";

afterEach(() => {
  cleanup();
});

describe("ForgotPasswordForm", () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSubmit.mockResolvedValue({ data: { message: "Success" } });
  });

  describe("Rendering", () => {
    it("should render email field and submit button", () => {
      render(<ForgotPasswordForm onSubmit={mockOnSubmit} />);

      expect(screen.getByLabelText(/email/i)).not.toBeNull();
      expect(
        screen.getByRole("button", { name: /send reset link/i })
      ).not.toBeNull();
    });

    it("should render heading and description", () => {
      render(<ForgotPasswordForm onSubmit={mockOnSubmit} />);

      expect(screen.getByText(/forgot password/i)).not.toBeNull();
      expect(screen.getByText(/send you a reset link/i)).not.toBeNull();
    });
  });

  describe("Successful submission", () => {
    it("should call onSubmit and show success message", async () => {
      const user = userEvent.setup();
      render(<ForgotPasswordForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole("button", {
        name: /send reset link/i,
      });

      await user.type(emailInput, "test@example.com");
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          "test@example.com",
          expect.objectContaining({
            isBot: false,
            honeypotTriggered: false,
          })
        );
      });

      // Should show success message
      await waitFor(() => {
        expect(screen.getByText(/receive a reset link/i)).not.toBeNull();
      });
    });
  });

  describe("Error handling", () => {
    it("should display error message when onSubmit throws", async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockRejectedValue(new Error("User not found"));
      render(<ForgotPasswordForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole("button", {
        name: /send reset link/i,
      });

      await user.type(emailInput, "test@example.com");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/user not found/i)).not.toBeNull();
      });
    });

    it("should show fallback error message", async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockRejectedValue("unknown error");
      render(<ForgotPasswordForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole("button", {
        name: /send reset link/i,
      });

      await user.type(emailInput, "test@example.com");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/failed to send reset email/i)).not.toBeNull();
      });
    });
  });
});