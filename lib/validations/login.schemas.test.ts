import { describe, it, expect } from "vitest";
import { loginSchema, validateLoginRequest } from "./login.schemas";

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

describe("loginSchema", () => {
  it("should accept valid login data", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "ValidPass123",
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid email", () => {
    const result = loginSchema.safeParse({
      email: "invalid",
      password: "ValidPass123",
    });
    expect(result.success).toBe(false);
  });

  it("should accept any non-empty password (no complexity rules on login)", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "weak",
    });
    expect(result.success).toBe(true);
  });

  it("should reject empty password", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("validateLoginRequest", () => {
  it("should validate complete login request", () => {
    const result = validateLoginRequest({
      email: "test@example.com",
      password: "ValidPass123",
      botDetection: validBotDetection,
    });

    expect(result.isValid).toBe(true);
    expect(result.errors).toBeNull();
    expect(result.data?.email).toBe("test@example.com");
  });

  it("should return errors for invalid email format", () => {
    const result = validateLoginRequest({
      email: "invalid",
      password: "anypassword",
      botDetection: validBotDetection,
    });

    expect(result.isValid).toBe(false);
    expect(result.errors).toBeDefined();
  });

  it("should require botDetection data", () => {
    const result = validateLoginRequest({
      email: "test@example.com",
      password: "ValidPass123",
    });

    expect(result.isValid).toBe(false);
  });
});
