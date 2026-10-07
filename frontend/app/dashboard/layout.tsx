"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    GraduationCap,
    BookOpen,
    ClipboardList,
    User,
    LogOut,
} from "lucide-react";

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

        return `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium tracking-[-0.005em] transition-colors
            ${
                active
                    ? "bg-gradient-to-r from-[#2563EB]/20 to-transparent text-white before:absolute before:bottom-2 before:left-0 before:top-2 before:w-[3px] before:rounded-full before:bg-[#3B82F6]"
                    : "text-[#A8B3C7] hover:bg-[#1A2436] hover:text-white"
            }`;
    }

    function iconClass(path: string) {
        const active = pathname === path;

        return `h-[18px] w-[18px] shrink-0 ${
            active
                ? "text-[#60A5FA]"
                : "text-[#64748B] group-hover:text-[#CBD5E1]"
        }`;
    }

    const isStudent = role === "STUDENT";
    const isAdmin = role === "ADMIN";
    const isTeacher = role === "TEACHER";

    const roleLabel = role
        ? role.charAt(0) + role.slice(1).toLowerCase()
        : "—";

    const portalLabel = isStudent
        ? "Student Portal"
        : isAdmin
        ? "Admin Console"
        : isTeacher
        ? "Teacher Portal"
        : "Student Management";

    return (
        <main className="min-h-screen bg-[#F4F5F7] text-[#111827] antialiased">
            <div className="flex min-h-screen w-full">

                {/* Sidebar */}
                <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-[#1E293B] bg-[#0F172A] p-4 md:flex">

                    {/* Brand */}
                    <div className="mb-6 flex items-center gap-3 border-b border-[#1E293B] px-2 pb-5 pt-1">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2563EB] text-sm font-bold text-white">
                            N
                        </div>

                        <div>
                            <h1 className="text-[15px] font-semibold tracking-[0.08em] text-white">
                                NEXORA
                            </h1>

                            <p className="mt-0.5 text-xs text-[#7F8CA3]">
                                {portalLabel}
                            </p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-0.5 overflow-y-auto pr-1">

                        <SectionLabel first>Main</SectionLabel>

                        {/* Dashboard */}
                        <Link
                            href="/dashboard"
                            className={navClass("/dashboard")}
                        >
                            <LayoutDashboard
                                className={iconClass("/dashboard")}
                            />
                            Dashboard
                        </Link>

                        {/* =========================
                            ADMIN / TEACHER
                        ========================= */}

                        {!isStudent && (
                            <>
                                <SectionLabel>Manage</SectionLabel>

                                {/* ADMIN ONLY */}
                                {isAdmin && (
                                    <Link
                                        href="/dashboard/people"
                                        className={navClass("/dashboard/people")}
                                    >
                                        <Users
                                            className={iconClass(
                                                "/dashboard/people"
                                            )}
                                        />
                                        People
                                    </Link>
                                )}

                                {/* STUDENTS — TEACHER ONLY */}
                                {isTeacher && (
                                    <Link
                                        href="/dashboard/students"
                                        className={navClass(
                                            "/dashboard/students"
                                        )}
                                    >
                                        <GraduationCap
                                            className={iconClass(
                                                "/dashboard/students"
                                            )}
                                        />
                                        Students
                                    </Link>
                                )}

                                {/* COURSES */}
                                {(isAdmin || isTeacher) && (
                                    <Link
                                        href="/dashboard/courses"
                                        className={navClass(
                                            "/dashboard/courses"
                                        )}
                                    >
                                        <BookOpen
                                            className={iconClass(
                                                "/dashboard/courses"
                                            )}
                                        />
                                        Courses
                                    </Link>
                                )}

                                {/* ENROLLMENTS */}
                                <Link
                                    href="/dashboard/enrollments"
                                    className={navClass(
                                        "/dashboard/enrollments"
                                    )}
                                >
                                    <ClipboardList
                                        className={iconClass(
                                            "/dashboard/enrollments"
                                        )}
                                    />
                                    Enrollments
                                </Link>
                            </>
                        )}

                        {/* =========================
                            STUDENT
                        ========================= */}

                        {isStudent && (
                            <>
                                <SectionLabel>My learning</SectionLabel>

                                <Link
                                    href="/dashboard/profile"
                                    className={navClass("/dashboard/profile")}
                                >
                                    <User
                                        className={iconClass(
                                            "/dashboard/profile"
                                        )}
                                    />
                                    My Profile
                                </Link>

                                <Link
                                    href="/dashboard/courses"
                                    className={navClass("/dashboard/courses")}
                                >
                                    <BookOpen
                                        className={iconClass(
                                            "/dashboard/courses"
                                        )}
                                    />
                                    My Courses
                                </Link>

                                <Link
                                    href="/dashboard/enrollments"
                                    className={navClass(
                                        "/dashboard/enrollments"
                                    )}
                                >
                                    <ClipboardList
                                        className={iconClass(
                                            "/dashboard/enrollments"
                                        )}
                                    />
                                    My Enrollments
                                </Link>
                            </>
                        )}

                    </nav>

                    {/* Bottom */}
                    <div className="mt-4 space-y-2 border-t border-[#1E293B] pt-4">

                        <div className="flex items-center gap-3 rounded-lg bg-[#131C2E] px-3 py-2.5">
                            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563EB]/20 text-xs font-bold text-[#60A5FA]">
                                {role.charAt(0)}
                                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#131C2E] bg-[#22C55E]" />
                            </div>

                            <div className="min-w-0">
                                <p className="text-[11px] text-[#7F8CA3]">
                                    Signed in as
                                </p>

                                <p className="truncate text-[13px] font-semibold text-white">
                                    {roleLabel}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium text-[#A8B3C7] transition-colors hover:bg-[#2A1A1F] hover:text-[#F87171]"
                        >
                            <LogOut className="h-[18px] w-[18px] text-[#64748B] group-hover:text-[#F87171]" />
                            Log out
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

function SectionLabel({
    children,
    first = false,
}: {
    children: React.ReactNode;
    first?: boolean;
}) {
    return (
        <div
            className={`flex items-center gap-3 px-3 pb-2 ${
                first ? "" : "pt-6"
            }`}
        >
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#64748B]">
                {children}
            </span>
            <span className="h-px flex-1 bg-gradient-to-r from-[#1E293B] to-transparent" />
        </div>
    );
}