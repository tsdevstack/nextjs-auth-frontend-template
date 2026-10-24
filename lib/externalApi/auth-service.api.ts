import { Api } from "@shared/auth-service-client";
import { forwardClientIp } from "@/lib/utils/forward-client-ip";

// Initialize and export the generated API client instance
// This client is configured with the Kong Gateway URL
// The securityWorker automatically adds JWT tokens for protected endpoints
//
// Server-side: Use KONG_INTERNAL_URL to bypass Load Balancer/Cloud Armor
// Client-side: Falls back to API_URL (public URL through LB)
export const authClient = new Api<{ token: string }>({
  baseURL: process.env.KONG_INTERNAL_URL || process.env.API_URL,
  securityWorker: (securityData) => {
    return securityData?.token
      ? { headers: { Authorization: `Bearer ${securityData.token}` } }
      : {};
  },
});

// Names the visitor on each call, so Kong rate-limits per visitor
authClient.instance.interceptors.request.use(forwardClientIp);
