import { registerSchema } from "@/features/auth/schemas/auth-schemas";
import { registerUser } from "@/features/auth/services/auth-service";
import { jsonOk, routeHandler } from "@/lib/api/api-response";

export async function POST(request: Request) {
  return routeHandler(async () => {
    const input = registerSchema.parse(await request.json());
    const result = await registerUser(input);

    return jsonOk(
      {
        message: "Registration successful",
        user: result.user,
      },
      { status: 201 }
    );
  });
}
