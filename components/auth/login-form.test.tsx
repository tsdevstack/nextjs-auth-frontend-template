import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "./login-form";

afterEach(() => {
  cleanup();
});

describe("LoginForm", () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSubmit.mockResolvedValue(undefined);
  });

  describe("Rendering", () => {
    it("should render the form with email and password fields", () => {
      render(<LoginForm onSubmit={mockOnSubmit} />);

      expect(screen.getByLabelText(/email/i)).not.toBeNull();
      expect(screen.getByLabelText("Password")).not.toBeNull();
      expect(screen.getByRole("button", { name: /log in/i })).not.toBeNull();
    });

    it("should render forgot password and signup links", () => {
      render(<LoginForm onSubmit={mockOnSubmit} />);

      expect(
        screen.getByRole("link", { name: /forgot password/i }),
      ).not.toBeNull();
      expect(screen.getByRole("link", { name: /sign up/i })).not.toBeNull();
    });

    it("should have a password visibility toggle", () => {
      render(<LoginForm onSubmit={mockOnSubmit} />);

      expect(
        screen.getByRole("button", { name: /show password/i }),
      ).not.toBeNull();
    });
  });

  describe("Password visibility toggle", () => {
    it("should toggle password visibility when button is clicked", async () => {
      const user = userEvent.setup();
      render(<LoginForm onSubmit={mockOnSubmit} />);

      const passwordInput = screen.getByLabelText("Password");
      const toggleButton = screen.getByRole("button", {
        name: /show password/i,
      });

      expect(passwordInput.getAttribute("type")).toBe("password");

      await user.click(toggleButton);
      expect(passwordInput.getAttribute("type")).toBe("text");

      await user.click(toggleButton);
      expect(passwordInput.getAttribute("type")).toBe("password");
    });
  });

  describe("Validation", () => {
    it("should show error for invalid email", async () => {
      const user = userEvent.setup();
      render(<LoginForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", { name: /log in/i });

      await user.type(emailInput, "notvalid");
      await user.type(passwordInput, "ValidPassword123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/enter a valid email/i)).not.toBeNull();
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it("should show error for empty password", async () => {
      const user = userEvent.setup();
      render(<LoginForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole("button", { name: /log in/i });

      await user.type(emailInput, "test@example.com");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/password is required/i)).not.toBeNull();
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe("Successful submission", () => {
    it("should call onSubmit with email, password, and botDetection", async () => {
      const user = userEvent.setup();
      render(<LoginForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", { name: /log in/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "ValidPassword123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          "test@example.com",
          "ValidPassword123",
          expect.objectContaining({
            isBot: false,
            honeypotTriggered: false,
          }),
        );
      });
    });
  });

  describe("Error handling", () => {
    it("should display error message when onSubmit throws", async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockRejectedValue(new Error("Network error"));
      render(<LoginForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", { name: /log in/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "ValidPassword123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).not.toBeNull();
      });
    });

    it("should show fallback message for unknown errors", async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockRejectedValue("string error");
      render(<LoginForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", { name: /log in/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "ValidPassword123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/login failed/i)).not.toBeNull();
      });
    });
  });
});
