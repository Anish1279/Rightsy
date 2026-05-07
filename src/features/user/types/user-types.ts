import type { Prisma } from "@prisma/client";

export const publicUserSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  emailVerifiedAt: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

export const authUserSelect = {
  id: true,
  email: true,
  name: true,
  passwordHash: true,
  role: true,
  emailVerifiedAt: true,
  failedLoginCount: true,
  lockedUntil: true,
  passwordChangedAt: true,
} satisfies Prisma.UserSelect;

export type PublicUserDto = Prisma.UserGetPayload<{
  select: typeof publicUserSelect;
}>;

export type AuthUserRecord = Prisma.UserGetPayload<{
  select: typeof authUserSelect;
}>;
