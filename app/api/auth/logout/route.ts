import { NextRequest, NextResponse } from "next/server";
import { authClient } from "@/lib/externalApi/auth-service.api";
import { clearTokenCookies } from "@/lib/utils/token-cookies";
import type { ReturnMessageDto } from "@shared/auth-service-client";

export async function POST(request: NextRequest): Promise<NextResponse<ReturnMessageDto | { error: string }>> {
  try {
    const { refreshToken: refreshTokenFromRequest } = await request.json();

    if (!refreshTokenFromRequest) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    // Always clear cookies first
    const nextResponse = NextResponse.json({
      message: "Logged out successfully",
    });
    clearTokenCookies(nextResponse);

    // Try to call NestJS logout endpoint, but don't fail if it errors
    try {
      await authClient.v1.logout({ refreshToken: refreshTokenFromRequest });
    } catch (logoutError) {
      console.error("Auth service logout failed, but continuing:", logoutError);
      // Continue anyway - local logout is more important
    }

    return nextResponse;
  } catch (error) {
    console.error("Logout error:", error);

    // Even on error, clear cookies and return success
    const errorResponse = NextResponse.json({
      message: "Logged out successfully", // Still success from client perspective
    });
    clearTokenCookies(errorResponse);

    return errorResponse;
  }
}
