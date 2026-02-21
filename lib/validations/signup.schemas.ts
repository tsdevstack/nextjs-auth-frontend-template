import { z } from "zod";
import {
  emailSchema,
  passwordSchema,
  nameSchema,
  botDetectionSchema,
} from "./base.schemas";

// Frontend form schema (includes UI-specific validations)
export const signupFormSchema = z
  .object({
    firstName: nameSchema.refine(
      (val) => val.trim().length > 0,
      "First name is required",
    ),
    lastName: nameSchema.refine(
      (val) => val.trim().length > 0,
      "Last name is required",
    ),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
    acceptedTerms: z.literal(true, {
      errorMap: () => ({ message: "You must accept the terms" }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// API schema (what gets sent to the server — no confirmPassword or acceptedTerms)
const signupApiSchema = z
  .object({
    firstName: nameSchema,
    lastName: nameSchema,
    email: emailSchema,
    password: passwordSchema,
  })
  .extend({ botDetection: botDetectionSchema });

// Types derived from schemas
export type SignupFormData = z.infer<typeof signupFormSchema>;
export type SignupApiData = z.infer<typeof signupApiSchema>;

// Helper function for API validation
export const validateSignupRequest = (data: unknown) => {
  const result = signupApiSchema.safeParse(data);

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
