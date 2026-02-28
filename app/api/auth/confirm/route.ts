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

    return NextResponse.json({ message: "Email confirmed successfully" });
  } catch (error) {
    console.error("Email confirmation error:", error);

    return NextResponse.json(
      { error: "Confirmation failed" },
      { status: 400 }
    );
  }
}
