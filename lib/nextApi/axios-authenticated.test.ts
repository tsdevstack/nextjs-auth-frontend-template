import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import axios from "axios";

// Mock axios.create to capture the interceptors
const mockInterceptors = {
  response: {
    use: vi.fn(),
  },
};

// Create a callable mock that also has properties
const mockAxiosInstance = Object.assign(
  vi.fn().mockResolvedValue({ data: "retry success" }),
  {
    interceptors: mockInterceptors,
    get: vi.fn(),
    post: vi.fn(),
  }
);

vi.mock("axios", () => ({
  default: {
    create: vi.fn(() => mockAxiosInstance),
    post: vi.fn(),
  },
}));

describe("authenticatedClient", () => {
  let responseSuccessHandler: (response: unknown) => unknown;
  let responseErrorHandler: (error: unknown) => Promise<unknown>;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Capture the interceptor handlers
    mockInterceptors.response.use.mockImplementation(
      (successHandler, errorHandler) => {
        responseSuccessHandler = successHandler;
        responseErrorHandler = errorHandler;
      }
    );

    // Import fresh module to trigger interceptor setup
    vi.resetModules();
    await import("./axios-authenticated");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("response interceptor - success", () => {
    it("should pass through regular responses", () => {
      const response = { data: { foo: "bar" }, config: { url: "/api/other" } };
      const result = responseSuccessHandler(response);
      expect(result).toEqual(response);
    });

    it("should redirect to /confirm-email if user not confirmed", async () => {
      const mockLocation = { href: "" };
      Object.defineProperty(window, "location", {
        value: mockLocation,
        writable: true,
      });

      const response = {
        data: { confirmed: false, status: "ACTIVE" },
        config: { url: "/api/user/account" },
      };

      await expect(responseSuccessHandler(response)).rejects.toThrow(
        "Email not confirmed"
      );
      expect(mockLocation.href).toBe("/confirm-email");
    });

    it("should redirect to /account-inactive if account not active", async () => {
      const mockLocation = { href: "" };
      Object.defineProperty(window, "location", {
        value: mockLocation,
        writable: true,
      });

      const response = {
        data: { confirmed: true, status: "SUSPENDED" },
        config: { url: "/api/user/account" },
      };

      await expect(responseSuccessHandler(response)).rejects.toThrow(
        "Account inactive"
      );
      expect(mockLocation.href).toBe("/account-inactive");
    });

    it("should allow confirmed active user through", () => {
      const response = {
        data: { confirmed: true, status: "ACTIVE" },
        config: { url: "/api/user/account" },
      };

      const result = responseSuccessHandler(response);
      expect(result).toEqual(response);
    });
  });

  describe("response interceptor - error", () => {
    it("should reject non-401 errors", async () => {
      const error = { response: { status: 500 }, config: {} };

      await expect(responseErrorHandler(error)).rejects.toEqual(error);
    });

    it("should attempt token refresh on 401", async () => {
      const mockLocation = { href: "" };
      Object.defineProperty(window, "location", {
        value: mockLocation,
        writable: true,
      });

      // Mock successful refresh
      (axios.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        data: { success: true },
      });
      mockAxiosInstance.get.mockResolvedValueOnce({ data: "retry success" });

      const error = {
        response: { status: 401 },
        config: { url: "/api/test", _retry: false },
      };

      // The retry should use the original config
      await responseErrorHandler(error);
      expect(axios.post).toHaveBeenCalledWith("/api/auth/refresh-token");
    });

    it("should redirect to login on refresh failure", async () => {
      const mockLocation = { href: "" };
      Object.defineProperty(window, "location", {
        value: mockLocation,
        writable: true,
      });

      // Mock failed refresh
      (axios.post as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error("Refresh failed")
      );

      const error = {
        response: { status: 401 },
        config: { url: "/api/test", _retry: false },
      };

      await expect(responseErrorHandler(error)).rejects.toThrow();
      expect(mockLocation.href).toBe("/login");
    });

    it("should not retry if already retried", async () => {
      const error = {
        response: { status: 401 },
        config: { url: "/api/test", _retry: true },
      };

      await expect(responseErrorHandler(error)).rejects.toEqual(error);
      expect(axios.post).not.toHaveBeenCalled();
    });
  });
});