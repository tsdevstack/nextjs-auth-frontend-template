import { ReactNode } from "react";
import { ProtectedProviders } from "@/providers/protected-providers";

export default function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <ProtectedProviders>{children}</ProtectedProviders>;
}
