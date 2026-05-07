import { registerSchema } from "@/features/auth/schemas/auth-schemas";
import { registerUser } from "@/features/auth/services/auth-service";
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
    const input = await validateJson(request, registerSchema);

    assertRateLimit("signup", `${metadata.ipAddress ?? "unknown"}:${input.email}`);

    const result = await registerUser(input, metadata);
    const response = jsonOk(
      {
        message: "Registration successful",
        user: result.user,
      },
      { status: 201 }
    );

    setAuthCookies(response, result.accessToken, result.refreshToken);

    return response;
  });
}
