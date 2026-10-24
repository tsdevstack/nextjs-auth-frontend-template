import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AxiosHeaders, type InternalAxiosRequestConfig } from "axios";

vi.mock("next/headers", () => ({ headers: vi.fn() }));

import { headers } from "next/headers";
import { forwardClientIp } from "./forward-client-ip";

function makeConfig(): InternalAxiosRequestConfig {
  return { headers: new AxiosHeaders() } as InternalAxiosRequestConfig;
}

function incoming(values: Record<string, string>) {
  vi.mocked(headers).mockResolvedValue(
    new Headers(values) as Awaited<ReturnType<typeof headers>>
  );
}

describe("forwardClientIp", () => {
  beforeEach(() => {
    vi.mocked(headers).mockReset();
    vi.stubEnv("KONG_FRONTEND_TOKEN", "frontend-token");
    vi.stubEnv("TSDEVSTACK_CLIENT_IP_HEADER", "X-Azure-SocketIP");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("should add the visitor's address and the frontend token", async () => {
    incoming({ "x-azure-socketip": "203.0.113.7" });

    const config = await forwardClientIp(makeConfig());

    expect(config.headers.get("X-Tsdevstack-Client-IP")).toBe("203.0.113.7");
    expect(config.headers.get("X-Tsdevstack-Frontend-Token")).toBe(
      "frontend-token"
    );
  });

  it("should read the header named in TSDEVSTACK_CLIENT_IP_HEADER only", async () => {
    vi.stubEnv("TSDEVSTACK_CLIENT_IP_HEADER", "X-Edge-Client");
    incoming({
      "x-azure-socketip": "198.51.100.1",
      "x-edge-client": "2001:db8::7",
    });

    const config = await forwardClientIp(makeConfig());

    expect(config.headers.get("X-Tsdevstack-Client-IP")).toBe("2001:db8::7");
  });

  it("should leave the call unchanged without the frontend token", async () => {
    vi.stubEnv("KONG_FRONTEND_TOKEN", "");
    incoming({ "x-azure-socketip": "203.0.113.7" });

    const config = await forwardClientIp(makeConfig());

    expect(config.headers.has("X-Tsdevstack-Client-IP")).toBe(false);
    expect(config.headers.has("X-Tsdevstack-Frontend-Token")).toBe(false);
  });

  it("should leave the call unchanged when no client IP header is configured", async () => {
    vi.stubEnv("TSDEVSTACK_CLIENT_IP_HEADER", "");
    incoming({ "x-azure-socketip": "203.0.113.7" });

    const config = await forwardClientIp(makeConfig());

    expect(config.headers.has("X-Tsdevstack-Client-IP")).toBe(false);
    expect(headers).not.toHaveBeenCalled();
  });

  it("should leave the call unchanged when the request lacks the header", async () => {
    incoming({});

    const config = await forwardClientIp(makeConfig());

    expect(config.headers.has("X-Tsdevstack-Client-IP")).toBe(false);
    expect(config.headers.has("X-Tsdevstack-Frontend-Token")).toBe(false);
  });

  it("should leave the call unchanged outside a request", async () => {
    vi.mocked(headers).mockRejectedValue(
      new Error("`headers` was called outside a request scope")
    );

    const config = await forwardClientIp(makeConfig());

    expect(config.headers.has("X-Tsdevstack-Client-IP")).toBe(false);
  });
});
