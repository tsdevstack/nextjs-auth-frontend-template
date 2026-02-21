"use client";

import { Suspense } from "react";
import { authAPI } from "@/lib/nextApi/auth.api";
import ResetPasswordClient from "./reset-password-client";
import { type BotDetectionResult } from "@tsdevstack/react-bot-detection";

export default function ResetPasswordPage() {
  const handleResetPassword = async (
    token: string,
    password: string,
    botDetection: BotDetectionResult
  ) => {
    if (botDetection.isBot) {
      return;
    }

    return authAPI.resetPassword({ token, password, botDetection });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <Suspense fallback={<div>Loading...</div>}>
          <ResetPasswordClient onSubmit={handleResetPassword} />
        </Suspense>
      </div>
    </div>
  );
}
