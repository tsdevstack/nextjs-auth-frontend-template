import axios from "axios";

/**
 * Map common HTTP status codes to user-friendly messages
 */
const STATUS_MESSAGES: Record<number, string> = {
  400: "Invalid request. Please check your input.",
  401: "Invalid credentials.",
  403: "Access denied.",
  404: "Not found.",
  409: "This resource already exists.",
  429: "Too many attempts. Please wait a few minutes and try again.",
  500: "Server error. Please try again later.",
  502: "Service unavailable. Please try again later.",
  503: "Service unavailable. Please try again later.",
};

/**
 * Extract a user-friendly error message from various error types.
 * Handles axios errors, standard errors, and unknown error types.
 */
export function getErrorMessage(error: unknown, fallback: string): string {
  // Handle axios errors
  if (axios.isAxiosError(error)) {
    // First, try to get message from response data
    const responseMessage = error.response?.data?.message;
    if (responseMessage && typeof responseMessage === "string") {
      return responseMessage;
    }

    // Second, try to get message from error field
    const errorField = error.response?.data?.error;
    if (errorField && typeof errorField === "string") {
      return errorField;
    }

    // Third, map status code to user-friendly message
    const status = error.response?.status;
    if (status && STATUS_MESSAGES[status]) {
      return STATUS_MESSAGES[status];
    }

    // For axios errors with unmapped status codes, use fallback
    return fallback;
  }

  // Handle standard Error objects (but filter out technical messages)
  if (error instanceof Error) {
    // Don't show axios's default "Request failed with status code X" messages
    if (!error.message.startsWith("Request failed with status code")) {
      return error.message;
    }
  }

  return fallback;
}