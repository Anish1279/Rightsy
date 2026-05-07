import { loginSchema } from "@/features/auth/schemas/auth-schemas";
import { loginUser } from "@/features/auth/services/auth-service";
import { setSessionCookie } from "@/features/auth/services/session-cookie-service";
import { jsonOk, routeHandler } from "@/lib/api/api-response";

export async function POST(request: Request) {
  return routeHandler(async () => {
    const input = loginSchema.parse(await request.json());
    const result = await loginUser(input);
    const response = jsonOk({ message: "Login successful", user: result.user });

    setSessionCookie(response, result.token);

    return response;
  });
}
