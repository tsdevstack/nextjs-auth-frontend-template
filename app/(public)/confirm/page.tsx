import { Suspense } from "react";
import { ConfirmClient } from "./confirm-client";
import { Loader2 } from "lucide-react";

export default function ConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="max-w-md w-full space-y-8 p-8 text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <h2 className="text-2xl font-bold text-foreground">
              Loading...
            </h2>
          </div>
        </div>
      }
    >
      <ConfirmClient />
    </Suspense>
  );
}
