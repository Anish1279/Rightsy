import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/constants/auth";
import { getSessionUser } from "@/features/auth/services/auth-service";
import { jsonOk, routeHandler } from "@/lib/api/api-response";

export async function GET() {
  return routeHandler(async () => {
    const cookieStore = await cookies();
    const user = await getSessionUser(cookieStore.get(AUTH_COOKIE_NAME)?.value);

    return jsonOk({ user });
  });
}
