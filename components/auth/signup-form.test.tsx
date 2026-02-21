import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SignupForm } from "./signup-form";

afterEach(() => {
  cleanup();
});

describe("SignupForm", () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSubmit.mockResolvedValue({ data: { message: "Success" } });
  });

  describe("Rendering", () => {
    it("should render all form fields", () => {
      render(<SignupForm onSubmit={mockOnSubmit} />);

      expect(screen.getByLabelText(/first name/i)).not.toBeNull();
      expect(screen.getByLabelText(/last name/i)).not.toBeNull();
      expect(screen.getByLabelText(/email/i)).not.toBeNull();
      expect(screen.getByLabelText("Password")).not.toBeNull();
      expect(screen.getByLabelText(/confirm password/i)).not.toBeNull();
      expect(screen.getByRole("checkbox")).not.toBeNull();
      expect(screen.getByRole("button", { name: /sign up/i })).not.toBeNull();
    });

    it("should render login link", () => {
      render(<SignupForm onSubmit={mockOnSubmit} />);

      expect(screen.getByRole("link", { name: /log in/i })).not.toBeNull();
    });
  });

  describe("Validation", () => {
    it("should show error for missing first name", async () => {
      const user = userEvent.setup();
      render(<SignupForm onSubmit={mockOnSubmit} />);

      const lastNameInput = screen.getByLabelText(/last name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText("Password");
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const checkbox = screen.getByRole("checkbox");
      const submitButton = screen.getByRole("button", { name: /sign up/i });

      await user.type(lastNameInput, "Doe");
      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "ValidPassword123");
      await user.type(confirmPasswordInput, "ValidPassword123");
      await user.click(checkbox);
      await user.click(submitButton);

      await waitFor(() => {
        // Zod validation message for required field
        expect(screen.getByText(/this field is required/i)).not.toBeNull();
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it("should show error for short password", async () => {
      const user = userEvent.setup();
      render(<SignupForm onSubmit={mockOnSubmit} />);

      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText("Password");
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const checkbox = screen.getByRole("checkbox");
      const submitButton = screen.getByRole("button", { name: /sign up/i });

      await user.type(firstNameInput, "John");
      await user.type(lastNameInput, "Doe");
      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "short");
      await user.type(confirmPasswordInput, "short");
      await user.click(checkbox);
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/password must be at least 8 characters/i),
        ).not.toBeNull();
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it("should show error when terms not accepted", async () => {
      const user = userEvent.setup();
      render(<SignupForm onSubmit={mockOnSubmit} />);

      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText("Password");
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole("button", { name: /sign up/i });

      await user.type(firstNameInput, "John");
      await user.type(lastNameInput, "Doe");
      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "ValidPassword123");
      await user.type(confirmPasswordInput, "ValidPassword123");
      // Don't click checkbox
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/you must accept the terms/i)).not.toBeNull();
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe("Successful submission", () => {
    it("should call onSubmit and show success message", async () => {
      const user = userEvent.setup();
      render(<SignupForm onSubmit={mockOnSubmit} />);

      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText("Password");
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const checkbox = screen.getByRole("checkbox");
      const submitButton = screen.getByRole("button", { name: /sign up/i });

      await user.type(firstNameInput, "John");
      await user.type(lastNameInput, "Doe");
      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "ValidPassword123");
      await user.type(confirmPasswordInput, "ValidPassword123");
      await user.click(checkbox);
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          {
            firstName: "John",
            lastName: "Doe",
            email: "test@example.com",
            password: "ValidPassword123",
          },
          expect.objectContaining({
            isBot: false,
            honeypotTriggered: false,
          }),
        );
      });

      // Should show success message
      await waitFor(() => {
        expect(screen.getByText(/account created/i)).not.toBeNull();
      });
    });
  });

  describe("Error handling", () => {
    it("should display error message when onSubmit throws", async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockRejectedValue(new Error("Email already exists"));
      render(<SignupForm onSubmit={mockOnSubmit} />);

      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText("Password");
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const checkbox = screen.getByRole("checkbox");
      const submitButton = screen.getByRole("button", { name: /sign up/i });

      await user.type(firstNameInput, "John");
      await user.type(lastNameInput, "Doe");
      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "ValidPassword123");
      await user.type(confirmPasswordInput, "ValidPassword123");
      await user.click(checkbox);
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email already exists/i)).not.toBeNull();
      });
    });
  });
});
