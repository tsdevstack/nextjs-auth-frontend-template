"use client";

import { useSearchParams } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";

export function LoginMessages() {
  const searchParams = useSearchParams();
  const confirmed = searchParams.get("confirmed");
  const error = searchParams.get("error");

  return (
    <>
      {confirmed && (
        <Alert className="w-full max-w-sm mx-auto space-y-6">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Email confirmed! You can now log in.
          </AlertDescription>
        </Alert>
      )}

      {error === "confirmation-failed" && (
        <Alert
          variant="destructive"
          className="w-full max-w-sm mx-auto space-y-6"
        >
          <AlertDescription>
            Email confirmation failed. Please try again.
          </AlertDescription>
        </Alert>
      )}
    </>
  );
}
