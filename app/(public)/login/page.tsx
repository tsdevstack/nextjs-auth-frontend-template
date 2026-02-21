import { Suspense } from "react";
import { LoginClient } from "./login-client";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="w-full max-w-md space-y-6">
            <div>Loading...</div>
          </div>
        </div>
      }
    >
      <LoginClient />
    </Suspense>
  );
}
