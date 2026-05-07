import { z } from "zod";
import { verifyEmailToken } from "@/features/auth/services/auth-service";
import { getRequestMetadata, assertSameOriginRequest } from "@/features/auth/services/request-security-service";
import { jsonOk, routeHandler } from "@/lib/api/api-response";
import { validateJson } from "@/lib/api/validate-request";

const verifyEmailSchema = z.object({
  token: z.string().min(32, "Verification token is invalid"),
});

export const runtime = "nodejs";

export async function POST(request: Request) {
  return routeHandler(async () => {
    await assertSameOriginRequest(request);
    const metadata = await getRequestMetadata();
    const input = await validateJson(request, verifyEmailSchema);

    await verifyEmailToken(input.token, metadata);

    return jsonOk({ message: "Email verified" });
  });
}
