import { z } from "zod";

const strongPassword = z
  .string()
  .min(12, "Password must be at least 12 characters long")
  .max(128, "Password must be at most 128 characters long")
  .regex(/[a-z]/, "Password must include a lowercase letter")
  .regex(/[A-Z]/, "Password must include an uppercase letter")
  .regex(/[0-9]/, "Password must include a number")
  .regex(/[^A-Za-z0-9]/, "Password must include a symbol");

export const emailSchema = z.string().trim().toLowerCase().email("Invalid email address");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required").max(128, "Password is too long"),
});

export const signupSchema = z.object({
  email: emailSchema,
  name: z.string().trim().min(1, "Name is required").max(80, "Name is too long"),
  password: strongPassword,
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(32, "Reset token is invalid"),
  password: strongPassword,
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80, "Name is too long"),
});

export const registerSchema = signupSchema;

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type RegisterInput = SignupInput;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
