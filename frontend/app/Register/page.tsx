"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

type RegisterResponse = {
  id: number;
  email: string;
  role: string;
  createdAt: string;
};

export default function RegisterPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await api<RegisterResponse>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          role: "STUDENT",
        }),
      });

      router.push("/login");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f3ee] px-6 py-10">
      <div className="w-full max-w-md">

        {/* Logo */}
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
            Create your account
          </h1>

          <p className="mt-2 text-sm text-[#666666]">
            Join NEXORA as a student
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-xl bg-white p-7 shadow-sm ring-1 ring-[#dedbd5]"
        >
          <div className="space-y-5">

            {/* First + Last Name */}
            <div className="grid grid-cols-2 gap-4">

              <div>
                <label
                  htmlFor="firstName"
                  className="mb-2 block text-sm font-medium"
                >
                  First name
                </label>

                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  placeholder="John"
                  required
                  className="h-11 w-full rounded-lg border border-[#d5d2cc] bg-white px-3 text-sm outline-none transition focus:border-[#111111] focus:ring-1 focus:ring-[#111111]"
                />
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="mb-2 block text-sm font-medium"
                >
                  Last name
                </label>

                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  placeholder="Doe"
                  required
                  className="h-11 w-full rounded-lg border border-[#d5d2cc] bg-white px-3 text-sm outline-none transition focus:border-[#111111] focus:ring-1 focus:ring-[#111111]"
                />
              </div>

            </div>

            {/* Email */}
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

            {/* Password */}
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
                placeholder="Create a password"
                required
                minLength={6}
                className="h-11 w-full rounded-lg border border-[#d5d2cc] bg-white px-3 text-sm outline-none transition focus:border-[#111111] focus:ring-1 focus:ring-[#111111]"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium"
              >
                Confirm password
              </label>

              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                placeholder="Repeat your password"
                required
                minLength={6}
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
            {loading ? "Creating account..." : "Create account"}
          </button>

          <p className="mt-6 text-center text-sm text-[#666666]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-[#111111] underline underline-offset-4"
            >
              Sign in
            </Link>
          </p>
        </form>

      </div>
    </main>
  );
}