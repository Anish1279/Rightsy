import { AppError } from "@/lib/errors/app-error";
import { createUser, findAuthUserByEmail } from "@/features/user/services/user-service";
import { hashPassword, verifyPassword } from "@/features/auth/services/password-service";
import { signAuthToken, verifyAuthToken } from "@/features/auth/services/token-service";
import type { AuthResultDto, RegistrationResultDto } from "@/features/auth/types/auth-types";
import type { LoginInput, RegisterInput } from "@/features/auth/schemas/auth-schemas";

export async function registerUser(input: RegisterInput): Promise<RegistrationResultDto> {
  const passwordHash = await hashPassword(input.password);
  const user = await createUser({
    email: input.email,
    name: input.name,
    passwordHash,
  });

  return { user };
}

export async function loginUser(input: LoginInput): Promise<AuthResultDto> {
  const user = await findAuthUserByEmail(input.email);

  if (!user) {
    throw new AppError("Invalid credentials", "INVALID_CREDENTIALS", 401);
  }

  const passwordValid = await verifyPassword(input.password, user.password);

  if (!passwordValid) {
    throw new AppError("Invalid credentials", "INVALID_CREDENTIALS", 401);
  }

  const sessionUser = {
    id: user.id,
    email: user.email,
    name: user.name,
  };

  return {
    token: await signAuthToken(sessionUser),
    user: sessionUser,
  };
}

export async function getSessionUser(token?: string) {
  if (!token) {
    throw new AppError("Unauthorized", "UNAUTHORIZED", 401);
  }

  const payload = await verifyAuthToken(token);

  if (!payload) {
    throw new AppError("Invalid token", "UNAUTHORIZED", 401);
  }

  return {
    id: payload.id,
    email: payload.email,
    name: payload.name,
  };
}
