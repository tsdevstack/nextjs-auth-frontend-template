"use client";

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { authAPI } from "@/lib/nextApi/auth.api";
import { type BotDetectionResult } from "@tsdevstack/react-bot-detection";

export default function ForgotPasswordPage() {
  const handleForgotPassword = async (
    email: string,
    botDetection: BotDetectionResult
  ) => {
    if (botDetection.isBot) {
      return;
    }

    return authAPI.forgotPassword({ email, botDetection });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <ForgotPasswordForm onSubmit={handleForgotPassword} />
      </div>
    </div>
  );
}
