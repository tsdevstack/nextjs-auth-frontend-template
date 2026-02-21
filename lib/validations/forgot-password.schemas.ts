import { z } from "zod";
import { emailSchema, botDetectionSchema } from "./base.schemas";

// Frontend form schema (includes UI-specific validations)
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

// API schema (what gets sent to the server)
const forgotPasswordApiSchema = forgotPasswordSchema.extend({
  botDetection: botDetectionSchema,
});

// Types derived from schemas
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ForgotPasswordApiData = z.infer<typeof forgotPasswordApiSchema>;

export const validateForgotPasswordRequest = (data: unknown) => {
  const result = forgotPasswordApiSchema.safeParse(data);

  if (!result.success) {
    return {
      isValid: false as const,
      errors: result.error.flatten().fieldErrors,
      data: undefined,
    };
  }

  return {
    isValid: true as const,
    errors: null,
    data: result.data,
  };
};