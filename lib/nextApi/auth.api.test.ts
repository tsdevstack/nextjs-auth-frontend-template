import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthAPI } from "./auth.api";

// Create mock client
const mockClient = {
  post: vi.fn(),
  get: vi.fn(),
};

describe("AuthAPI", () => {
  let authAPI: AuthAPI;

  beforeEach(() => {
    vi.clearAllMocks();
    authAPI = new AuthAPI(mockClient as never);
  });

  describe("signup", () => {
    it("should POST to /signup with signup data", async () => {
      const signupData = {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "ValidPass123",
        botDetection: {
          score: 0,
          reasons: [],
          isBot: false,
          stats: { mouseMovements: 10, typingEvents: 20, focusEvents: 5, timeSpent: 5000 },
          honeypotTriggered: false,
        },
      };

      mockClient.post.mockResolvedValue({ data: { message: "Success" } });

      await authAPI.signup(signupData);

      expect(mockClient.post).toHaveBeenCalledWith("/signup", signupData);
    });
  });

  describe("login", () => {
    it("should POST to /login with email, password, and botDetection", async () => {
      const loginData = {
        email: "test@example.com",
        password: "ValidPass123",
        botDetection: {
          score: 0,
          reasons: [],
          isBot: false,
          stats: { mouseMovements: 10, typingEvents: 20, focusEvents: 5, timeSpent: 5000 },
          honeypotTriggered: false,
        },
      };

      mockClient.post.mockResolvedValue({ data: { message: "Success" } });

      await authAPI.login(loginData);

      expect(mockClient.post).toHaveBeenCalledWith("/login", loginData);
    });
  });

  describe("resendConfirmation", () => {
    it("should POST to /resend-confirmation with email", async () => {
      mockClient.post.mockResolvedValue({ data: { message: "Success" } });

      await authAPI.resendConfirmation("test@example.com");

      expect(mockClient.post).toHaveBeenCalledWith("/resend-confirmation", {
        email: "test@example.com",
      });
    });
  });

  describe("forgotPassword", () => {
    it("should POST to /forgot-password with email and botDetection", async () => {
      const data = {
        email: "test@example.com",
        botDetection: {
          score: 0,
          reasons: [],
          isBot: false,
          stats: { mouseMovements: 10, typingEvents: 20, focusEvents: 5, timeSpent: 5000 },
          honeypotTriggered: false,
        },
      };

      mockClient.post.mockResolvedValue({ data: { message: "Success" } });

      await authAPI.forgotPassword(data);

      expect(mockClient.post).toHaveBeenCalledWith("/forgot-password", data);
    });
  });

  describe("resetPassword", () => {
    it("should POST to /reset-password with token, password, and botDetection", async () => {
      const data = {
        token: "reset-token",
        password: "NewValidPass123",
        botDetection: {
          score: 0,
          reasons: [],
          isBot: false,
          stats: { mouseMovements: 10, typingEvents: 20, focusEvents: 5, timeSpent: 5000 },
          honeypotTriggered: false,
        },
      };

      mockClient.post.mockResolvedValue({ data: { message: "Success" } });

      await authAPI.resetPassword(data);

      expect(mockClient.post).toHaveBeenCalledWith("/reset-password", data);
    });
  });

  describe("confirm", () => {
    it("should POST to /confirm with token", async () => {
      mockClient.post.mockResolvedValue({ data: { message: "Success" } });

      await authAPI.confirm("confirmation-token");

      expect(mockClient.post).toHaveBeenCalledWith("/confirm", {
        token: "confirmation-token",
      });
    });
  });

  describe("refreshToken", () => {
    it("should POST to /refresh-token", async () => {
      mockClient.post.mockResolvedValue({ data: { message: "Success" } });

      await authAPI.refreshToken();

      expect(mockClient.post).toHaveBeenCalledWith("/refresh-token");
    });
  });

  describe("logout", () => {
    it("should POST to /logout with refreshToken", async () => {
      mockClient.post.mockResolvedValue({ data: { message: "Success" } });

      await authAPI.logout("refresh-token-value");

      expect(mockClient.post).toHaveBeenCalledWith("/logout", {
        refreshToken: "refresh-token-value",
      });
    });
  });
});