"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();

    const [role, setRole] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            router.push("/login");
            return;
        }

        setRole(localStorage.getItem("role") ?? "");
    }, [router]);

    function handleLogout() {
        localStorage.removeItem("token");
        localStorage.removeItem("email");
        localStorage.removeItem("role");

        router.push("/login");
    }

    function navClass(path: string) {
        const active = pathname === path;

        return `
            block rounded-xl px-4 py-3 text-sm font-medium transition-all
            ${
                active
                    ? "bg-[#2563EB] text-white shadow-[0_4px_12px_rgba(37,99,235,0.25)]"
                    : "text-[#AAB4C5] hover:bg-[#1E293B] hover:text-white"
            }
        `;
    }

    const isStudent = role === "STUDENT";
    const isAdmin = role === "ADMIN";
    const isTeacher = role === "TEACHER";

    return (
        <main className="min-h-screen bg-[#F4F5F7] text-[#111827]">
            <div className="flex min-h-screen w-full">

                {/* Sidebar */}
                <aside className="hidden w-60 shrink-0 border-r border-[#1E293B] bg-[#111827] p-4 md:block">

                    {/* Brand */}
                    <div className="mb-10 px-2">
                        <h1 className="text-xl font-semibold tracking-tight text-white">
                            NEXORA
                        </h1>

                        <p className="mt-1 text-xs text-[#7F8CA3]">
                            {isStudent
                                ? "Student Portal"
                                : "Student Management"}
                        </p>
                    </div>

                    {/* Navigation */}
                    <nav className="space-y-1">

                        {/* Dashboard */}
                        <Link
                            href="/dashboard"
                            className={navClass("/dashboard")}
                        >
                            Dashboard
                        </Link>

                        {/* =========================
                            ADMIN / TEACHER
                        ========================= */}

                        {!isStudent && (
                            <>
                                <Link
                                    href="/dashboard/students"
                                    className={navClass("/dashboard/students")}
                                >
                                    Students
                                </Link>

                                {(isAdmin || isTeacher) && (
                                    <Link
                                        href="/dashboard/courses"
                                        className={navClass("/dashboard/courses")}
                                    >
                                        Courses
                                    </Link>
                                )}

                                <Link
                                    href="/dashboard/enrollments"
                                    className={navClass(
                                        "/dashboard/enrollments"
                                    )}
                                >
                                    Enrollments
                                </Link>
                            </>
                        )}

                        {/* =========================
                            STUDENT
                        ========================= */}

                        {isStudent && (
                            <>
                                <Link
                                    href="/dashboard/profile"
                                    className={navClass("/dashboard/profile")}
                                >
                                    My Profile
                                </Link>

                                <Link
                                    href="/dashboard/courses"
                                    className={navClass("/dashboard/courses")}
                                >
                                    My Courses
                                </Link>

                                <Link
                                    href="/dashboard/enrollments"
                                    className={navClass(
                                        "/dashboard/enrollments"
                                    )}
                                >
                                    My Enrollments
                                </Link>
                            </>
                        )}

                    </nav>

                    {/* Bottom */}
                    <div className="mt-10 border-t border-[#263247] pt-5">

                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#AAB4C5] transition hover:bg-[#1E293B] hover:text-white"
                        >
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1E293B] text-xs text-[#CBD5E1]">
                                ↪
                            </span>

                            Logout
                        </button>

                    </div>

                </aside>

                {/* Content */}
                <section className="min-w-0 flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
                    {children}
                </section>

            </div>
        </main>
    );
}