import { NextRequest, NextResponse } from "next/server";
import { authClient } from "@/lib/externalApi/auth-service.api";
import { validateResetPasswordRequest } from "@/lib/validations/auth.schemas";
import { handleApiError } from "@/lib/utils/api-error-handler";
import type { ReturnMessageDto } from "@shared/auth-service-client";

type ResetPasswordErrorResponse = {
  error: string;
  details?: ReturnType<typeof validateResetPasswordRequest>["errors"] | string;
};

export async function POST(
  request: NextRequest
): Promise<NextResponse<ReturnMessageDto | ResetPasswordErrorResponse>> {
  try {
    const body = await request.json();

    const validation = validateResetPasswordRequest(body);

    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // Now TypeScript knows validation.data is not null
    const { password, token, botDetection } = validation.data;

    // Bot detection validation
    if (botDetection) {
      if (botDetection.isBot || botDetection.score > 50) {
        return NextResponse.json(
          { error: "Suspicious activity detected. Please try again." },
          { status: 429 }
        );
      }
    }

    // Call Auth Service reset password endpoint
    const response = await authClient.v1.resetPassword({
      token,
      password,
    });

    return NextResponse.json(response.data);
  } catch (error) {
    return handleApiError(error, "Failed to reset password");
  }
}
