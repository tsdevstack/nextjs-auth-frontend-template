import type { InternalAxiosRequestConfig } from "axios";
import { headers } from "next/headers";

// Read by Kong's tsdevstack-client-ip plugin (same names as the CLI's
// KONG_CLIENT_IP_HEADER and KONG_FRONTEND_TOKEN_HEADER)
const CLIENT_IP_HEADER = "X-Tsdevstack-Client-IP";
const FRONTEND_TOKEN_HEADER = "X-Tsdevstack-Frontend-Token";

/**
 * Request interceptor for the server-side Kong clients. Every call this
 * server makes to Kong comes from this server's address, so Kong's per-client
 * rate limit would count all visitors as one. This adds the frontend token
 * (KONG_FRONTEND_TOKEN) and the visitor's address, and Kong counts the
 * visitor. The token alone also tells Kong the call comes from this frontend,
 * so Kong keeps its trace (traceparent) instead of dropping it.
 *
 * The address comes from the incoming request header named in
 * TSDEVSTACK_CLIENT_IP_HEADER, which the deploy sets to the header the
 * hosting edge writes and clients cannot forge (Azure: X-Azure-SocketIP from
 * Front Door; GCP and AWS: X-Tsdevstack-Edge-IP from the load balancer or a
 * CloudFront function). Without the token the call goes out unchanged;
 * without that variable, without that header, or outside a request, it
 * carries the token only.
 */
export async function forwardClientIp(
  config: InternalAxiosRequestConfig
): Promise<InternalAxiosRequestConfig> {
  const token = process.env.KONG_FRONTEND_TOKEN;
  if (!token) return config;
  config.headers.set(FRONTEND_TOKEN_HEADER, token);

  const ipHeader = process.env.TSDEVSTACK_CLIENT_IP_HEADER;
  if (!ipHeader) return config;

  let visitorIp: string | null;
  try {
    visitorIp = (await headers()).get(ipHeader);
  } catch {
    // Not inside a request (build time, scripts): no visitor to name
    return config;
  }
  if (!visitorIp) return config;

  config.headers.set(CLIENT_IP_HEADER, visitorIp);
  return config;
}
