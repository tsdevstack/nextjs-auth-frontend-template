/**
 * Reads the token of an emailed link (confirm email, reset password) and
 * removes it from the address bar. Browser only.
 *
 * Links carry the token after `#` (`/confirm#token=...`): browsers never send
 * that part to a server, so no load balancer, Kong or Next.js log records it,
 * and it never goes out in a Referer header. Links sent before carry
 * `?token=`, which is read too.
 */
export function takeLinkToken(): string | null {
  const { hash, search, pathname } = window.location;
  const token =
    new URLSearchParams(hash.slice(1)).get("token") ||
    new URLSearchParams(search).get("token") ||
    null;

  if (token) {
    window.history.replaceState(null, "", pathname);
  }
  return token;
}
