import { describe, it, expect } from "vitest";
import { emailSchema, passwordSchema, nameSchema } from "./base.schemas";

describe("emailSchema", () => {
  it("should accept valid email", () => {
    expect(emailSchema.safeParse("test@example.com").success).toBe(true);
  });

  it("should reject invalid email", () => {
    const result = emailSchema.safeParse("invalid-email");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe("Enter a valid email");
    }
  });

  it("should reject empty string", () => {
    expect(emailSchema.safeParse("").success).toBe(false);
  });
});

describe("passwordSchema", () => {
  it("should accept valid password", () => {
    expect(passwordSchema.safeParse("ValidPass123").success).toBe(true);
  });

  it("should reject password shorter than 8 characters", () => {
    const result = passwordSchema.safeParse("Short1A");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain("at least 8");
    }
  });

  it("should reject password without lowercase letter", () => {
    const result = passwordSchema.safeParse("ALLUPPERCASE123");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain("lowercase");
    }
  });

  it("should reject password without uppercase letter", () => {
    const result = passwordSchema.safeParse("alllowercase123");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain("uppercase");
    }
  });

  it("should reject password without number", () => {
    const result = passwordSchema.safeParse("NoNumbersHere");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain("number");
    }
  });
});

describe("nameSchema", () => {
  it("should accept valid name", () => {
    expect(nameSchema.safeParse("John").success).toBe(true);
  });

  it("should reject empty string", () => {
    const result = nameSchema.safeParse("");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe("This field is required");
    }
  });
});