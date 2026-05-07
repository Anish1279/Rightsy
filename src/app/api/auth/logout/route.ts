import { clearSessionCookie } from "@/features/auth/services/session-cookie-service";
import { jsonOk } from "@/lib/api/api-response";

export function POST() {
  const response = jsonOk({ message: "Logout successful" });

  clearSessionCookie(response);

  return response;
}
