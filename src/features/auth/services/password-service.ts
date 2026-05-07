import bcrypt from "bcryptjs";
import { PASSWORD_SALT_ROUNDS } from "@/constants/auth";

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
}

export function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}
