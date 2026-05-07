"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, Mail, Sparkles } from "lucide-react";
import { forgotPasswordSchema } from "@/features/auth/schemas/auth-schemas";
import { forgotPasswordRequest } from "@/features/auth/services/auth-api-client";

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values) {
    try {
      await forgotPasswordRequest(values);
      toast.success("Check your email for the next step.");
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
          <h1 className="mb-3 text-3xl font-extrabold tracking-tight">Reset your password</h1>
          <p className="text-sm leading-6 text-white/50">
            Enter your account email and we will send a time-limited reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div className="space-y-2">
            <label htmlFor="forgot-email" className="block text-sm font-semibold text-white/80">
              Email address
            </label>
            <div className="relative">
              <input
                id="forgot-email"
                type="email"
                placeholder="your.email@example.com"
                autoComplete="email"
                aria-invalid={errors.email ? "true" : "false"}
                {...register("email")}
                className="w-full rounded-2xl border border-white/[0.1] bg-white/[0.04] px-5 py-3.5 pr-12 text-sm text-white placeholder:text-white/30 outline-none transition-all focus:border-violet-500/80 focus:bg-white/[0.06] focus:ring-4 focus:ring-violet-500/20"
              />
              <Mail className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            </div>
            {errors.email && <p className="text-xs font-semibold text-red-300">{errors.email.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 py-4 text-[15px] font-bold text-white shadow-[0_4px_20px_rgba(124,58,237,0.3)] transition-all hover:from-violet-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Sending..." : "Send reset link"}
          </button>
        </form>

        {isSubmitSuccessful && (
          <p className="mt-6 rounded-2xl border border-teal-400/20 bg-teal-400/10 px-4 py-3 text-sm font-semibold text-teal-100">
            If that email is registered, a reset link is on its way.
          </p>
        )}
      </div>
    </main>
  );
}
