import { NextRequest, NextResponse } from "next/server";
import { authClient } from "@/lib/externalApi/auth-service.api";
import { validateSignupRequest } from "@/lib/validations/auth.schemas";
import { handleApiError } from "@/lib/utils/api-error-handler";
import type { ReturnMessageDto } from "@shared/auth-service-client";

type SignupSuccessResponse = ReturnMessageDto;
type SignupErrorResponse = {
  error: string;
  details?: ReturnType<typeof validateSignupRequest>["errors"] | string;
};

export async function POST(
  request: NextRequest
): Promise<NextResponse<SignupSuccessResponse | SignupErrorResponse>> {
  try {
    const body = await request.json();

    // Validate request with Zod
    const validation = validateSignupRequest(body);

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
    const { firstName, lastName, email, password, botDetection } =
      validation.data;

    // Bot detection validation
    if (botDetection) {
      if (botDetection.isBot || botDetection.score > 50) {
        return NextResponse.json(
          { error: "Suspicious activity detected. Please try again." },
          { status: 429 }
        );
      }
    }

    // Call NestJS signup endpoint
    const response = await authClient.v1.signup({
      firstName,
      lastName,
      email,
      password,
    });

    // Return success response
    return NextResponse.json(response.data);
  } catch (error) {
    return handleApiError(error, "Failed to create account. Please try again.");
  }
}
