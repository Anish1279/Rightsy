import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  name: z.string().trim().min(1, "Name is required").max(80, "Name is too long"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
