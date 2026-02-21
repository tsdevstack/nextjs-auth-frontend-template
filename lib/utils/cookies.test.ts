import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { setHttpOnlyCookie, getCookie, clearCookie } from "./cookies";

describe("Cookie Utilities", () => {
  describe("setHttpOnlyCookie", () => {
    let response: NextResponse;

    beforeEach(() => {
      response = NextResponse.json({});
    });

    it("should set a cookie with default options", () => {
      setHttpOnlyCookie(response, "testCookie", "testValue");

      const cookie = response.cookies.get("testCookie");
      expect(cookie?.value).toBe("testValue");
    });

    it("should set httpOnly to true by default", () => {
      const setSpy = vi.spyOn(response.cookies, "set");
      setHttpOnlyCookie(response, "testCookie", "testValue");

      expect(setSpy).toHaveBeenCalledWith(
        "testCookie",
        "testValue",
        expect.objectContaining({
          httpOnly: true,
        })
      );
    });

    it("should set sameSite to lax by default", () => {
      const setSpy = vi.spyOn(response.cookies, "set");
      setHttpOnlyCookie(response, "testCookie", "testValue");

      expect(setSpy).toHaveBeenCalledWith(
        "testCookie",
        "testValue",
        expect.objectContaining({
          sameSite: "lax",
        })
      );
    });

    it("should set path to / by default", () => {
      const setSpy = vi.spyOn(response.cookies, "set");
      setHttpOnlyCookie(response, "testCookie", "testValue");

      expect(setSpy).toHaveBeenCalledWith(
        "testCookie",
        "testValue",
        expect.objectContaining({
          path: "/",
        })
      );
    });

    it("should allow custom options to override defaults", () => {
      const setSpy = vi.spyOn(response.cookies, "set");
      setHttpOnlyCookie(response, "testCookie", "testValue", {
        maxAge: 3600,
        path: "/api",
      });

      expect(setSpy).toHaveBeenCalledWith(
        "testCookie",
        "testValue",
        expect.objectContaining({
          maxAge: 3600,
          path: "/api",
        })
      );
    });

    it("should set secure based on NODE_ENV", () => {
      const setSpy = vi.spyOn(response.cookies, "set");

      // Test development
      vi.stubEnv("NODE_ENV", "development");
      setHttpOnlyCookie(response, "devCookie", "devValue");

      expect(setSpy).toHaveBeenCalledWith(
        "devCookie",
        "devValue",
        expect.objectContaining({
          secure: false,
        })
      );

      vi.unstubAllEnvs();
    });
  });

  describe("getCookie", () => {
    it("should return cookie value when cookie exists", () => {
      const request = new NextRequest("http://localhost:3000/test", {
        headers: {
          cookie: "myCookie=myValue",
        },
      });

      const value = getCookie(request, "myCookie");
      expect(value).toBe("myValue");
    });

    it("should return undefined when cookie does not exist", () => {
      const request = new NextRequest("http://localhost:3000/test");

      const value = getCookie(request, "nonExistentCookie");
      expect(value).toBeUndefined();
    });

    it("should handle multiple cookies", () => {
      const request = new NextRequest("http://localhost:3000/test", {
        headers: {
          cookie: "cookie1=value1; cookie2=value2; cookie3=value3",
        },
      });

      expect(getCookie(request, "cookie1")).toBe("value1");
      expect(getCookie(request, "cookie2")).toBe("value2");
      expect(getCookie(request, "cookie3")).toBe("value3");
    });
  });

  describe("clearCookie", () => {
    let response: NextResponse;

    beforeEach(() => {
      response = NextResponse.json({});
    });

    it("should set cookie with empty value", () => {
      const setSpy = vi.spyOn(response.cookies, "set");
      clearCookie(response, "testCookie");

      expect(setSpy).toHaveBeenCalledWith(
        "testCookie",
        "",
        expect.any(Object)
      );
    });

    it("should set maxAge to 0", () => {
      const setSpy = vi.spyOn(response.cookies, "set");
      clearCookie(response, "testCookie");

      expect(setSpy).toHaveBeenCalledWith(
        "testCookie",
        "",
        expect.objectContaining({
          maxAge: 0,
        })
      );
    });

    it("should maintain security options when clearing", () => {
      const setSpy = vi.spyOn(response.cookies, "set");
      clearCookie(response, "testCookie");

      expect(setSpy).toHaveBeenCalledWith(
        "testCookie",
        "",
        expect.objectContaining({
          httpOnly: true,
          sameSite: "lax",
          path: "/",
        })
      );
    });
  });
});