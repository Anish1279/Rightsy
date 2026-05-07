import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE_NAME } from "@/constants/auth";
import { getSessionUser } from "@/features/auth/services/auth-service";
import { jsonOk, routeHandler } from "@/lib/api/api-response";

export const runtime = "nodejs";

export async function GET() {
  return routeHandler(async () => {
    const cookieStore = await cookies();
    const user = await getSessionUser(cookieStore.get(ACCESS_TOKEN_COOKIE_NAME)?.value);

    return jsonOk({ user });
  });
}
