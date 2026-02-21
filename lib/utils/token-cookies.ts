import { NextResponse } from "next/server";
import { setHttpOnlyCookie, clearCookie } from "./cookies";

// Token expiry from env vars (with defaults matching backend)
const ACCESS_TOKEN_MAX_AGE = parseInt(
  process.env.ACCESS_TOKEN_TTL || "900",
  10
); // 15 minutes default
const REFRESH_TOKEN_MAX_AGE = parseInt(
  process.env.REFRESH_TOKEN_TTL || "604800",
  10
); // 7 days default

export function setTokenCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string
): NextResponse {
  setHttpOnlyCookie(response, "accessToken", accessToken, {
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });
  setHttpOnlyCookie(response, "refreshToken", refreshToken, {
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });

  return response;
}

export function clearTokenCookies(response: NextResponse) {
  clearCookie(response, "accessToken");
  clearCookie(response, "refreshToken");
}
