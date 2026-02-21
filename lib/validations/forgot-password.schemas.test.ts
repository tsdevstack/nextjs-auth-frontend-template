import { describe, it, expect } from "vitest";
import {
  forgotPasswordSchema,
  validateForgotPasswordRequest,
} from "./forgot-password.schemas";

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

describe("forgotPasswordSchema", () => {
  it("should accept valid email", () => {
    const result = forgotPasswordSchema.safeParse({
      email: "test@example.com",
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid email", () => {
    const result = forgotPasswordSchema.safeParse({
      email: "invalid",
    });
    expect(result.success).toBe(false);
  });
});

describe("validateForgotPasswordRequest", () => {
  it("should validate complete forgot password request", () => {
    const result = validateForgotPasswordRequest({
      email: "test@example.com",
      botDetection: validBotDetection,
    });

    expect(result.isValid).toBe(true);
    expect(result.errors).toBeNull();
    expect(result.data?.email).toBe("test@example.com");
  });

  it("should return errors for invalid email", () => {
    const result = validateForgotPasswordRequest({
      email: "invalid",
      botDetection: validBotDetection,
    });

    expect(result.isValid).toBe(false);
    expect(result.errors?.email).toBeDefined();
  });
});