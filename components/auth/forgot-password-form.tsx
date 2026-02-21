"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AxiosResponse } from "axios";
import {
  BotProtectedForm,
  type BotDetectionResult,
} from "@tsdevstack/react-bot-detection";
import { Button } from "@/components/ui/button";
import {
  ForgotPasswordFormData,
  forgotPasswordSchema,
} from "@/lib/validations/auth.schemas";
import { getErrorMessage } from "@/lib/utils/get-error-message";

interface ForgotPasswordFormProps {
  onSubmit: (
    email: string,
    botDetection: BotDetectionResult
  ) => Promise<AxiosResponse<{ message: string }> | void>;
}

export function ForgotPasswordForm({ onSubmit }: ForgotPasswordFormProps) {
  const [values, setValues] = useState<ForgotPasswordFormData>({ email: "" });
  const [errors, setErrors] = useState<Partial<ForgotPasswordFormData>>({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

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
      email: formData.get("email") as string,
    };

    const parsed = forgotPasswordSchema.safeParse(formValues);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0],
      });
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formValues.email, botDetection);
      setSuccess(true);
    } catch (err) {
      setErrors({
        email: getErrorMessage(err, "Failed to send reset email"),
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle bot detection
  const handleBotDetected = (result: BotDetectionResult) => {
    console.warn("Bot detected on forgot password form:", result);
    setErrors({
      email: "Suspicious activity detected. Please try again later.",
    });
  };

  if (success) {
    return (
      <div className="w-full max-w-sm mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Forgot Password</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email address and we&apos;ll send you a reset link.
          </p>
        </div>
        <Alert>
          <AlertDescription>
            If your email is registered, you&apos;ll receive a reset link
            shortly.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Forgot Password</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email address and we&apos;ll send you a reset link.
        </p>
      </div>

      <BotProtectedForm
        onSubmit={handleBotProtectedSubmit}
        onBotDetected={handleBotDetected}
        submitButtonText="Send reset link"
        loadingButtonText="Sending..."
        ButtonComponent={Button}
        className="space-y-4"
        showDebugPanel={process.env.NODE_ENV === "development"}
      >
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email address
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            value={values.email}
            onChange={handleChange}
            disabled={loading}
            autoComplete="email"
          />
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email}</p>
          )}
        </div>
      </BotProtectedForm>
    </div>
  );
}
