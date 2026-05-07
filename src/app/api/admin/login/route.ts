import { adminLoginSchema } from "@/features/admin/schemas/admin-auth-schemas";
import { loginAdmin } from "@/features/admin/services/admin-auth-service";
import { setAdminCookie } from "@/features/admin/services/admin-cookie-service";
import { assertSameOriginRequest } from "@/features/auth/services/request-security-service";
import { jsonOk, routeHandler } from "@/lib/api/api-response";
import { validateJson } from "@/lib/api/validate-request";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return routeHandler(async () => {
    await assertSameOriginRequest(request);
    const input = await validateJson(request, adminLoginSchema);
    const token = await loginAdmin(input);
    const response = jsonOk({ message: "Admin login successful" });

    setAdminCookie(response, token);

    return response;
  });
}
