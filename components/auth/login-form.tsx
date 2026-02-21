"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import {
  BotProtectedForm,
  type BotDetectionResult,
} from "@tsdevstack/react-bot-detection";
import { Button } from "@/components/ui/button";
import { loginSchema } from "@/lib/validations/auth.schemas";
import { getErrorMessage } from "@/lib/utils/get-error-message";

interface LoginFormProps {
  onSubmit: (
    email: string,
    password: string,
    botDetection: BotDetectionResult
  ) => Promise<void>;
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleBotProtectedSubmit = async (
    formData: FormData,
    botDetection: BotDetectionResult
  ) => {
    setErrors({});
    setFormError(null);

    // Get form values
    const emailValue = formData.get("email") as string;
    const passwordValue = formData.get("password") as string;

    // Validate with Zod
    const result = loginSchema.safeParse({
      email: emailValue,
      password: passwordValue,
    });

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      });
      return;
    }

    setLoading(true);

    try {
      await onSubmit(emailValue, passwordValue, botDetection);
    } catch (err) {
      setFormError(getErrorMessage(err, "Login failed"));
    } finally {
      setLoading(false);
    }
  };

  // Handle bot detection
  const handleBotDetected = (result: BotDetectionResult) => {
    console.warn("Bot detected on login form:", result);
    setFormError("Suspicious activity detected. Please try again later.");
  };

  return (
    <BotProtectedForm
      onSubmit={handleBotProtectedSubmit}
      onBotDetected={handleBotDetected}
      submitButtonText="Log In"
      loadingButtonText="Logging in..."
      ButtonComponent={Button}
      className="w-full max-w-sm mx-auto space-y-6"
      showDebugPanel={process.env.NODE_ENV === "development"}
    >
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Login</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and password to access your account.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            autoComplete="email"
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="pr-10"
              autoComplete="current-password"
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
              aria-label={showPassword ? "Hide password" : "Show password"}
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
            <p className="text-sm text-red-500">{errors.password}</p>
          )}
        </div>

        {formError && <p className="text-sm text-red-600">{formError}</p>}

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            <Link
              href="/forgot-password"
              className="hover:underline text-primary"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="hover:underline text-primary font-medium"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </BotProtectedForm>
  );
}
