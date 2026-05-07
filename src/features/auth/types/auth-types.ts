import type { PublicUserDto } from "@/features/user/types/user-types";

export type UserRole = "USER" | "ADMIN";

export type SessionUserDto = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
};

export type AuthResultDto = {
  accessToken: string;
  refreshToken: string;
  user: SessionUserDto;
  sessionId: string;
};

export type RegistrationResultDto = {
  user: PublicUserDto;
};

export type AccessTokenPayload = SessionUserDto & {
  sessionId: string;
  jti: string;
  iat?: number;
  exp?: number;
};

export type AuthTokenPayload = AccessTokenPayload;

export type RequestMetadata = {
  ipAddress?: string;
  userAgent?: string;
};
