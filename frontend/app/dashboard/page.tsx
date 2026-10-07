"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { Student, Course, Enrollment } from "@/lib/types";

type User = {
    id: number;
    email: string;
    role: string;
    createdAt: string;
};

type MonthlyData = {
    month: string;
    count: number;
};

export default function DashboardPage() {
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("");

    const [users, setUsers] = useState<User[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedEmail = localStorage.getItem("email") ?? "";
        const storedRole = localStorage.getItem("role") ?? "";

        setEmail(storedEmail);
        setRole(storedRole);

        async function loadDashboard() {
            try {
                /*
                 * ADMIN DASHBOARD
                 * Admin is allowed to access /api/users.
                 */
                if (storedRole === "ADMIN") {
                    const [
                        usersData,
                        studentsData,
                        coursesData,
                        enrollmentsData,
                    ] = await Promise.all([
                        api<User[]>("/api/users"),
                        api<Student[]>("/api/students"),
                        api<Course[]>("/api/courses"),
                        api<Enrollment[]>("/api/enrollments"),
                    ]);

                    setUsers(usersData);
                    setStudents(studentsData);
                    setCourses(coursesData);
                    setEnrollments(enrollmentsData);
                }

                /*
                 * STUDENT DASHBOARD
                 * Students do NOT request /api/users.
                 *
                 * For now we only load courses and enrollments.
                 * Student-specific filtering will be implemented
                 * when we build the student pages.
                 */
                if (storedRole === "STUDENT") {
                    const [coursesData, enrollmentsData] = await Promise.all([
                        api<Course[]>("/api/courses"),
                        api<Enrollment[]>("/api/enrollments"),
                    ]);

                    setCourses(coursesData);
                    setEnrollments(enrollmentsData);
                }

                /*
                 * TEACHER
                 * Keep the same dashboard data structure for now.
                 */
                if (storedRole === "TEACHER") {
                    const [
                        studentsData,
                        coursesData,
                        enrollmentsData,
                    ] = await Promise.all([
                        api<Student[]>("/api/students"),
                        api<Course[]>("/api/courses"),
                        api<Enrollment[]>("/api/enrollments"),
                    ]);

                    setStudents(studentsData);
                    setCourses(coursesData);
                    setEnrollments(enrollmentsData);
                }
            } catch (error) {
                console.error("Dashboard error:", error);
            } finally {
                setLoading(false);
            }
        }

        loadDashboard();
    }, []);

    /*
     * =========================================================
     * STUDENT DASHBOARD
     * =========================================================
     */

    if (loading) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#DCE1E8] border-t-[#2563EB]" />

                    <p className="text-sm font-medium text-[#64748B]">
                        Loading dashboard...
                    </p>
                </div>
            </div>
        );
    }

    if (role === "STUDENT") {
        return (
            <StudentDashboard
                email={email}
                courses={courses}
                enrollments={enrollments}
            />
        );
    }

    /*
     * =========================================================
     * ADMIN / TEACHER DASHBOARD
     * =========================================================
     */

    return (
        <AdminDashboard
            email={email}
            role={role}
            users={users}
            students={students}
            courses={courses}
            enrollments={enrollments}
        />
    );
}


/* =========================================================
   STUDENT DASHBOARD
========================================================= */

function StudentDashboard({
    email,
    courses,
    enrollments,
}: {
    email: string;
    courses: Course[];
    enrollments: Enrollment[];
}) {
    return (
        <div className="mx-auto w-full max-w-[1600px]">

            {/* Header */}
            <header className="flex flex-col justify-between gap-5 border-b border-[#DCE1E8] pb-6 sm:flex-row sm:items-end">

                <div>
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#D8E3F8] bg-[#EFF6FF] px-3 py-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB]" />

                        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#1D4ED8]">
                            Student Portal
                        </span>
                    </div>

                    <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#111827] sm:text-4xl">
                        Dashboard
                    </h1>

                    <p className="mt-2 text-sm text-[#64748B]">
                        Welcome back, {email}
                    </p>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-[#DCE1E8] bg-white px-4 py-3 shadow-[0_3px_12px_rgba(15,23,42,0.04)]">

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2563EB] text-xs font-bold text-white">
                        S
                    </div>

                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#94A3B8]">
                            Signed in as
                        </p>

                        <p className="mt-0.5 text-sm font-semibold text-[#111827]">
                            STUDENT
                        </p>
                    </div>

                </div>

            </header>


            {/* Main Student Metrics */}
            <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

                <StudentMetricCard
                    label="Available Courses"
                    value={courses.length}
                    description="Courses available in the system"
                    accent="blue"
                    icon="C"
                />

                <StudentMetricCard
                    label="My Enrollments"
                    value={enrollments.length}
                    description="Your enrollment records"
                    accent="teal"
                    icon="E"
                />

                <StudentMetricCard
                    label="Current Role"
                    valueLabel="STUDENT"
                    description="Your account role"
                    accent="coral"
                    icon="S"
                />

            </section>


            {/* Student Actions */}
            <section className="mt-3 grid gap-3 lg:grid-cols-3">

                <Link
                    href="/dashboard/profile"
                    className="group rounded-2xl border border-[#DCE1E8] bg-white p-6 shadow-[0_4px_18px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)]"
                >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EFF6FF] text-sm font-bold text-[#2563EB]">
                        P
                    </div>

                    <h2 className="mt-5 text-base font-semibold text-[#111827]">
                        My Profile
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-[#64748B]">
                        View and manage your student profile.
                    </p>

                    <span className="mt-5 inline-block text-xs font-semibold text-[#2563EB]">
                        View profile →
                    </span>
                </Link>


                <Link
                    href="/dashboard/courses"
                    className="group rounded-2xl border border-[#DCE1E8] bg-white p-6 shadow-[0_4px_18px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)]"
                >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#ECFDF8] text-sm font-bold text-[#0F9D8A]">
                        C
                    </div>

                    <h2 className="mt-5 text-base font-semibold text-[#111827]">
                        My Courses
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-[#64748B]">
                        Browse available courses and manage your courses.
                    </p>

                    <span className="mt-5 inline-block text-xs font-semibold text-[#087F70]">
                        View courses →
                    </span>
                </Link>


                <Link
                    href="/dashboard/enrollments"
                    className="group rounded-2xl border border-[#DCE1E8] bg-white p-6 shadow-[0_4px_18px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)]"
                >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFF1ED] text-sm font-bold text-[#E45D46]">
                        E
                    </div>

                    <h2 className="mt-5 text-base font-semibold text-[#111827]">
                        My Enrollments
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-[#64748B]">
                        View your course enrollments and grades.
                    </p>

                    <span className="mt-5 inline-block text-xs font-semibold text-[#E45D46]">
                        View enrollments →
                    </span>
                </Link>

            </section>


            {/* Student Overview */}
            <section className="mt-3 rounded-2xl border border-[#DCE1E8] bg-white p-5 shadow-[0_4px_18px_rgba(15,23,42,0.045)] sm:p-6">

                <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#2563EB]" />

                    <h2 className="text-base font-semibold text-[#111827]">
                        Student Overview
                    </h2>
                </div>

                <p className="mt-1 text-sm text-[#64748B]">
                    Your academic information will appear here as you enroll
                    in courses.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">

                    <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#64748B]">
                            Enrollments
                        </p>

                        <p className="mt-2 text-2xl font-semibold text-[#111827]">
                            {enrollments.length}
                        </p>

                        <p className="mt-1 text-xs text-[#64748B]">
                            Total courses enrolled
                        </p>
                    </div>


                    <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#64748B]">
                            Courses
                        </p>

                        <p className="mt-2 text-2xl font-semibold text-[#111827]">
                            {courses.length}
                        </p>

                        <p className="mt-1 text-xs text-[#64748B]">
                            Available courses
                        </p>
                    </div>

                </div>

            </section>

        </div>
    );
}


/* =========================================================
   STUDENT METRIC CARD
========================================================= */

function StudentMetricCard({
    label,
    value,
    valueLabel,
    description,
    accent,
    icon,
}: {
    label: string;
    value?: number;
    valueLabel?: string;
    description: string;
    accent: "blue" | "teal" | "coral";
    icon: string;
}) {
    const styles = {
        blue: {
            bar: "bg-[#2563EB]",
            icon: "bg-[#EFF6FF] text-[#2563EB]",
        },
        teal: {
            bar: "bg-[#0F9D8A]",
            icon: "bg-[#ECFDF8] text-[#0F9D8A]",
        },
        coral: {
            bar: "bg-[#F9735B]",
            icon: "bg-[#FFF1ED] text-[#E45D46]",
        },
    };

    return (
        <div className="group relative overflow-hidden rounded-2xl border border-[#DCE1E8] bg-white p-5 shadow-[0_4px_18px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)]">

            <div
                className={`absolute left-0 top-0 h-full w-1 ${styles[accent].bar}`}
            />

            <div className="flex items-start justify-between">

                <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#64748B]">
                        {label}
                    </p>

                    <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#111827]">
                        {valueLabel ?? value}
                    </p>

                    <p className="mt-1 text-xs text-[#64748B]">
                        {description}
                    </p>
                </div>

                <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold ${styles[accent].icon}`}
                >
                    {icon}
                </div>

            </div>

        </div>
    );
}


/* =========================================================
   ADMIN DASHBOARD
========================================================= */

function AdminDashboard({
    email,
    role,
    users,
    students,
    courses,
    enrollments,
}: {
    email: string;
    role: string;
    users: User[];
    students: Student[];
    courses: Course[];
    enrollments: Enrollment[];
}) {
    const adminCount = users.filter(
        (user) => user.role === "ADMIN"
    ).length;

    const teacherCount = users.filter(
        (user) => user.role === "TEACHER"
    ).length;

    /*
     * Student count comes from the actual students table.
     * This keeps the dashboard consistent with the student records.
     */
    const studentCount = students.length;

    const enrollmentData = useMemo<MonthlyData[]>(() => {
        const map: Record<string, number> = {};

        enrollments.forEach((enrollment) => {
            const date = new Date(enrollment.enrolledAt);

            const key = `${date.getFullYear()}-${String(
                date.getMonth() + 1
            ).padStart(2, "0")}`;

            map[key] = (map[key] ?? 0) + 1;
        });

        return Object.entries(map)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, count]) => {
                const [year, month] = key.split("-");

                const date = new Date(
                    Number(year),
                    Number(month) - 1
                );

                return {
                    month: date.toLocaleDateString("en-US", {
                        month: "short",
                    }),
                    count,
                };
            });
    }, [enrollments]);

    const totalUsers = users.length || 1;

    const studentPercentage = Math.round(
        (studentCount / totalUsers) * 100
    );

    const teacherPercentage = Math.round(
        (teacherCount / totalUsers) * 100
    );

    const adminPercentage = Math.round(
        (adminCount / totalUsers) * 100
    );

    return (
        <div className="mx-auto w-full max-w-[1600px]">

            {/* =========================
                HEADER
            ========================= */}

            <header className="flex flex-col justify-between gap-5 border-b border-[#DCE1E8] pb-6 sm:flex-row sm:items-end">

                <div>
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#D8E3F8] bg-[#EFF6FF] px-3 py-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB]" />

                        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#1D4ED8]">
                            Overview
                        </span>
                    </div>

                    <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#111827] sm:text-4xl">
                        Dashboard
                    </h1>

                    <p className="mt-2 text-sm text-[#64748B]">
                        Welcome back, {email}
                    </p>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-[#DCE1E8] bg-white px-4 py-3 shadow-[0_3px_12px_rgba(15,23,42,0.04)]">

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#172033] text-xs font-bold text-white">
                        {role.charAt(0)}
                    </div>

                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#94A3B8]">
                            Signed in as
                        </p>

                        <p className="mt-0.5 text-sm font-semibold text-[#111827]">
                            {role}
                        </p>
                    </div>

                </div>

            </header>


            {/* =========================
                PRIMARY METRICS
            ========================= */}

            <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                <MetricCard
                    label="Total users"
                    value={users.length}
                    description="Registered accounts"
                    accent="blue"
                    icon="U"
                />

                <MetricCard
                    label="Students"
                    value={studentCount}
                    description="Student profiles"
                    accent="coral"
                    icon="S"
                />

                <MetricCard
                    label="Teachers"
                    value={teacherCount}
                    description="Teacher accounts"
                    accent="violet"
                    icon="T"
                />

                <MetricCard
                    label="Administrators"
                    value={adminCount}
                    description="Admin accounts"
                    accent="navy"
                    icon="A"
                />

            </section>


            {/* =========================
                SECONDARY METRICS
            ========================= */}

            <section className="mt-3 grid gap-3 sm:grid-cols-2">

                <InfoCard
                    label="Courses"
                    value={courses.length}
                    description="Available courses"
                    icon="C"
                    iconStyle="teal"
                />

                <InfoCard
                    label="Enrollments"
                    value={enrollments.length}
                    description="Total enrollment records"
                    icon="E"
                    iconStyle="blue"
                />

            </section>


            {/* =========================
                ANALYTICS
            ========================= */}

            <section className="mt-3 grid gap-3 lg:grid-cols-1 xl:grid-cols-[1.55fr_1fr]">

                {/* Enrollment Activity */}

                <div className="rounded-2xl border border-[#DCE1E8] bg-white p-5 shadow-[0_4px_18px_rgba(15,23,42,0.045)] sm:p-6">

                    <div className="flex items-start justify-between gap-4">

                        <div>
                            <div className="flex items-center gap-2">

                                <span className="h-2 w-2 rounded-full bg-[#0F9D8A]" />

                                <h2 className="text-base font-semibold text-[#111827]">
                                    Enrollment activity
                                </h2>

                            </div>

                            <p className="mt-1 text-sm text-[#64748B]">
                                Enrollment growth over time
                            </p>
                        </div>

                        <span className="rounded-full bg-[#ECFDF8] px-3 py-1.5 text-[11px] font-semibold text-[#087F70]">
                            Monthly
                        </span>

                    </div>


                    {enrollmentData.length === 0 ? (

                        <div className="mt-6 flex min-h-[230px] flex-col items-center justify-center rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-5 text-center">

                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ECFDF8] text-sm font-bold text-[#0F9D8A]">
                                E
                            </div>

                            <p className="mt-4 text-sm font-semibold text-[#111827]">
                                No enrollment activity yet
                            </p>

                            <p className="mt-1 max-w-sm text-xs leading-5 text-[#64748B]">
                                Enrollment trends will appear here once
                                students begin enrolling in courses.
                            </p>

                        </div>

                    ) : (

                        <EnrollmentChart data={enrollmentData} />

                    )}

                </div>


                {/* User Distribution */}

                <div className="rounded-2xl border border-[#DCE1E8] bg-white p-5 shadow-[0_4px_18px_rgba(15,23,42,0.045)] sm:p-6">

                    <div className="flex items-start justify-between">

                        <div>
                            <h2 className="text-base font-semibold text-[#111827]">
                                User distribution
                            </h2>

                            <p className="mt-1 text-sm text-[#64748B]">
                                Breakdown of registered accounts
                            </p>
                        </div>

                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F5F3FF] text-xs font-bold text-[#7C3AED]">
                            %
                        </div>

                    </div>


                    {/* Distribution bar */}

                    <div className="mt-7 flex h-3 overflow-hidden rounded-full bg-[#E2E8F0]">

                        {studentCount > 0 && (
                            <div
                                className="bg-[#F9735B]"
                                style={{
                                    width: `${studentPercentage}%`,
                                }}
                            />
                        )}

                        {teacherCount > 0 && (
                            <div
                                className="bg-[#7C3AED]"
                                style={{
                                    width: `${teacherPercentage}%`,
                                }}
                            />
                        )}

                        {adminCount > 0 && (
                            <div
                                className="bg-[#172033]"
                                style={{
                                    width: `${adminPercentage}%`,
                                }}
                            />
                        )}

                    </div>


                    {/* Distribution rows */}

                    <div className="mt-7 space-y-4">

                        <DistributionRow
                            label="Students"
                            value={studentCount}
                            percentage={studentPercentage}
                            dot="coral"
                            background="coral"
                        />

                        <DistributionRow
                            label="Teachers"
                            value={teacherCount}
                            percentage={teacherPercentage}
                            dot="violet"
                            background="violet"
                        />

                        <DistributionRow
                            label="Administrators"
                            value={adminCount}
                            percentage={adminPercentage}
                            dot="navy"
                            background="navy"
                        />

                    </div>

                </div>

            </section>


            {/* =========================
                SUMMARY STRIP
            ========================= */}

            <section className="mt-3 grid gap-3 sm:grid-cols-3">

                <SummaryItem
                    label="Student accounts"
                    value={studentCount}
                    accent="coral"
                />

                <SummaryItem
                    label="Available courses"
                    value={courses.length}
                    accent="teal"
                />

                <SummaryItem
                    label="Enrollments"
                    value={enrollments.length}
                    accent="blue"
                />

            </section>

        </div>
    );
}


/* =========================================================
   METRIC CARD
========================================================= */

function MetricCard({
    label,
    value,
    description,
    accent,
    icon,
}: {
    label: string;
    value: number;
    description: string;
    accent: "blue" | "coral" | "violet" | "navy";
    icon: string;
}) {
    const styles = {
        blue: {
            bar: "bg-[#2563EB]",
            icon: "bg-[#EFF6FF] text-[#2563EB]",
        },
        coral: {
            bar: "bg-[#F9735B]",
            icon: "bg-[#FFF1ED] text-[#E45D46]",
        },
        violet: {
            bar: "bg-[#7C3AED]",
            icon: "bg-[#F5F3FF] text-[#7C3AED]",
        },
        navy: {
            bar: "bg-[#172033]",
            icon: "bg-[#EEF1F5] text-[#172033]",
        },
    };

    return (
        <div className="group relative overflow-hidden rounded-2xl border border-[#DCE1E8] bg-white p-5 shadow-[0_4px_18px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)]">

            <div
                className={`absolute left-0 top-0 h-full w-1 ${styles[accent].bar}`}
            />

            <div className="flex items-start justify-between">

                <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#64748B]">
                        {label}
                    </p>

                    <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#111827]">
                        {value}
                    </p>

                    <p className="mt-1 text-xs text-[#64748B]">
                        {description}
                    </p>
                </div>

                <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold ${styles[accent].icon}`}
                >
                    {icon}
                </div>

            </div>

        </div>
    );
}


/* =========================================================
   INFO CARD
========================================================= */

function InfoCard({
    label,
    value,
    description,
    icon,
    iconStyle,
}: {
    label: string;
    value: number;
    description: string;
    icon: string;
    iconStyle: "teal" | "blue";
}) {
    const styles = {
        teal: {
            icon: "bg-[#ECFDF8] text-[#0F9D8A]",
            bar: "bg-[#0F9D8A]",
        },
        blue: {
            icon: "bg-[#EFF6FF] text-[#2563EB]",
            bar: "bg-[#2563EB]",
        },
    };

    return (
        <div className="group relative overflow-hidden rounded-2xl border border-[#DCE1E8] bg-white p-5 shadow-[0_4px_18px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)] sm:p-6">

            <div
                className={`absolute left-0 top-0 h-full w-1 ${styles[iconStyle].bar}`}
            />

            <div className="flex items-start justify-between">

                <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#64748B]">
                        {label}
                    </p>

                    <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#111827]">
                        {value}
                    </p>

                    <p className="mt-1 text-sm text-[#64748B]">
                        {description}
                    </p>
                </div>

                <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold ${styles[iconStyle].icon}`}
                >
                    {icon}
                </div>

            </div>

        </div>
    );
}


/* =========================================================
   DISTRIBUTION ROW
========================================================= */

function DistributionRow({
    label,
    value,
    percentage,
    dot,
    background,
}: {
    label: string;
    value: number;
    percentage: number;
    dot: "coral" | "violet" | "navy";
    background: "coral" | "violet" | "navy";
}) {
    const dotClass = {
        coral: "bg-[#F9735B]",
        violet: "bg-[#7C3AED]",
        navy: "bg-[#172033]",
    };

    const badgeClass = {
        coral: "bg-[#FFF1ED] text-[#E45D46]",
        violet: "bg-[#F5F3FF] text-[#7C3AED]",
        navy: "bg-[#EEF1F5] text-[#172033]",
    };

    return (
        <div className="flex items-center justify-between rounded-xl px-3 py-2.5 transition hover:bg-[#F8FAFC]">

            <div className="flex items-center gap-3">

                <span
                    className={`h-2.5 w-2.5 rounded-full ${dotClass[dot]}`}
                />

                <span className="text-sm font-medium text-[#334155]">
                    {label}
                </span>

            </div>

            <div className="flex items-center gap-3">

                <span
                    className={`rounded-lg px-2 py-1 text-xs font-bold ${badgeClass[background]}`}
                >
                    {value}
                </span>

                <span className="w-10 text-right text-xs font-medium text-[#64748B]">
                    {percentage}%
                </span>

            </div>

        </div>
    );
}


/* =========================================================
   SUMMARY ITEM
========================================================= */

function SummaryItem({
    label,
    value,
    accent,
}: {
    label: string;
    value: number;
    accent: "coral" | "teal" | "blue";
}) {
    const styles = {
        coral: {
            dot: "bg-[#F9735B]",
            value: "text-[#E45D46]",
        },
        teal: {
            dot: "bg-[#0F9D8A]",
            value: "text-[#087F70]",
        },
        blue: {
            dot: "bg-[#2563EB]",
            value: "text-[#1D4ED8]",
        },
    };

    return (
        <div className="rounded-2xl border border-[#DCE1E8] bg-white px-5 py-4 shadow-[0_3px_14px_rgba(15,23,42,0.03)]">

            <div className="flex items-center justify-between">

                <div className="flex items-center gap-2.5">

                    <span
                        className={`h-2 w-2 rounded-full ${styles[accent].dot}`}
                    />

                    <span className="text-xs font-medium text-[#64748B]">
                        {label}
                    </span>

                </div>

                <span
                    className={`text-lg font-bold ${styles[accent].value}`}
                >
                    {value}
                </span>

            </div>

        </div>
    );
}


/* =========================================================
   ENROLLMENT CHART
========================================================= */

function EnrollmentChart({
    data,
}: {
    data: MonthlyData[];
}) {
    const width = 700;
    const height = 240;
    const paddingX = 35;
    const paddingY = 25;

    const max = Math.max(
        ...data.map((item) => item.count),
        1
    );

    const points = data.map((item, index) => {
        const x =
            data.length === 1
                ? width / 2
                : paddingX +
                  (index / (data.length - 1)) *
                      (width - paddingX * 2);

        const y =
            height -
            paddingY -
            (item.count / max) *
                (height - paddingY * 2);

        return {
            x,
            y,
            ...item,
        };
    });

    const path = points
        .map((point, index) =>
            index === 0
                ? `M ${point.x} ${point.y}`
                : `L ${point.x} ${point.y}`
        )
        .join(" ");

    return (
        <div className="mt-6">

            <svg
                viewBox={`0 0 ${width} ${height}`}
                className="h-[230px] w-full"
                preserveAspectRatio="none"
            >

                {/* Grid */}

                {[0, 1, 2, 3].map((line) => {
                    const y =
                        paddingY +
                        (line / 3) *
                            (height - paddingY * 2);

                    return (
                        <line
                            key={line}
                            x1={paddingX}
                            x2={width - paddingX}
                            y1={y}
                            y2={y}
                            stroke="#E2E8F0"
                            strokeWidth="1"
                        />
                    );
                })}


                {/* Line */}

                <path
                    d={path}
                    fill="none"
                    stroke="#0F9D8A"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />


                {/* Points */}

                {points.map((point) => (
                    <g key={`${point.month}-${point.x}`}>

                        <circle
                            cx={point.x}
                            cy={point.y}
                            r="7"
                            fill="#FFFFFF"
                            stroke="#0F9D8A"
                            strokeWidth="3"
                        />

                        <text
                            x={point.x}
                            y={point.y - 14}
                            textAnchor="middle"
                            fontSize="11"
                            fontWeight="600"
                            fill="#111827"
                        >
                            {point.count}
                        </text>

                        <text
                            x={point.x}
                            y={height - 4}
                            textAnchor="middle"
                            fontSize="11"
                            fill="#64748B"
                        >
                            {point.month}
                        </text>

                    </g>
                ))}

            </svg>

        </div>
    );
}