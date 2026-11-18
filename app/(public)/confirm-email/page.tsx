import { cookies } from "next/headers";
import ConfirmEmailClient from "./confirm-email-client";
import { PENDING_EMAIL_COOKIE } from "@/lib/constants/auth-cookies";

export default async function ConfirmEmailPage() {
  const cookieStore = await cookies();
  const email = cookieStore.get(PENDING_EMAIL_COOKIE)?.value || "";

  return <ConfirmEmailClient email={email} />;
}
