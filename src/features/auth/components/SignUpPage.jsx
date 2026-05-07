"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff, Shield, Sparkles, Gamepad2, Lock } from "lucide-react";
import { signupSchema } from "@/features/auth/schemas/auth-schemas";
import { signupRequest } from "@/features/auth/services/auth-api-client";
import {
  getPasswordStrength,
  PASSWORD_STRENGTH_COLORS,
  PASSWORD_STRENGTH_LABELS,
} from "@/features/auth/utils/password-strength";

/**
 * SignUpPage — Premium, child-friendly registration flow.
 */
export default function SignUpPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });
  const [passwordPreview, setPasswordPreview] = useState("");

  const passwordField = register("password");
  const strength = getPasswordStrength(passwordPreview);

  async function onSubmit(values) {
    try {
      await signupRequest(values);
      toast.success("Account created!");
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      toast.error(error.message);
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#0a0618] overflow-hidden">
      {/* Left Panel — Trust signals */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12 lg:p-16 border-r border-white/[0.05]">
        {/* Immersive Dark Mesh Background */}
        <div className="absolute inset-0 bg-[#0a0618]" />
        <div className="absolute top-0 right-0 w-[80%] h-[80%] bg-[radial-gradient(ellipse_at_100%_0%,_rgba(124,58,237,0.3)_0%,_transparent_60%)]" />
        <div className="absolute bottom-0 left-0 w-[60%] h-[60%] bg-[radial-gradient(ellipse_at_0%_100%,_rgba(245,158,11,0.1)_0%,_transparent_60%)]" />
        
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-[10%] left-[10%] w-32 h-32 rounded-full bg-white/[0.03] animate-float-slow blur-xl" />
          <div className="absolute bottom-[20%] right-[15%] w-24 h-24 rounded-full bg-white/[0.02] animate-float-medium blur-lg" />
          <div className="absolute top-[60%] left-[60%] w-16 h-16 rounded-full bg-amber-500/[0.05] animate-float-fast blur-[2px]" />
        </div>

        <div className="relative z-10">
          <Link href="/" className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-teal-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            Rightsy
          </Link>
          <p className="text-white/50 text-sm mt-3 ml-1 font-medium">Learn your rights through play</p>
        </div>

        <div className="relative z-10 space-y-6 max-w-md">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white leading-[1.15] drop-shadow-sm">
            Join thousands of kids learning about their rights! 🌟
          </h2>

          <div className="space-y-4 pt-2">
            {[
              { icon: Gamepad2, text: "Fun games & quizzes", color: "text-violet-400" },
              { icon: Shield, text: "Safe & kid-friendly", color: "text-teal-400" },
              { icon: Sparkles, text: "Earn points & rewards", color: "text-amber-400" },
            ].map(({ icon: Icon, text, color }) => (
              <div key={text} className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.08] group-hover:bg-white/[0.06] flex items-center justify-center transition-colors">
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <span className="text-white/80 font-medium text-[15px]">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-white/30 text-xs font-medium">
            &copy; {new Date().getFullYear()} Rightsy. Safe for kids.
          </p>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-12 relative">
        {/* Subtle subtle glow behind form */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(ellipse_at_center,_rgba(124,58,237,0.06)_0%,_transparent_70%)] pointer-events-none" />

        <div className="w-full max-w-sm relative z-10">
          {/* Mobile brand */}
          <div className="lg:hidden mb-6 block text-center">
            <Link
              href="/"
              className="text-3xl font-extrabold text-gradient-brand inline-flex items-center gap-2 justify-center"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-teal-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              Rightsy
            </Link>
          </div>

          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-3xl md:text-3xl font-extrabold text-white mb-2 tracking-tight">
              Create account ✨
            </h1>
            <p className="text-white/50 text-[15px]">
              Join the adventure — it only takes a minute!
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Name */}
            <div className="space-y-2">
              <label
                htmlFor="signup-name"
                className="block text-sm font-semibold text-white/80"
              >
                Your name
              </label>
              <input
                id="signup-name"
                type="text"
                placeholder="What should we call you?"
                autoComplete="name"
                aria-invalid={errors.name ? "true" : "false"}
                {...register("name")}
                className="w-full rounded-2xl border border-white/[0.1] bg-white/[0.04] px-5 py-3.5 text-sm text-white placeholder:text-white/30 focus:bg-white/[0.06] focus:border-violet-500/80 focus:ring-4 focus:ring-violet-500/20 transition-all outline-none backdrop-blur-md"
              />
              {errors.name && <p className="text-xs font-semibold text-red-300">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor="signup-email"
                className="block text-sm font-semibold text-white/80"
              >
                Email address
              </label>
              <input
                id="signup-email"
                type="email"
                placeholder="your.email@example.com"
                autoComplete="email"
                aria-invalid={errors.email ? "true" : "false"}
                {...register("email")}
                className="w-full rounded-2xl border border-white/[0.1] bg-white/[0.04] px-5 py-3.5 text-sm text-white placeholder:text-white/30 focus:bg-white/[0.06] focus:border-violet-500/80 focus:ring-4 focus:ring-violet-500/20 transition-all outline-none backdrop-blur-md"
              />
              {errors.email && <p className="text-xs font-semibold text-red-300">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label
                htmlFor="signup-password"
                className="block text-sm font-semibold text-white/80"
              >
                Create a password
              </label>
              <div className="relative">
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="12+ chars with number and symbol"
                  autoComplete="new-password"
                  aria-invalid={errors.password ? "true" : "false"}
                  {...passwordField}
                  onChange={(event) => {
                    passwordField.onChange(event);
                    setPasswordPreview(event.target.value);
                  }}
                  className="w-full rounded-2xl border border-white/[0.1] bg-white/[0.04] px-5 py-3.5 pr-12 text-sm text-white placeholder:text-white/30 focus:bg-white/[0.06] focus:border-violet-500/80 focus:ring-4 focus:ring-violet-500/20 transition-all outline-none backdrop-blur-md"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs font-semibold text-red-300">{errors.password.message}</p>}

              {/* Strength indicator */}
              {passwordPreview && (
                <div className="mt-3 space-y-2 pl-1">
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${
                          i < strength ? PASSWORD_STRENGTH_COLORS[strength] : "bg-white/[0.06]"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[11px] font-medium text-white/40 uppercase tracking-wider">
                    {PASSWORD_STRENGTH_LABELS[strength]}
                  </p>
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold py-4 rounded-2xl shadow-[0_4px_20px_rgba(124,58,237,0.3)] hover:shadow-[0_8px_30px_rgba(124,58,237,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-[15px]"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Trust badges */}
          <div className="mt-6 flex items-center justify-center gap-5 flex-wrap">
            {[
              { icon: Shield, label: "Safe for kids" },
              { icon: Lock, label: "Encrypted" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 text-[13px] font-medium text-white/30"
              >
                <Icon className="w-4 h-4 text-white/20" />
                <span>{label}</span>
              </div>
            ))}
          </div>

          {/* Sign in link */}
          <p className="mt-6 text-center text-[15px] text-white/50">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="font-bold text-violet-400 hover:text-violet-300 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
