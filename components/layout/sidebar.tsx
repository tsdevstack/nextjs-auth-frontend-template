"use client";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import Link from "next/link";

export function Sidebar() {
  return (
    <div className="lg:w-64 bg-muted/40 border-r hidden lg:block">
      <nav className="p-4 flex flex-col gap-2">
        <Link href="/user/home" className="font-medium">
          Home
        </Link>
      </nav>
    </div>
  );
}

export function MobileSidebar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <SheetDescription className="sr-only">
            Mobile navigation sidebar
          </SheetDescription>
        </SheetHeader>
        <nav className="flex flex-col gap-4 p-4">
          <Link href="/user/home" className="font-medium">
            Home
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
