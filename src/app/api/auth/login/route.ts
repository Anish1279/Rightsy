import { loginSchema } from "@/features/auth/schemas/auth-schemas";
import { loginUser } from "@/features/auth/services/auth-service";
import { assertRateLimit } from "@/features/auth/services/rate-limit-service";
import { getRequestMetadata, assertSameOriginRequest } from "@/features/auth/services/request-security-service";
import { setAuthCookies } from "@/features/auth/services/session-cookie-service";
import { jsonOk, routeHandler } from "@/lib/api/api-response";
import { validateJson } from "@/lib/api/validate-request";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return routeHandler(async () => {
    await assertSameOriginRequest(request);
    const metadata = await getRequestMetadata();
    const input = await validateJson(request, loginSchema);

    assertRateLimit("login", `${metadata.ipAddress ?? "unknown"}:${input.email}`);

    const result = await loginUser(input, metadata);
    const response = jsonOk({ message: "Login successful", user: result.user });

    setAuthCookies(response, result.accessToken, result.refreshToken);

    return response;
  });
}
