import { NextResponse } from "next/server";
import { authClient } from "@/lib/externalApi/auth-service.api";
import { cookies } from "next/headers";
import type { AxiosError } from "axios";
import type { UserDto } from "@shared/auth-service-client";

export async function GET(): Promise<NextResponse<UserDto | { error: string }>> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Set the security data with the JWT token
    authClient.setSecurityData({ token: accessToken });

    const response = await authClient.v1.getUserAccount();

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Account error:", error);
    const status = (error as AxiosError)?.response?.status || 500;
    return NextResponse.json({ error: "Failed to fetch account" }, { status });
  }
}