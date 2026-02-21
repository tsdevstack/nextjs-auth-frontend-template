"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { authAPI } from "@/lib/nextApi/auth.api";

export function ConfirmClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("No confirmation token provided");
      return;
    }

    // Call the confirmation API
    const confirmEmail = async () => {
      try {
        authAPI.confirm(token);

        setStatus("success");
        setMessage("Email confirmed successfully!");

        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push("/login?confirmed=true");
        }, 2000);
      } catch (error) {
        setStatus("error");

        setMessage(
          error instanceof Error ? error.message : "Confirmation failed"
        );
        console.error("Confirmation error:", error);
      }
    };

    confirmEmail();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 p-8 text-center">
        {status === "loading" && (
          <>
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <h2 className="text-2xl font-bold text-foreground">
              Confirming your email...
            </h2>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <h2 className="text-2xl font-bold text-foreground">
              Email Confirmed!
            </h2>
            <p className="text-muted-foreground">{message}</p>
            <p className="text-sm text-muted-foreground">
              Redirecting to login...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="text-2xl font-bold text-foreground">
              Confirmation Failed
            </h2>
            <p className="text-muted-foreground">{message}</p>
          </>
        )}
      </div>
    </div>
  );
}