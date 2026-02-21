import { describe, it, expect } from "vitest";
import {
  resetPasswordSchema,
  validateResetPasswordRequest,
} from "./reset-password.schemas";

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

describe("resetPasswordSchema", () => {
  it("should accept matching valid passwords", () => {
    const result = resetPasswordSchema.safeParse({
      password: "ValidPass123",
      confirmPassword: "ValidPass123",
    });
    expect(result.success).toBe(true);
  });

  it("should reject non-matching passwords", () => {
    const result = resetPasswordSchema.safeParse({
      password: "ValidPass123",
      confirmPassword: "DifferentPass456",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe("Passwords don't match");
    }
  });

  it("should reject weak passwords even if matching", () => {
    const result = resetPasswordSchema.safeParse({
      password: "weak",
      confirmPassword: "weak",
    });
    expect(result.success).toBe(false);
  });
});

describe("validateResetPasswordRequest", () => {
  it("should validate complete reset password request", () => {
    const result = validateResetPasswordRequest({
      password: "ValidPass123",
      token: "reset-token-123",
      botDetection: validBotDetection,
    });

    expect(result.isValid).toBe(true);
    expect(result.errors).toBeNull();
    expect(result.data?.token).toBe("reset-token-123");
  });

  it("should return errors for weak password", () => {
    const result = validateResetPasswordRequest({
      password: "weak",
      token: "reset-token-123",
      botDetection: validBotDetection,
    });

    expect(result.isValid).toBe(false);
    expect(result.errors?.password).toBeDefined();
  });

  it("should require token", () => {
    const result = validateResetPasswordRequest({
      password: "ValidPass123",
      botDetection: validBotDetection,
    });

    expect(result.isValid).toBe(false);
    expect(result.errors?.token).toBeDefined();
  });
});