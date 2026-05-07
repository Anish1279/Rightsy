import type { Prisma } from "@prisma/client";

export const publicUserSelect = {
  id: true,
  email: true,
  name: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

export const authUserSelect = {
  id: true,
  email: true,
  name: true,
  password: true,
} satisfies Prisma.UserSelect;

export type PublicUserDto = Prisma.UserGetPayload<{
  select: typeof publicUserSelect;
}>;

export type AuthUserRecord = Prisma.UserGetPayload<{
  select: typeof authUserSelect;
}>;
