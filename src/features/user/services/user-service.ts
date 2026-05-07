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
          password: input.passwordHash,
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
