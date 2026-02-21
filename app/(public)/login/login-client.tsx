"use client";

import { LoginForm } from "@/components/auth/login-form";
import { LoginMessages } from "@/components/auth/login-messages";
import { authAPI } from "@/lib/nextApi/auth.api";
import { type BotDetectionResult } from "@tsdevstack/react-bot-detection";
import { useRouter, useSearchParams } from "next/navigation";

export function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleLogin = async (
    email: string,
    password: string,
    botDetection: BotDetectionResult,
  ) => {
    if (botDetection.isBot) {
      return;
    }

    try {
      await authAPI.login({
        email,
        password,
        botDetection,
      });

      // Only redirect on success - validate callbackUrl is relative to prevent open redirect
      const callbackUrl = searchParams.get("callbackUrl");
      const safeUrl =
        callbackUrl?.startsWith("/") && !callbackUrl.startsWith("//")
          ? callbackUrl
          : "/user/home";
      router.push(safeUrl);
    } catch {
      throw new Error("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <LoginMessages />
        <LoginForm onSubmit={handleLogin} />
      </div>
    </div>
  );
}
