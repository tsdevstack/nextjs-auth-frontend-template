import { NextResponse } from "next/server";
import axios from "axios";
import { authClient } from "@/lib/externalApi/auth-service.api";
import { setTokenCookies, clearTokenCookies } from "@/lib/utils/token-cookies";
import { cookies } from "next/headers";
import type { ReturnMessageDto } from "@shared/auth-service-client";

export async function POST(): Promise<
  NextResponse<ReturnMessageDto | { error: string }>
> {
  let refreshTokenFromRequest: string | undefined;

  try {
    const cookieStore = await cookies();
    refreshTokenFromRequest = cookieStore.get("refreshToken")?.value;

    if (!refreshTokenFromRequest) {
      return NextResponse.json(
        {
          error: "No refresh token found",
        },
        { status: 401 }
      );
    }

    // Call NestJS refresh token endpoint
    const response = await authClient.v1.refreshToken({
      refreshToken: refreshTokenFromRequest,
    });

    const { accessToken, refreshToken } = response.data;

    const res = NextResponse.json({
      message: "Token refresh successful",
    });

    setTokenCookies(res, accessToken, refreshToken);

    return res;
  } catch (error) {
    console.error("Token refresh error:", error);

    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        // Refresh token is invalid/expired - call logout to clean up
        try {
          if (refreshTokenFromRequest) {
            await authClient.v1.logout({
              refreshToken: refreshTokenFromRequest,
            });
          }
        } catch (logoutError) {
          console.error("Logout cleanup failed:", logoutError);
          const errorRes = NextResponse.json(
            { error: "Token refresh failed and cleanup unsuccessful" },
            { status: 500 }
          );
          clearTokenCookies(errorRes);
          return errorRes;
        }

        const res = NextResponse.json(
          { error: "Invalid or expired refresh token" },
          { status: 401 }
        );
        clearTokenCookies(res);
        return res;
      }

      return NextResponse.json(
        { error: error.response?.data?.message || "Failed to refresh token" },
        { status: error.response?.status || 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to refresh token" },
      { status: 500 }
    );
  }
}
