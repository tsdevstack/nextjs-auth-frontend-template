import { NextRequest, NextResponse } from "next/server";
import { authClient } from "@/lib/externalApi/auth-service.api";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "Confirmation token is required" },
        { status: 400 }
      );
    }

    // Call NestJS to confirm email
    await authClient.v1.confirmEmail({ token });

    // Instead of returning JSON, redirect to login with success message
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("confirmed", "true");

    return NextResponse.redirect(loginUrl);
  } catch (error) {
    console.error("Email confirmation error:", error);

    // On error, redirect to login with error
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "confirmation-failed");

    return NextResponse.redirect(loginUrl);
  }
}
