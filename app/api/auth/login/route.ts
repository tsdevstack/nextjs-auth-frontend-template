import { NextRequest, NextResponse } from "next/server";
import { authClient } from "@/lib/externalApi/auth-service.api";
import { validateLoginRequest } from "@/lib/validations/auth.schemas";
import { setTokenCookies } from "@/lib/utils/token-cookies";
import { handleApiError } from "@/lib/utils/api-error-handler";
import type { ReturnMessageDto } from "@shared/auth-service-client";

type LoginErrorResponse = {
  error: string;
  details?: ReturnType<typeof validateLoginRequest>["errors"] | string;
};

export async function POST(
  request: NextRequest
): Promise<NextResponse<ReturnMessageDto | LoginErrorResponse>> {
  try {
    const body = await request.json();

    const validation = validateLoginRequest(body);

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
    const { email, password, botDetection } = validation.data;

    // Bot detection validation
    if (botDetection) {
      if (botDetection.isBot || botDetection.score > 50) {
        return NextResponse.json(
          { error: "Suspicious activity detected. Please try again." },
          { status: 429 }
        );
      }
    }

    // Call NestJS login endpoint
    const response = await authClient.v1.login({ email, password });

    const { accessToken, refreshToken } = response.data;

    const res = NextResponse.json({ message: "Login successful" });
    setTokenCookies(res, accessToken, refreshToken);

    return res;
  } catch (error) {
    return handleApiError(error, "Failed to log in. Please try again.");
  }
}
