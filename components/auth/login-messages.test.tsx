import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { LoginMessages } from "./login-messages";

afterEach(() => {
  cleanup();
});

// Mock next/navigation
const mockSearchParams = new Map<string, string>();
vi.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: (key: string) => mockSearchParams.get(key) ?? null,
  }),
}));

describe("LoginMessages", () => {
  beforeEach(() => {
    mockSearchParams.clear();
  });

  describe("when no query params", () => {
    it("should render nothing", () => {
      const { container } = render(<LoginMessages />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe("when confirmed param is present", () => {
    it("should show success message", () => {
      mockSearchParams.set("confirmed", "true");

      render(<LoginMessages />);

      expect(
        screen.getByText("Email confirmed! You can now log in.")
      ).not.toBeNull();
    });

    it("should render a check circle icon", () => {
      mockSearchParams.set("confirmed", "true");

      const { container } = render(<LoginMessages />);

      // lucide-react renders SVGs with class lucide
      const svg = container.querySelector("svg");
      expect(svg).not.toBeNull();
    });
  });

  describe("when error=confirmation-failed", () => {
    it("should show error message", () => {
      mockSearchParams.set("error", "confirmation-failed");

      render(<LoginMessages />);

      expect(
        screen.getByText("Email confirmation failed. Please try again.")
      ).not.toBeNull();
    });

    it("should render destructive alert", () => {
      mockSearchParams.set("error", "confirmation-failed");

      const { container } = render(<LoginMessages />);

      // The Alert component with destructive variant should be present
      const alert = container.querySelector("[role='alert']");
      expect(alert).not.toBeNull();
    });
  });

  describe("when other error values", () => {
    it("should not show message for unknown error values", () => {
      mockSearchParams.set("error", "some-other-error");

      const { container } = render(<LoginMessages />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe("when both confirmed and error params", () => {
    it("should show both messages", () => {
      mockSearchParams.set("confirmed", "true");
      mockSearchParams.set("error", "confirmation-failed");

      render(<LoginMessages />);

      expect(
        screen.getByText("Email confirmed! You can now log in.")
      ).not.toBeNull();
      expect(
        screen.getByText("Email confirmation failed. Please try again.")
      ).not.toBeNull();
    });
  });
});