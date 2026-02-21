import { MainLayout } from "@/components/layout/main-layout";
import { ReactNode } from "react";

export default function UserLayout({ children }: { children: ReactNode }) {
  return <MainLayout>{children}</MainLayout>;
}
