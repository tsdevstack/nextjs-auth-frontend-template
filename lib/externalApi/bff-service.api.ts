import { Api } from "@shared/bff-service-client";

// Initialize and export the generated API client instance
// This client is configured with the Kong Gateway URL
// The securityWorker automatically adds JWT tokens for protected endpoints
//
// Server-side: Use KONG_INTERNAL_URL to bypass Load Balancer/Cloud Armor
// Client-side: Falls back to API_URL (public URL through LB)
export const bffClient = new Api<{ token: string }>({
  baseURL: process.env.KONG_INTERNAL_URL || process.env.API_URL,
  securityWorker: (securityData) => {
    return securityData?.token
      ? { headers: { Authorization: `Bearer ${securityData.token}` } }
      : {};
  },
});
