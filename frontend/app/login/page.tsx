"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

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

    // Redirect already logged-in users
    useEffect(() => {
        const token = localStorage.getItem("token");

        if (token) {
            router.replace("/dashboard");
        }
    }, [router]);

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            const result = await api<LoginResponse>(
                "/api/auth/login",
                {
                    method: "POST",
                    body: JSON.stringify({
                        email,
                        password,
                    }),
                }
            );

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
        <main className="min-h-screen bg-[#F8FAFC]">

            <div className="grid min-h-screen lg:grid-cols-[1fr_0.9fr]">

                {/* ==================================================
                    LEFT BRAND PANEL
                ================================================== */}

                <section className="relative hidden overflow-hidden bg-[#0F172A] lg:flex">

                    <div className="relative z-10 flex w-full flex-col justify-between px-14 py-14 xl:px-16 2xl:px-20">

                        {/* Brand */}

                        <Link
                            href="/"
                            className="inline-flex w-fit items-center gap-3"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2563EB] text-sm font-bold text-white shadow-[0_8px_20px_rgba(37,99,235,0.25)]">
                                N
                            </div>

                            <div>
                                <span className="block text-lg font-bold tracking-[-0.03em] text-white">
                                    NEXORA
                                </span>

                                <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#64748B]">
                                    Student Management
                                </span>
                            </div>
                        </Link>

                        {/* Hero Content */}

                        <div className="ml-auto w-full max-w-[650px] translate-x-4 pr-4 xl:translate-x-8 xl:pr-6 2xl:translate-x-10">

                            {/* Label */}

                            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#334155] bg-[#172033] px-3.5 py-2">

                                <span className="h-1.5 w-1.5 rounded-full bg-[#60A5FA]" />

                                <span className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#BFDBFE]">
                                    Academic Management Platform
                                </span>

                            </div>

                            {/* Hero Heading */}

                            <h2 className="text-[68px] font-bold leading-[0.94] tracking-[-0.035em] text-white xl:text-[84px] 2xl:text-[94px]">
                                Everything your
                                <br />

                                <span className="text-[#3B82F6]">
                                    institution needs.
                                </span>
                            </h2>

                            {/* Description */}

                            <p className="mt-9 max-w-[560px] text-[16px] leading-7 text-[#94A3B8]">
                                Manage students, courses, departments and
                                enrollments through one secure academic
                                platform.
                            </p>

                            {/* Supporting Message */}

                            <div className="mt-8 border-l-2 border-[#2563EB] pl-5">

                                <p className="text-sm font-semibold text-white">
                                    One workspace for your academic life.
                                </p>

                                <p className="mt-1.5 text-xs leading-5 text-[#64748B]">
                                    Courses, enrollment and student
                                    information, connected in one secure
                                    platform.
                                </p>

                            </div>

                        </div>

                        {/* Footer */}

                        <p className="text-xs text-[#475569]">
                            © {new Date().getFullYear()} NEXORA.
                            Academic management made simpler.
                        </p>

                    </div>

                </section>

                {/* ==================================================
                    RIGHT LOGIN AREA
                ================================================== */}

                <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">

                    <div className="w-full max-w-[430px]">

                        {/* Mobile Brand */}

                        <div className="mb-10 lg:hidden">

                            <Link
                                href="/"
                                className="inline-flex items-center gap-3"
                            >

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2563EB] text-sm font-bold text-white">
                                    N
                                </div>

                                <div>

                                    <span className="block text-lg font-bold tracking-[-0.03em] text-[#0F172A]">
                                        NEXORA
                                    </span>

                                    <span className="block text-[9px] font-semibold uppercase tracking-[0.16em] text-[#94A3B8]">
                                        Student Management
                                    </span>

                                </div>

                            </Link>

                        </div>

                        {/* Heading */}

                        <div className="mb-8">

                            <div className="mb-4 inline-flex rounded-full border border-[#D8E3F8] bg-[#EFF6FF] px-3 py-1.5">

                                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#1D4ED8]">
                                    Welcome back
                                </span>

                            </div>

                            <h1 className="text-[38px] font-bold leading-[1.05] tracking-[-0.035em] text-[#0F172A] sm:text-[42px]">
                                Sign in to NEXORA
                            </h1>

                            <p className="mt-3 text-[15px] leading-6 text-[#64748B]">
                                Access your academic management workspace.
                            </p>

                        </div>

                        {/* Login Card */}

                        <form
                            onSubmit={handleSubmit}
                            className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.05)] sm:p-7"
                        >

                            <div className="space-y-5">

                                {/* Email */}

                                <div>

                                    <label
                                        htmlFor="email"
                                        className="mb-2 block text-sm font-semibold text-[#334155]"
                                    >
                                        Email address{" "}
                                        <span className="text-[#DC2626]">
                                            *
                                        </span>
                                    </label>

                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(event) =>
                                            setEmail(event.target.value)
                                        }
                                        placeholder="you@example.com"
                                        autoComplete="email"
                                        required
                                        className="h-12 w-full rounded-xl border border-[#DCE1E8] bg-white px-4 text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10"
                                    />

                                </div>

                                {/* Password */}

                                <div>

                                    <label
                                        htmlFor="password"
                                        className="mb-2 block text-sm font-semibold text-[#334155]"
                                    >
                                        Password{" "}
                                        <span className="text-[#DC2626]">
                                            *
                                        </span>
                                    </label>

                                    <input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(event) =>
                                            setPassword(event.target.value)
                                        }
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                        required
                                        className="h-12 w-full rounded-xl border border-[#DCE1E8] bg-white px-4 text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10"
                                    />

                                </div>

                            </div>

                            {/* Error */}

                            {error && (
                                <div className="mt-5 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3">

                                    <p className="text-sm font-medium leading-5 text-[#B91C1C]">
                                        {error}
                                    </p>

                                </div>
                            )}

                            {/* Submit */}

                            <button
                                type="submit"
                                disabled={loading}
                                className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-5 text-sm font-semibold text-white shadow-[0_6px_16px_rgba(37,99,235,0.18)] transition hover:bg-[#1D4ED8] hover:shadow-[0_8px_20px_rgba(37,99,235,0.22)] disabled:cursor-not-allowed disabled:opacity-60"
                            >

                                {loading ? (
                                    <>
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        Sign in
                                        <ArrowRight className="h-4 w-4" />
                                    </>
                                )}

                            </button>

                            {/* Register */}

                            <div className="mt-6 border-t border-[#EEF1F5] pt-6 text-center">

                                <p className="text-sm text-[#64748B]">

                                    Don't have an account?{" "}

                                    <Link
                                        href="/register"
                                        className="font-semibold text-[#2563EB] transition hover:text-[#1D4ED8]"
                                    >
                                        Create an account
                                    </Link>

                                </p>

                            </div>

                        </form>

                        {/* Bottom Text */}

                        <p className="mt-6 text-center text-xs text-[#94A3B8]">
                            Secure access for NEXORA users
                        </p>

                    </div>

                </section>

            </div>

        </main>
    );
}