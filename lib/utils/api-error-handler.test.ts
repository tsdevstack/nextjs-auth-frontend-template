import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { handleApiError } from "./api-error-handler";
import { AxiosError, AxiosHeaders } from "axios";

describe("handleApiError", () => {
  const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

  beforeEach(() => {
    consoleSpy.mockClear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("with generic errors", () => {
    it("should return 500 status for generic errors", async () => {
      const error = new Error("Something went wrong");
      const response = handleApiError(error, "Fallback message");

      expect(response.status).toBe(500);
    });

    it("should use fallback message for generic errors", async () => {
      const error = new Error("Something went wrong");
      const response = handleApiError(error, "Fallback message");

      const body = await response.json();
      expect(body.error).toBe("Fallback message");
    });

    it("should log the error", () => {
      const error = new Error("Test error");
      handleApiError(error, "Fallback message");

      expect(consoleSpy).toHaveBeenCalledWith("API error:", error);
    });
  });

  describe("with Axios errors", () => {
    function createAxiosError(status: number, message?: string): AxiosError {
      const error = new AxiosError("Request failed");
      error.response = {
        status,
        statusText: "Error",
        headers: {},
        config: { headers: new AxiosHeaders() },
        data: message ? { message } : undefined,
      };
      return error;
    }

    it("should preserve status code from Axios error", async () => {
      const error = createAxiosError(401, "Unauthorized");
      const response = handleApiError(error, "Fallback message");

      expect(response.status).toBe(401);
    });

    it("should use message from Axios error response", async () => {
      const error = createAxiosError(400, "Invalid email format");
      const response = handleApiError(error, "Fallback message");

      const body = await response.json();
      expect(body.error).toBe("Invalid email format");
    });

    it("should use fallback when Axios response has no message", async () => {
      const error = createAxiosError(500);
      const response = handleApiError(error, "Server error");

      const body = await response.json();
      expect(body.error).toBe("Server error");
    });

    it("should handle 404 errors", async () => {
      const error = createAxiosError(404, "User not found");
      const response = handleApiError(error, "Not found");

      expect(response.status).toBe(404);
      const body = await response.json();
      expect(body.error).toBe("User not found");
    });

    it("should handle 403 errors", async () => {
      const error = createAxiosError(403, "Access denied");
      const response = handleApiError(error, "Forbidden");

      expect(response.status).toBe(403);
      const body = await response.json();
      expect(body.error).toBe("Access denied");
    });

    it("should default to 500 when Axios error has no response", async () => {
      const error = new AxiosError("Network error");
      // No response set - simulates network failure
      const response = handleApiError(error, "Network error");

      expect(response.status).toBe(500);
    });
  });

  describe("with unknown error types", () => {
    it("should handle string errors", async () => {
      const response = handleApiError("string error", "Fallback");

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error).toBe("Fallback");
    });

    it("should handle null errors", async () => {
      const response = handleApiError(null, "Fallback");

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error).toBe("Fallback");
    });

    it("should handle undefined errors", async () => {
      const response = handleApiError(undefined, "Fallback");

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error).toBe("Fallback");
    });
  });

  describe("development mode details", () => {
    it("should include error details in development", async () => {
      vi.stubEnv("NODE_ENV", "development");

      const error = new Error("Detailed error message");
      const response = handleApiError(error, "Fallback");

      const body = await response.json();
      expect(body.details).toBe("Detailed error message");
    });

    it("should not include details in production", async () => {
      vi.stubEnv("NODE_ENV", "production");

      const error = new Error("Detailed error message");
      const response = handleApiError(error, "Fallback");

      const body = await response.json();
      expect(body.details).toBeUndefined();
    });

    it("should show 'Unknown error' for non-Error objects in development", async () => {
      vi.stubEnv("NODE_ENV", "development");

      const response = handleApiError("string error", "Fallback");

      const body = await response.json();
      expect(body.details).toBe("Unknown error");
    });
  });
});