"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

type LoginResponse = {
  token: string;
  email: string;
  role: string;
};

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect already logged-in users to dashboard
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      router.replace("/dashboard");
    }
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const result = await api<LoginResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      localStorage.setItem("token", result.token);
      localStorage.setItem("email", result.email);
      localStorage.setItem("role", result.role);

      router.push("/dashboard");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f3ee] px-6">
      <div className="w-full max-w-md">

        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#111111] text-sm font-semibold text-white">
              N
            </div>

            <span className="text-lg font-semibold tracking-[-0.03em]">
              NEXORA
            </span>
          </Link>

          <h1 className="mt-8 text-3xl font-semibold tracking-[-0.04em]">
            Welcome back
          </h1>

          <p className="mt-2 text-sm text-[#666666]">
            Sign in to your NEXORA account
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl bg-white p-7 shadow-sm ring-1 ring-[#dedbd5]"
        >
          <div className="space-y-5">

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
                className="h-11 w-full rounded-lg border border-[#d5d2cc] bg-white px-3 text-sm outline-none transition focus:border-[#111111] focus:ring-1 focus:ring-[#111111]"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
                className="h-11 w-full rounded-lg border border-[#d5d2cc] bg-white px-3 text-sm outline-none transition focus:border-[#111111] focus:ring-1 focus:ring-[#111111]"
              />
            </div>

          </div>

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 h-11 w-full rounded-lg bg-[#111111] text-sm font-medium text-white transition hover:bg-[#292929] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <p className="mt-6 text-center text-sm text-[#666666]">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-[#111111] underline underline-offset-4"
            >
              Create one
            </Link>
          </p>
        </form>

      </div>
    </main>
  );
}