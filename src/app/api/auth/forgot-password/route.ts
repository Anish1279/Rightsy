import { forgotPasswordSchema } from "@/features/auth/schemas/auth-schemas";
import { requestPasswordReset } from "@/features/auth/services/auth-service";
import { assertRateLimit } from "@/features/auth/services/rate-limit-service";
import { getRequestMetadata, assertSameOriginRequest } from "@/features/auth/services/request-security-service";
import { jsonOk, routeHandler } from "@/lib/api/api-response";
import { validateJson } from "@/lib/api/validate-request";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return routeHandler(async () => {
    await assertSameOriginRequest(request);
    const metadata = await getRequestMetadata();
    const input = await validateJson(request, forgotPasswordSchema);

    assertRateLimit("passwordReset", `${metadata.ipAddress ?? "unknown"}:${input.email}`);
    await requestPasswordReset(input, metadata);

    return jsonOk({
      message: "If an account exists for that email, a reset link will be sent.",
    });
  });
}
