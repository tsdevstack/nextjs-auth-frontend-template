import { describe, it, expect } from "vitest";
import { AxiosError, AxiosHeaders } from "axios";
import { describeError } from "./describe-error";

function failedLogin(): AxiosError {
  const headers = new AxiosHeaders({
    Authorization: "Bearer access-token-123",
    "X-Tsdevstack-Frontend-Token": "frontend-secret-456",
  });
  const error = new AxiosError(
    "Request failed with status code 401",
    "ERR_BAD_REQUEST",
    {
      method: "post",
      url: "https://api.example.com/auth/v1/auth/login?next=/account",
      data: '{"email":"alice@example.com","password":"Sup3rSecret!"}',
      headers,
    },
  );
  error.response = {
    status: 401,
    statusText: "Unauthorized",
    data: { message: "Invalid credentials" },
    headers: {},
    config: { headers },
  };
  return error;
}

describe("describeError", () => {
  describe("Axios errors", () => {
    it("should keep the method, path, status and message", () => {
      expect(describeError(failedLogin())).toBe(
        "POST /auth/v1/auth/login 401: Request failed with status code 401",
      );
    });

    it("should leave out the body, the headers and the query string", () => {
      const line = describeError(failedLogin());
      expect(line).not.toContain("alice@example.com");
      expect(line).not.toContain("Sup3rSecret!");
      expect(line).not.toContain("access-token-123");
      expect(line).not.toContain("frontend-secret-456");
      expect(line).not.toContain("next=");
    });

    it("should name the error code when there is no response", () => {
      const error = new AxiosError("connect ECONNREFUSED", "ECONNREFUSED", {
        method: "get",
        url: "/user/v1/profile",
        headers: new AxiosHeaders(),
      });
      expect(describeError(error)).toBe(
        "GET /user/v1/profile ECONNREFUSED: connect ECONNREFUSED",
      );
    });
  });

  describe("Other values", () => {
    it("should describe a plain error by name and message", () => {
      expect(describeError(new TypeError("bad input"))).toBe(
        "TypeError: bad input",
      );
    });

    it("should turn anything else into a string", () => {
      expect(describeError("oops")).toBe("oops");
    });
  });
});
