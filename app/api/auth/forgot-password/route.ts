import { NextRequest, NextResponse } from "next/server";
import { authClient } from "@/lib/externalApi/auth-service.api";
import { validateForgotPasswordRequest } from "@/lib/validations/auth.schemas";
import { handleApiError } from "@/lib/utils/api-error-handler";
import type { ReturnMessageDto } from "@shared/auth-service-client";

type ForgotPasswordErrorResponse = {
  error: string;
  details?: ReturnType<typeof validateForgotPasswordRequest>["errors"] | string;
};

export async function POST(
  request: NextRequest
): Promise<NextResponse<ReturnMessageDto | ForgotPasswordErrorResponse>> {
  try {
    const body = await request.json();

    const validation = validateForgotPasswordRequest(body);

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
    const { email, botDetection } = validation.data;

    // Bot detection validation
    if (botDetection) {
      if (botDetection.isBot || botDetection.score > 50) {
        return NextResponse.json(
          { error: "Suspicious activity detected. Please try again." },
          { status: 429 }
        );
      }
    }

    // Call NestJS forgot password endpoint
    const response = await authClient.v1.forgotPassword({
      email,
    });

    return NextResponse.json(response.data);
  } catch (error) {
    return handleApiError(error, "Failed to send reset email");
  }
}
