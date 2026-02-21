import { z } from "zod";
import { emailSchema, botDetectionSchema } from "./base.schemas";

// Frontend form schema — login should NOT enforce password complexity rules.
// Just check the field is non-empty. The server returns "Invalid credentials" for wrong passwords.
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

// API schema (what gets sent to the server)
const loginApiSchema = loginSchema.extend({
  botDetection: botDetectionSchema,
});

// Types derived from schemas
export type LoginFormData = z.infer<typeof loginSchema>;
export type LoginApiData = z.infer<typeof loginApiSchema>;

// Helper function for API validation
export const validateLoginRequest = (data: unknown) => {
  const result = loginApiSchema.safeParse(data);

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
