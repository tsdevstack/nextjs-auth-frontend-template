"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { SignupDto } from "@shared/auth-service-client";
import { AxiosResponse } from "axios";
import {
  BotProtectedForm,
  type BotDetectionResult,
} from "@tsdevstack/react-bot-detection";
import { Button } from "@/components/ui/button";
import {
  signupFormSchema,
  type SignupFormData,
} from "@/lib/validations/auth.schemas";
import { MessageResponse } from "@/lib/nextApi/auth.api";
import { getErrorMessage } from "@/lib/utils/get-error-message";

type SignupFormState = Omit<SignupFormData, "acceptedTerms"> & {
  acceptedTerms: boolean;
};

interface SignupFormProps {
  onSubmit: (
    signupData: SignupDto,
    botDetection: BotDetectionResult,
  ) => Promise<AxiosResponse<MessageResponse> | void>;
}

export function SignupForm({ onSubmit }: SignupFormProps) {
  const [values, setValues] = useState<SignupFormState>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptedTerms: false,
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof SignupFormData, string>>
  >({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleBotProtectedSubmit = async (
    formData: FormData,
    botDetection: BotDetectionResult,
  ) => {
    setErrors({});
    setSuccess(false);

    const formValues = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
      acceptedTerms: formData.get("acceptedTerms") === "on",
    };

    const result = signupFormSchema.safeParse(formValues);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        firstName: fieldErrors.firstName?.[0],
        lastName: fieldErrors.lastName?.[0],
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
        confirmPassword: fieldErrors.confirmPassword?.[0],
        acceptedTerms: fieldErrors.acceptedTerms?.[0],
      });
      return;
    }

    setLoading(true);
    try {
      await onSubmit(
        {
          firstName: formValues.firstName,
          lastName: formValues.lastName,
          email: formValues.email,
          password: formValues.password,
        },
        botDetection,
      );

      setSuccess(true);
    } catch (err) {
      setErrors({
        email: getErrorMessage(err, "Signup failed. Please try again."),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBotDetected = () => {
    setErrors({
      email: "Suspicious activity detected. Please try again later.",
    });
  };

  if (success) {
    return (
      <div className="w-full max-w-sm mx-auto space-y-6">
        <Alert>
          <AlertDescription className="text-sm text-muted-foreground flex flex-wrap items-center">
            Account created! Please check your email to confirm your account
            before logging in.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <BotProtectedForm
      onSubmit={handleBotProtectedSubmit}
      onBotDetected={handleBotDetected}
      submitButtonText="Sign Up"
      loadingButtonText="Creating account..."
      ButtonComponent={Button}
      className="w-full max-w-sm mx-auto space-y-6"
      showDebugPanel={process.env.NODE_ENV === "development"}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            name="firstName"
            value={values.firstName}
            onChange={handleChange}
            disabled={loading}
            autoComplete="given-name"
          />
          {errors.firstName && (
            <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            name="lastName"
            value={values.lastName}
            onChange={handleChange}
            disabled={loading}
            autoComplete="family-name"
          />
          {errors.lastName && (
            <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
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

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
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
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-500 mt-1">{errors.password}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            value={values.confirmPassword}
            onChange={handleChange}
            disabled={loading}
            autoComplete="new-password"
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-500 mt-1">
              {errors.confirmPassword}
            </p>
          )}
        </div>
      </div>

      <div className="m-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="acceptedTerms"
            name="acceptedTerms"
            checked={values.acceptedTerms}
            onCheckedChange={(checked) =>
              setValues((prev) => ({
                ...prev,
                acceptedTerms: Boolean(checked),
              }))
            }
            disabled={loading}
          />
          <label htmlFor="acceptedTerms" className="text-sm leading-none">
            I agree to the{" "}
            <a
              href="/terms-and-conditions.pdf"
              className="underline text-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              terms and conditions
            </a>
          </label>
        </div>
        {errors.acceptedTerms && (
          <p className="text-sm text-red-500 mt-1">{errors.acceptedTerms}</p>
        )}
      </div>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="hover:underline text-primary font-medium"
          >
            Log in
          </Link>
        </p>
      </div>
    </BotProtectedForm>
  );
}
