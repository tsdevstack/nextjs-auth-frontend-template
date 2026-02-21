// Re-export all auth schemas from their individual files
export {
  emailSchema,
  passwordSchema,
  nameSchema,
} from "./base.schemas";

export {
  signupFormSchema,
  validateSignupRequest,
  type SignupFormData,
  type SignupApiData,
} from "./signup.schemas";

export {
  loginSchema,
  validateLoginRequest,
  type LoginFormData,
  type LoginApiData,
} from "./login.schemas";

export {
  forgotPasswordSchema,
  validateForgotPasswordRequest,
  type ForgotPasswordFormData,
  type ForgotPasswordApiData,
} from "./forgot-password.schemas";

export {
  resetPasswordSchema,
  validateResetPasswordRequest,
  type ResetPasswordFormData,
  type ResetPasswordApiData,
} from "./reset-password.schemas";