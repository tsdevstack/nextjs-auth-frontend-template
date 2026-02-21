import { describe, it, expect } from "vitest";
import { signupFormSchema, validateSignupRequest } from "./signup.schemas";

const validBotDetection = {
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
};

describe("signupFormSchema", () => {
  it("should accept valid signup data", () => {
    const result = signupFormSchema.safeParse({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "ValidPass123",
      confirmPassword: "ValidPass123",
      acceptedTerms: true,
    });
    expect(result.success).toBe(true);
  });

  it("should reject when passwords don't match", () => {
    const result = signupFormSchema.safeParse({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "ValidPass123",
      confirmPassword: "DifferentPass456",
      acceptedTerms: true,
    });
    expect(result.success).toBe(false);
  });

  it("should reject when terms not accepted", () => {
    const result = signupFormSchema.safeParse({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "ValidPass123",
      confirmPassword: "ValidPass123",
      acceptedTerms: false,
    });
    expect(result.success).toBe(false);
  });

  it("should reject whitespace-only names", () => {
    const result = signupFormSchema.safeParse({
      firstName: "   ",
      lastName: "Doe",
      email: "john@example.com",
      password: "ValidPass123",
      confirmPassword: "ValidPass123",
      acceptedTerms: true,
    });
    expect(result.success).toBe(false);
  });
});

describe("validateSignupRequest", () => {
  it("should validate complete signup request", () => {
    const result = validateSignupRequest({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "ValidPass123",
      botDetection: validBotDetection,
    });

    expect(result.isValid).toBe(true);
    expect(result.errors).toBeNull();
    expect(result.data).toBeDefined();
    expect(result.data?.email).toBe("john@example.com");
  });

  it("should return errors for invalid data", () => {
    const result = validateSignupRequest({
      firstName: "",
      lastName: "Doe",
      email: "invalid",
      password: "weak",
      botDetection: validBotDetection,
    });

    expect(result.isValid).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.data).toBeUndefined();
  });

  it("should require botDetection data", () => {
    const result = validateSignupRequest({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "ValidPass123",
    });

    expect(result.isValid).toBe(false);
    expect(result.errors?.botDetection).toBeDefined();
  });
});
