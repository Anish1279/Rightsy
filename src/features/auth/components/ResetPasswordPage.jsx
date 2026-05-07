"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, Eye, EyeOff, Sparkles } from "lucide-react";
import { resetPasswordSchema } from "@/features/auth/schemas/auth-schemas";
import { resetPasswordRequest } from "@/features/auth/services/auth-api-client";
import {
  getPasswordStrength,
  PASSWORD_STRENGTH_COLORS,
  PASSWORD_STRENGTH_LABELS,
} from "@/features/auth/utils/password-strength";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const token = searchParams.get("token") ?? "";
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
      password: "",
    },
  });
  const [passwordPreview, setPasswordPreview] = useState("");
  const passwordField = register("password");
  const strength = getPasswordStrength(passwordPreview);

  useEffect(() => {
    setValue("token", token);
  }, [setValue, token]);

  async function onSubmit(values) {
    try {
      await resetPasswordRequest(values);
      toast.success("Password reset successful.");
      router.push("/sign-in");
      router.refresh();
    } catch (error) {
      toast.error(error.message);
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0618] px-6 py-10 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md flex-col justify-center">
        <Link href="/sign-in" className="mb-10 inline-flex items-center gap-2 text-sm font-bold text-white/50 hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>

        <div className="mb-8">
          <Link href="/" className="mb-8 inline-flex items-center gap-2 text-3xl font-extrabold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-teal-400">
              <Sparkles className="h-4 w-4" />
            </span>
            Rightsy
          </Link>
          <h1 className="mb-3 text-3xl font-extrabold tracking-tight">Choose a new password</h1>
          <p className="text-sm leading-6 text-white/50">
            Reset links are single-use and expire quickly.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <input type="hidden" {...register("token")} />
          {!token && (
            <p className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm font-semibold text-red-100">
              This reset link is missing its token.
            </p>
          )}

          <div className="space-y-2">
            <label htmlFor="reset-password" className="block text-sm font-semibold text-white/80">
              New password
            </label>
            <div className="relative">
              <input
                id="reset-password"
                type={showPassword ? "text" : "password"}
                placeholder="12+ chars with number and symbol"
                autoComplete="new-password"
                aria-invalid={errors.password ? "true" : "false"}
                {...passwordField}
                onChange={(event) => {
                  passwordField.onChange(event);
                  setPasswordPreview(event.target.value);
                }}
                className="w-full rounded-2xl border border-white/[0.1] bg-white/[0.04] px-5 py-3.5 pr-12 text-sm text-white placeholder:text-white/30 outline-none transition-all focus:border-violet-500/80 focus:bg-white/[0.06] focus:ring-4 focus:ring-violet-500/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-md p-1 text-white/30 transition-colors hover:text-white/60"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs font-semibold text-red-300">{errors.password.message}</p>}
            {passwordPreview && (
              <div className="space-y-2 pl-1 pt-1">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((index) => (
                    <div
                      key={index}
                      className={`h-1.5 flex-1 rounded-full transition-colors ${
                        index < strength ? PASSWORD_STRENGTH_COLORS[strength] : "bg-white/[0.06]"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-white/40">
                  {PASSWORD_STRENGTH_LABELS[strength]}
                </p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !token}
            className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 py-4 text-[15px] font-bold text-white shadow-[0_4px_20px_rgba(124,58,237,0.3)] transition-all hover:from-violet-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Reset password"}
          </button>
        </form>
      </div>
    </main>
  );
}
