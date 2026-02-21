import { NextRequest, NextResponse } from "next/server";
import { authClient } from "@/lib/externalApi/auth-service.api";
import { handleApiError } from "@/lib/utils/api-error-handler";
import type { ReturnMessageDto } from "@shared/auth-service-client";

export async function POST(
  request: NextRequest
): Promise<NextResponse<ReturnMessageDto | { error: string; details?: string }>> {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Call NestJS to resend confirmation
    await authClient.v1.resendConfirmation({ email });

    return NextResponse.json({
      message: "Confirmation email sent successfully",
    });
  } catch (error) {
    return handleApiError(error, "Failed to resend confirmation email");
  }
}
