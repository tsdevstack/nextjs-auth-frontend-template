"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/theme/mode-toggle";
import { MobileSidebar } from "./sidebar";

interface TopbarProps {
  authenticated: boolean;
}

export function Topbar({ authenticated }: TopbarProps) {
  return (
    <header className="h-16 flex items-center justify-between px-4 border-b bg-background">
      <div className="flex items-center gap-2">
        {authenticated && <MobileSidebar />}
        <span className="font-semibold text-lg">tsdevstack</span>
      </div>
      <div className="flex items-center gap-2">
        {!authenticated && (
          <Button variant="outline" size="sm" asChild>
            <Link href="/login">Login</Link>
          </Button>
        )}
        <ModeToggle />
      </div>
    </header>
  );
}
