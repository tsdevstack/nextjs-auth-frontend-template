/**
 * Read the claims of a JWT without checking its signature. Only for a token
 * this server just got from auth-service (the login answer), to see what to
 * show next; never to decide access. Null for anything that isn't a JWT.
 */
export function readTokenClaims(token: string): Record<string, unknown> | null {
  const payload = token.split(".")[1];
  if (!payload) {
    return null;
  }
  try {
    const claims: unknown = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    );
    return claims && typeof claims === "object"
      ? (claims as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}
