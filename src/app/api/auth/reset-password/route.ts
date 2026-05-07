import { resetPasswordSchema } from "@/features/auth/schemas/auth-schemas";
import { resetPassword } from "@/features/auth/services/auth-service";
import { getRequestMetadata, assertSameOriginRequest } from "@/features/auth/services/request-security-service";
import { clearAuthCookies } from "@/features/auth/services/session-cookie-service";
import { jsonOk, routeHandler } from "@/lib/api/api-response";
import { validateJson } from "@/lib/api/validate-request";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return routeHandler(async () => {
    await assertSameOriginRequest(request);
    const metadata = await getRequestMetadata();
    const input = await validateJson(request, resetPasswordSchema);
    const response = jsonOk({ message: "Password reset successful" });

    await resetPassword(input, metadata);
    clearAuthCookies(response);

    return response;
  });
}
