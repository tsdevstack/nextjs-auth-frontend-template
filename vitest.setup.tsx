import { expect, vi, afterAll } from "vitest";
import * as jestDomMatchers from "@testing-library/jest-dom/matchers";
import React from "react";

expect.extend(jestDomMatchers);

// Global mock for @tsdevstack/react-bot-detection
vi.mock("@tsdevstack/react-bot-detection", () => ({
  BotProtectedForm: vi.fn(
    ({
      children,
      onSubmit,
      submitButtonText = "Submit",
      className,
    }: {
      children: React.ReactNode;
      onSubmit: (
        data: FormData,
        botDetection: {
          score: number;
          reasons: string[];
          isBot: boolean;
          stats: {
            mouseMovements: number;
            typingEvents: number;
            focusEvents: number;
            timeSpent: number;
          };
          honeypotTriggered: boolean;
        },
      ) => Promise<void>;
      submitButtonText?: string;
      className?: string;
    }) => (
      <form
        noValidate
        onSubmit={async (e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          await onSubmit(formData, {
            score: 0,
            reasons: [],
            isBot: false,
            stats: {
              mouseMovements: 10,
              typingEvents: 20,
              focusEvents: 5,
              timeSpent: 5000,
            },
            honeypotTriggered: false,
          });
        }}
        className={className}
      >
        {children}
        <button type="submit">{submitButtonText}</button>
      </form>
    ),
  ),
}));

// Global mock for next/link
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

// Mock ResizeObserver for Radix UI components
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Suppress expected console.error messages in tests
const originalError = console.error;
console.error = (...args: unknown[]) => {
  const message = args[0];
  // Suppress expected error logs from form error handling
  if (typeof message === "string" && message.includes("Signup error:")) {
    return;
  }
  originalError.apply(console, args);
};

// Restore console.error after all tests
afterAll(() => {
  console.error = originalError;
});
