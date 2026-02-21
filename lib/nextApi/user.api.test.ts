import { describe, it, expect, vi, beforeEach } from "vitest";
import { UserAPI } from "./user.api";

// Create mock client
const mockClient = {
  get: vi.fn(),
  post: vi.fn(),
};

describe("UserAPI", () => {
  let userAPI: UserAPI;

  beforeEach(() => {
    vi.clearAllMocks();
    userAPI = new UserAPI(mockClient as never);
  });

  describe("account", () => {
    it("should GET /api/user/account", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
      };
      mockClient.get.mockResolvedValue({ data: mockUser });

      const result = await userAPI.account();

      expect(mockClient.get).toHaveBeenCalledWith("/api/user/account");
      expect(result.data).toEqual(mockUser);
    });
  });

  describe("profile", () => {
    it("should GET /api/user/profile", async () => {
      const mockProfile = {
        userId: "user-123",
        displayName: "JohnD",
        bio: "Hello world",
      };
      mockClient.get.mockResolvedValue({ data: mockProfile });

      const result = await userAPI.profile();

      expect(mockClient.get).toHaveBeenCalledWith("/api/user/profile");
      expect(result.data).toEqual(mockProfile);
    });
  });
});