import { adminLoginSchema } from "@/features/admin/schemas/admin-auth-schemas";
import { loginAdmin } from "@/features/admin/services/admin-auth-service";
import { setAdminCookie } from "@/features/admin/services/admin-cookie-service";
import { jsonOk, routeHandler } from "@/lib/api/api-response";

export async function POST(request: Request) {
  return routeHandler(async () => {
    const input = adminLoginSchema.parse(await request.json());
    const token = await loginAdmin(input);
    const response = jsonOk({ message: "Admin login successful" });

    setAdminCookie(response, token);

    return response;
  });
}
