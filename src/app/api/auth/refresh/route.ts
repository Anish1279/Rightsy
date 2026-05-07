import { cookies } from "next/headers";
import { REFRESH_TOKEN_COOKIE_NAME } from "@/constants/auth";
import { refreshAuthSession } from "@/features/auth/services/auth-service";
import { assertRateLimit } from "@/features/auth/services/rate-limit-service";
import { getRequestMetadata, assertSameOriginRequest } from "@/features/auth/services/request-security-service";
import { clearAuthCookies, setAuthCookies } from "@/features/auth/services/session-cookie-service";
import { jsonOk, routeHandler } from "@/lib/api/api-response";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return routeHandler(async () => {
    await assertSameOriginRequest(request);
    const metadata = await getRequestMetadata();

    assertRateLimit("refresh", metadata.ipAddress ?? "unknown");

    const cookieStore = await cookies();
    const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE_NAME)?.value;
    const result = await refreshAuthSession(refreshToken, metadata);
    const response = jsonOk({ message: "Session refreshed", user: result.user });

    setAuthCookies(response, result.accessToken, result.refreshToken);

    return response;
  });
}

export async function DELETE() {
  const response = jsonOk({ message: "Session cleared" });

  clearAuthCookies(response);

  return response;
}
