"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, RefreshCw } from "lucide-react";
import Link from "next/link";
import { authAPI } from "@/lib/nextApi/auth.api";

interface ConfirmEmailClientProps {
  email: string;
}

export default function ConfirmEmailClient({ email }: ConfirmEmailClientProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResendEmail = async () => {
    if (!email) return;

    setLoading(true);
    setError(null);

    try {
      await authAPI.resendConfirmation(email);

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend email");
    } finally {
      setLoading(false);
    }
  };

  // Handle empty email case
  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-full space-y-8 p-8 text-center">
          <div>
            <Mail className="mx-auto h-12 w-12 text-muted-foreground" />
            <h2 className="mt-6 text-3xl font-bold text-foreground">
              Email confirmation required
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Please log in to verify your email address.
            </p>
          </div>

          <Button asChild className="w-full">
            <Link href="/login">Go to Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <Mail className="mx-auto h-12 w-12 text-primary" />
          <h2 className="mt-6 text-3xl font-bold text-foreground">
            Please confirm your email
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We&apos;ve sent a confirmation link to{" "}
            {email ? (
              <span className="font-medium">{email}</span>
            ) : (
              <span className="font-medium">your email address</span>
            )}
          </p>
        </div>

        <div className="space-y-4">
          {success && (
            <Alert>
              <AlertDescription>
                Confirmation email sent! Please check your inbox and spam
                folder.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Didn&apos;t receive the email? Check your spam folder or click
              below to resend.
            </p>

            <Button
              onClick={handleResendEmail}
              disabled={loading || !email}
              variant="outline"
              className="w-full"
            >
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Resend confirmation email"
              )}
            </Button>

            <div className="pt-4">
              <Link
                href="/login"
                className="text-sm text-primary hover:underline"
              >
                ← Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
