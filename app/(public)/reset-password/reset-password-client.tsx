"use client";

import { useState, useEffect, useRef } from "react";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { AxiosResponse } from "axios";
import { type BotDetectionResult } from "@tsdevstack/react-bot-detection";
import { takeLinkToken } from "@/lib/utils/take-link-token";

interface ResetPasswordClientProps {
  onSubmit: (
    token: string,
    password: string,
    botDetection: BotDetectionResult,
  ) => Promise<AxiosResponse<{ message: string }> | void>;
}

export default function ResetPasswordClient({
  onSubmit,
}: ResetPasswordClientProps) {
  const [token, setToken] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const hasRun = useRef(false);

  useEffect(() => {
    // Only run once
    if (hasRun.current) return;
    hasRun.current = true;

    // The token is in the link after # (never sent to a server), so it's
    // read here in the browser, then removed from the address bar
    setToken(takeLinkToken());
    setInitialized(true);
  }, []);

  // Show loading while initializing
  if (!initialized) {
    return null;
  }

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-foreground">
          Invalid Reset Link
        </h1>
        <p className="text-muted-foreground">
          This reset link is invalid or has expired.
        </p>
        <a href="/forgot-password" className="text-primary hover:underline">
          Request a new reset link
        </a>
      </div>
    );
  }

  return <ResetPasswordForm token={token} onSubmit={onSubmit} />;
}
