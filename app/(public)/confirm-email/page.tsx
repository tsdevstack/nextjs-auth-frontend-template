import { cookies } from "next/headers";
import ConfirmEmailClient from "./confirm-email-client";

export default async function ConfirmEmailPage() {
  const cookieStore = await cookies();
  const email = cookieStore.get("pending-email")?.value || "";

  return <ConfirmEmailClient email={email} />;
}
