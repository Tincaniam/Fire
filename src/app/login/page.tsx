"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Flame } from "lucide-react";

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
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-red-600 p-3 rounded-xl mb-3">
            <Flame className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">FireExtenguisher</h1>
          <p className="text-gray-400 text-sm mt-1">Inspection reporting, simplified.</p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5"
        >
          <h2 className="text-lg font-semibold text-white">Sign in</h2>

          {error && (
            <div className="text-sm text-red-400 bg-red-950 border border-red-800 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm text-gray-300">Email</label>
            <input
              type="email"
              autoComplete="email"
              {...register("email")}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="text-xs text-red-400">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm text-gray-300">Password</label>
            <input
              type="password"
              autoComplete="current-password"
              {...register("password")}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-xs text-red-400">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-60 text-white font-semibold rounded-lg py-2 text-sm transition-colors"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
