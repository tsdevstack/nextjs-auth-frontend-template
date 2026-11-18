import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import type { BotDetectionResult } from "@tsdevstack/react-bot-detection";
import { LoginClient } from "./login-client";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams(),
}));

const mockLogin = vi.fn();
vi.mock("@/lib/nextApi/auth.api", () => ({
  authAPI: { login: (data: unknown) => mockLogin(data) },
}));

// The form's submit handler, as the page hands it over
let submit: (
  email: string,
  password: string,
  botDetection: BotDetectionResult,
) => Promise<void>;
vi.mock("@/components/auth/login-form", () => ({
  LoginForm: ({ onSubmit }: { onSubmit: typeof submit }) => {
    submit = onSubmit;
    return null;
  },
}));
vi.mock("@/components/auth/login-messages", () => ({
  LoginMessages: () => null,
}));

const human = { isBot: false, score: 0 } as BotDetectionResult;

afterEach(() => {
  cleanup();
});

describe("LoginClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    render(<LoginClient />);
  });

  it("should go to the home page after a login", async () => {
    mockLogin.mockResolvedValue({ data: { message: "Login successful" } });

    await submit("ann@example.com", "secret", human);

    expect(mockPush).toHaveBeenCalledWith("/user/home");
  });

  it("should go to the confirmation page when the email isn't confirmed", async () => {
    mockLogin.mockResolvedValue({
      data: { message: "Email not confirmed", confirmEmail: true },
    });

    await submit("ann@example.com", "secret", human);

    expect(mockPush).toHaveBeenCalledWith("/confirm-email");
    expect(mockPush).toHaveBeenCalledTimes(1);
  });
});
