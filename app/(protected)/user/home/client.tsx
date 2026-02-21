"use client";

import { useUserDataProvider } from "@/providers/protected/user-data-provider";

export function Client() {
  const { state } = useUserDataProvider();

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-4">
        Welcome{state?.firstName ? `, ${state.firstName}` : ""}
      </h1>
      <p className="text-muted-foreground mb-8">
        Your tsdevstack application is up and running. This is your
        authenticated home page.
      </p>

      <div className="space-y-4 text-sm text-muted-foreground">
        <p>
          This template includes authentication, email confirmation, password
          reset, bot detection, and token management out of the box.
        </p>
        <p>Start building your application by editing this page.</p>
      </div>
    </div>
  );
}
