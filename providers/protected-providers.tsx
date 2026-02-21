"use client";

import { UserDataProvider } from "@/providers/protected/user-data-provider";

export function ProtectedProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return <UserDataProvider>{children}</UserDataProvider>;
}
