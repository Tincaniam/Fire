"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import RavenIcon from "@/components/RavenIcon";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password required"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password.");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background:
          "radial-gradient(ellipse 90% 65% at 50% -10%, rgba(94,129,172,0.18) 0%, transparent 60%), #1e2430",
      }}
    >
      <div className="w-full max-w-[360px]">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-red-500 rounded-2xl blur-xl opacity-25" />
            <div className="relative bg-red-600 p-3.5 rounded-2xl shadow-lg shadow-red-900/30">
              <RavenIcon className="w-7 h-7 text-white" />
            </div>
          </div>
          <h1 className="text-[22px] font-bold text-white tracking-tight">
            RavenLedger
          </h1>
          <p className="text-gray-500 text-[13px] mt-1">
            Compliance reporting, simplified.
          </p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-7 space-y-5 shadow-2xl"
        >
          <div>
            <h2 className="text-[17px] font-semibold text-white">Sign in</h2>
            <p className="text-[12.5px] text-gray-500 mt-0.5">
              Access your inspection dashboard
            </p>
          </div>

          {error && (
            <div className="text-[12.5px] text-red-400 bg-red-950/40 border border-red-800/40 rounded-xl px-3.5 py-2.5">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-gray-400">
                Email address
              </label>
              <input
                type="email"
                autoComplete="email"
                {...register("email")}
                className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl px-3.5 py-2.5 text-white placeholder-gray-600 text-[13.5px] focus:outline-none focus:ring-2 focus:ring-red-600/50 focus:border-red-600/30 transition-all"
                placeholder="you@company.com"
              />
              {errors.email && (
                <p className="text-[11.5px] text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-gray-400">
                Password
              </label>
              <input
                type="password"
                autoComplete="current-password"
                {...register("password")}
                className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl px-3.5 py-2.5 text-white placeholder-gray-600 text-[13.5px] focus:outline-none focus:ring-2 focus:ring-red-600/50 focus:border-red-600/30 transition-all"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-[11.5px] text-red-400">{errors.password.message}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-2.5 text-[13.5px] transition-all shadow-[0_1px_12px_rgba(94,129,172,0.25)] hover:shadow-[0_1px_20px_rgba(94,129,172,0.35)] mt-1"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="text-center text-[11px] text-gray-700 mt-6">
          © {new Date().getFullYear()} RavenLedger · All rights reserved
        </p>
      </div>
    </div>
  );
}

