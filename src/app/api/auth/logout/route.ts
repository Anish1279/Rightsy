import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_NAME } from "@/constants/auth";
import { logoutSession } from "@/features/auth/services/auth-service";
import { revokeRefreshTokenSession } from "@/features/auth/services/session-service";
import { assertSameOriginRequest } from "@/features/auth/services/request-security-service";
import { clearAuthCookies } from "@/features/auth/services/session-cookie-service";
import { jsonOk, routeHandler } from "@/lib/api/api-response";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return routeHandler(async () => {
    await assertSameOriginRequest(request);

    const cookieStore = await cookies();
    const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE_NAME)?.value;
    const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE_NAME)?.value;
    const response = jsonOk({ message: "Logout successful" });

    await logoutSession(accessToken);
    await revokeRefreshTokenSession(refreshToken);
    clearAuthCookies(response);

    return response;
  });
}
