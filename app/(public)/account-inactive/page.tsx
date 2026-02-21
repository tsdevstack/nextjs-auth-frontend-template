import { Button } from "@/components/ui/button";
import { UserX } from "lucide-react";
import Link from "next/link";

export default function AccountInactivePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 p-8 text-center">
        <div>
          <UserX className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-6 text-3xl font-bold text-foreground">
            Account Inactive
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Your account is currently inactive. This may be because your account
            is pending approval or has been deactivated.
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            If you believe this is an error, please contact support for
            assistance.
          </p>

          <Button asChild variant="outline" className="w-full">
            <Link href="/login">Back to Login</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
