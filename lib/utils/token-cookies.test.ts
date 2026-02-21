import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";
import { setTokenCookies, clearTokenCookies } from "./token-cookies";

describe("Token Cookie Utilities", () => {
  describe("setTokenCookies", () => {
    let response: NextResponse;

    beforeEach(() => {
      response = NextResponse.json({});
    });

    it("should set accessToken cookie", () => {
      setTokenCookies(response, "access-token-value", "refresh-token-value");

      const accessToken = response.cookies.get("accessToken");
      expect(accessToken?.value).toBe("access-token-value");
    });

    it("should set refreshToken cookie", () => {
      setTokenCookies(response, "access-token-value", "refresh-token-value");

      const refreshToken = response.cookies.get("refreshToken");
      expect(refreshToken?.value).toBe("refresh-token-value");
    });

    it("should return the response", () => {
      const result = setTokenCookies(
        response,
        "access-token-value",
        "refresh-token-value"
      );

      expect(result).toBe(response);
    });

    it("should set both cookies with correct options", () => {
      const setSpy = vi.spyOn(response.cookies, "set");
      setTokenCookies(response, "access", "refresh");

      expect(setSpy).toHaveBeenCalledTimes(2);

      // Access token call
      expect(setSpy).toHaveBeenCalledWith(
        "accessToken",
        "access",
        expect.objectContaining({
          httpOnly: true,
        })
      );

      // Refresh token call
      expect(setSpy).toHaveBeenCalledWith(
        "refreshToken",
        "refresh",
        expect.objectContaining({
          httpOnly: true,
        })
      );
    });

    it("should use default TTL values when env vars not set", () => {
      const setSpy = vi.spyOn(response.cookies, "set");
      setTokenCookies(response, "access", "refresh");

      // Access token should have 15 minutes (900 seconds) default
      expect(setSpy).toHaveBeenCalledWith(
        "accessToken",
        "access",
        expect.objectContaining({
          maxAge: 900,
        })
      );

      // Refresh token should have 7 days (604800 seconds) default
      expect(setSpy).toHaveBeenCalledWith(
        "refreshToken",
        "refresh",
        expect.objectContaining({
          maxAge: 604800,
        })
      );
    });
  });

  describe("clearTokenCookies", () => {
    let response: NextResponse;

    beforeEach(() => {
      response = NextResponse.json({});
    });

    it("should clear accessToken cookie", () => {
      clearTokenCookies(response);

      const accessToken = response.cookies.get("accessToken");
      expect(accessToken?.value).toBe("");
    });

    it("should clear refreshToken cookie", () => {
      clearTokenCookies(response);

      const refreshToken = response.cookies.get("refreshToken");
      expect(refreshToken?.value).toBe("");
    });

    it("should call clearCookie for both tokens", () => {
      const setSpy = vi.spyOn(response.cookies, "set");
      clearTokenCookies(response);

      expect(setSpy).toHaveBeenCalledTimes(2);

      // Both should have maxAge: 0 to expire them
      expect(setSpy).toHaveBeenCalledWith(
        "accessToken",
        "",
        expect.objectContaining({
          maxAge: 0,
        })
      );

      expect(setSpy).toHaveBeenCalledWith(
        "refreshToken",
        "",
        expect.objectContaining({
          maxAge: 0,
        })
      );
    });
  });
});