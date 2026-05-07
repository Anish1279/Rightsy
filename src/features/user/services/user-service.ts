import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { AppError } from "@/lib/errors/app-error";
import { authUserSelect, publicUserSelect, type AuthUserRecord, type PublicUserDto } from "@/features/user/types/user-types";

type CreateUserInput = {
  email: string;
  name: string;
  passwordHash: string;
};

export async function findAuthUserByEmail(email: string): Promise<AuthUserRecord | null> {
  return prisma.user.findUnique({
    where: { email },
    select: authUserSelect,
  });
}

export async function createUser(input: CreateUserInput): Promise<PublicUserDto> {
  try {
    return await prisma.$transaction(async (tx) => {
      const existingUser = await tx.user.findUnique({
        where: { email: input.email },
        select: { id: true },
      });

      if (existingUser) {
        throw new AppError("User with this email already exists", "CONFLICT", 409);
      }

      return tx.user.create({
        data: {
          email: input.email,
          name: input.name,
          passwordHash: input.passwordHash,
          passwordChangedAt: new Date(),
        },
        select: publicUserSelect,
      });
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new AppError("User with this email already exists", "CONFLICT", 409);
    }

    throw error;
  }
}

export async function resetFailedLoginState(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      failedLoginCount: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
    },
  });
}

export async function recordFailedLogin(userId: string): Promise<void> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      failedLoginCount: { increment: 1 },
    },
    select: { failedLoginCount: true },
  });

  if (user.failedLoginCount >= 10) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        lockedUntil: new Date(Date.now() + 15 * 60 * 1000),
      },
    });
  }
}

export async function updateUserPassword(userId: string, passwordHash: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash,
      passwordChangedAt: new Date(),
      failedLoginCount: 0,
      lockedUntil: null,
    },
  });
}
