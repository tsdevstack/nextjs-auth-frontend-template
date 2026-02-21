import { NextResponse } from "next/server";
import axios from "axios";

/**
 * Handles errors from API routes by preserving the original status code
 * and error message from the backend service
 */
export function handleApiError(error: unknown, fallbackMessage: string) {
  console.error("API error:", error);

  let status = 500;
  let message = fallbackMessage;

  // Extract status and message from Axios errors
  if (axios.isAxiosError(error)) {
    status = error.response?.status || 500;
    message = error.response?.data?.message || fallbackMessage;
  }

  return NextResponse.json(
    {
      error: message,
      ...(process.env.NODE_ENV === "development" && {
        details: error instanceof Error ? error.message : "Unknown error",
      }),
    },
    { status }
  );
}
