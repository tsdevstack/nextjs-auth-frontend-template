"use client";

import { authAPI } from "@/lib/nextApi/auth.api";
import { SignupDto } from "@shared/auth-service-client";
import { SignupForm } from "@/components/auth/signup-form";
import { type BotDetectionResult } from "@tsdevstack/react-bot-detection";

export default function SignupPage() {
  const handleSignup = async (
    signupData: SignupDto,
    botDetection: BotDetectionResult
  ) => {
    if (botDetection.isBot) {
      return;
    }

    return authAPI.signup({ ...signupData, botDetection });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <SignupForm onSubmit={handleSignup} />
    </div>
  );
}
