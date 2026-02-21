import { describe, it, expect } from "vitest";
import { AxiosError, AxiosHeaders } from "axios";
import { getErrorMessage } from "./get-error-message";

function createAxiosError(
  status: number,
  data?: Record<string, unknown>
): AxiosError {
  const error = new AxiosError("Request failed");
  error.response = {
    status,
    statusText: "Error",
    headers: {},
    config: { headers: new AxiosHeaders() },
    data: data ?? {},
  };
  return error;
}

describe("getErrorMessage", () => {
  describe("Axios errors with response message", () => {
    it("should return message from response.data.message", () => {
      const error = createAxiosError(400, { message: "Email already exists" });
      expect(getErrorMessage(error, "Fallback")).toBe("Email already exists");
    });

    it("should ignore non-string message values", () => {
      const error = createAxiosError(400, { message: { nested: "object" } });
      expect(getErrorMessage(error, "Fallback")).toBe(
        "Invalid request. Please check your input."
      );
    });
  });

  describe("Axios errors with error field", () => {
    it("should return message from response.data.error", () => {
      const error = createAxiosError(401, { error: "Invalid token" });
      expect(getErrorMessage(error, "Fallback")).toBe("Invalid token");
    });

    it("should prefer message over error field", () => {
      const error = createAxiosError(400, {
        message: "Primary message",
        error: "Secondary error",
      });
      expect(getErrorMessage(error, "Fallback")).toBe("Primary message");
    });

    it("should ignore non-string error values", () => {
      const error = createAxiosError(401, { error: 12345 });
      expect(getErrorMessage(error, "Fallback")).toBe("Invalid credentials.");
    });
  });

  describe("Axios errors with status code mapping", () => {
    it("should map 400 status to user-friendly message", () => {
      const error = createAxiosError(400);
      expect(getErrorMessage(error, "Fallback")).toBe(
        "Invalid request. Please check your input."
      );
    });

    it("should map 401 status to user-friendly message", () => {
      const error = createAxiosError(401);
      expect(getErrorMessage(error, "Fallback")).toBe("Invalid credentials.");
    });

    it("should map 403 status to user-friendly message", () => {
      const error = createAxiosError(403);
      expect(getErrorMessage(error, "Fallback")).toBe("Access denied.");
    });

    it("should map 404 status to user-friendly message", () => {
      const error = createAxiosError(404);
      expect(getErrorMessage(error, "Fallback")).toBe("Not found.");
    });

    it("should map 409 status to user-friendly message", () => {
      const error = createAxiosError(409);
      expect(getErrorMessage(error, "Fallback")).toBe(
        "This resource already exists."
      );
    });

    it("should map 429 status to rate limit message", () => {
      const error = createAxiosError(429);
      expect(getErrorMessage(error, "Fallback")).toBe(
        "Too many attempts. Please wait a few minutes and try again."
      );
    });

    it("should map 500 status to server error message", () => {
      const error = createAxiosError(500);
      expect(getErrorMessage(error, "Fallback")).toBe(
        "Server error. Please try again later."
      );
    });

    it("should map 502 status to service unavailable message", () => {
      const error = createAxiosError(502);
      expect(getErrorMessage(error, "Fallback")).toBe(
        "Service unavailable. Please try again later."
      );
    });

    it("should map 503 status to service unavailable message", () => {
      const error = createAxiosError(503);
      expect(getErrorMessage(error, "Fallback")).toBe(
        "Service unavailable. Please try again later."
      );
    });

    it("should return fallback for unmapped status codes", () => {
      const error = createAxiosError(418); // I'm a teapot
      expect(getErrorMessage(error, "Fallback")).toBe("Fallback");
    });
  });

  describe("Standard Error objects", () => {
    it("should return error message for standard Error", () => {
      const error = new Error("Something went wrong");
      expect(getErrorMessage(error, "Fallback")).toBe("Something went wrong");
    });

    it("should filter out axios default messages", () => {
      const error = new Error("Request failed with status code 500");
      expect(getErrorMessage(error, "Fallback")).toBe("Fallback");
    });

    it("should filter out any axios status code message", () => {
      const error = new Error("Request failed with status code 404");
      expect(getErrorMessage(error, "Fallback")).toBe("Fallback");
    });
  });

  describe("Unknown error types", () => {
    it("should return fallback for null", () => {
      expect(getErrorMessage(null, "Fallback")).toBe("Fallback");
    });

    it("should return fallback for undefined", () => {
      expect(getErrorMessage(undefined, "Fallback")).toBe("Fallback");
    });

    it("should return fallback for string", () => {
      expect(getErrorMessage("some error string", "Fallback")).toBe("Fallback");
    });

    it("should return fallback for number", () => {
      expect(getErrorMessage(42, "Fallback")).toBe("Fallback");
    });

    it("should return fallback for plain object", () => {
      expect(getErrorMessage({ some: "object" }, "Fallback")).toBe("Fallback");
    });
  });
});