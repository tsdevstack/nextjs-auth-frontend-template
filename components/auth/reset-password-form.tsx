"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff } from "lucide-react";
import { AxiosResponse } from "axios";
import {
  BotProtectedForm,
  type BotDetectionResult,
} from "@tsdevstack/react-bot-detection";
import {
  resetPasswordSchema,
  ResetPasswordFormData,
} from "@/lib/validations/auth.schemas";
import { getErrorMessage } from "@/lib/utils/get-error-message";

interface ResetPasswordFormProps {
  token: string;
  onSubmit: (
    token: string,
    password: string,
    botDetection: BotDetectionResult
  ) => Promise<AxiosResponse<{ message: string }> | void>;
}

export function ResetPasswordForm({ token, onSubmit }: ResetPasswordFormProps) {
  const [values, setValues] = useState<ResetPasswordFormData>({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Partial<ResetPasswordFormData>>({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Handle bot-protected form submission
  const handleBotProtectedSubmit = async (
    formData: FormData,
    botDetection: BotDetectionResult
  ) => {
    setErrors({});
    setSuccess(false);

    const formValues = {
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
    };

    const parsed = resetPasswordSchema.safeParse(formValues);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setErrors({
        password: fieldErrors.password?.[0],
        confirmPassword: fieldErrors.confirmPassword?.[0],
      });
      return;
    }

    setLoading(true);
    try {
      await onSubmit(token, formValues.password, botDetection);
      setSuccess(true);
    } catch (err) {
      setErrors({
        password: getErrorMessage(err, "Failed to reset password"),
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle bot detection
  const handleBotDetected = (result: BotDetectionResult) => {
    console.warn("Bot detected on reset password form:", result);
    setErrors({
      password: "Suspicious activity detected. Please try again later.",
    });
  };

  if (success) {
    return (
      <div className="w-full max-w-sm mx-auto space-y-6">
        <div className="space-y-6 text-center">
          <Alert>
            <AlertDescription>
              Password reset successfully! You can now log in with your new
              password.
            </AlertDescription>
          </Alert>
          <Button asChild className="w-full">
            <a href="/login">Go to Login</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Reset Password</h1>
        <p className="text-sm text-muted-foreground">
          Enter your new password below.
        </p>
      </div>

      <BotProtectedForm
        onSubmit={handleBotProtectedSubmit}
        onBotDetected={handleBotDetected}
        submitButtonText="Reset Password"
        loadingButtonText="Resetting..."
        ButtonComponent={Button}
        className="space-y-4"
        showDebugPanel={process.env.NODE_ENV === "development"}
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="password">New Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={values.password}
                onChange={handleChange}
                disabled={loading}
                className="pr-10"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500 mt-1">{errors.password}</p>
            )}
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={values.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                className="pr-10"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-500 mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>
        </div>
      </BotProtectedForm>
    </div>
  );
}
