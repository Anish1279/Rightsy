import type { PublicUserDto } from "@/features/user/types/user-types";

export type SessionUserDto = {
  id: string;
  email: string;
  name: string | null;
};

export type AuthResultDto = {
  token: string;
  user: SessionUserDto;
};

export type RegistrationResultDto = {
  user: PublicUserDto;
};

export type AuthTokenPayload = SessionUserDto & {
  iat?: number;
  exp?: number;
};
