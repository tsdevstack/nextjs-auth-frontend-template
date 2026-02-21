import { z } from "zod";
import { passwordSchema, botDetectionSchema } from "./base.schemas";

// Frontend form schema (includes UI-specific validations)
export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// API schema (what gets sent to the server)
const resetPasswordApiSchema = z.object({
  password: passwordSchema,
  token: z.string(),
  botDetection: botDetectionSchema,
});

// Types derived from schemas
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ResetPasswordApiData = z.infer<typeof resetPasswordApiSchema>;

export const validateResetPasswordRequest = (data: unknown) => {
  const result = resetPasswordApiSchema.safeParse(data);

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