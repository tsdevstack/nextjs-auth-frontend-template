import axios from "axios";

/**
 * Describe an error in one line that is safe to log.
 *
 * An Axios error carries the whole request: the body (passwords, tokens) and
 * the headers (access tokens, the frontend's gateway token). Logging it as an
 * object writes all of that to the server logs. This keeps only the method,
 * the path without its query string, the status and the message.
 */
export function describeError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const method = error.config?.method?.toUpperCase() ?? "";
    const url = error.config?.url ?? "";
    let path: string;
    try {
      path = new URL(url, "http://localhost").pathname;
    } catch {
      path = url.split("?")[0];
    }
    const status = error.response?.status ?? error.code ?? "no response";
    return `${method} ${path} ${status}: ${error.message}`.trim();
  }

  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }

  return String(error);
}
