"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    Users,
    GraduationCap,
    Briefcase,
    ShieldCheck,
    BookOpen,
    ClipboardList,
    User as UserIcon,
    ArrowUpRight,
    type LucideIcon,
} from "lucide-react";
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

type Accent = "blue" | "teal" | "coral" | "violet" | "navy";

/* Shared accent tokens (visual only) */
const ACCENTS: Record<
    Accent,
    { chip: string; dot: string; fill: string; text: string }
> = {
    blue: {
        chip: "bg-[#EFF6FF] text-[#2563EB]",
        dot: "bg-[#2563EB]",
        fill: "#2563EB",
        text: "text-[#1D4ED8]",
    },
    teal: {
        chip: "bg-[#ECFDF8] text-[#0F9D8A]",
        dot: "bg-[#0F9D8A]",
        fill: "#0F9D8A",
        text: "text-[#087F70]",
    },
    coral: {
        chip: "bg-[#FFF1ED] text-[#E45D46]",
        dot: "bg-[#F9735B]",
        fill: "#F9735B",
        text: "text-[#E45D46]",
    },
    violet: {
        chip: "bg-[#F5F3FF] text-[#7C3AED]",
        dot: "bg-[#7C3AED]",
        fill: "#7C3AED",
        text: "text-[#7C3AED]",
    },
    navy: {
        chip: "bg-[#EEF1F5] text-[#172033]",
        dot: "bg-[#172033]",
        fill: "#172033",
        text: "text-[#172033]",
    },
};

const CARD =
    "rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]";

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

    if (loading) {
        return <DashboardSkeleton />;
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

if (role === "TEACHER") {
    return (
        <TeacherDashboard
            email={email}
            students={students}
            courses={courses}
            enrollments={enrollments}
        />
    );
}

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
   LOADING SKELETON
========================================================= */

function DashboardSkeleton() {
    return (
        <div
            className="mx-auto w-full max-w-[1600px] animate-pulse"
            aria-busy="true"
            aria-label="Loading dashboard"
        >
            <div className="border-b border-[#E2E8F0] pb-6">
                <div className="h-8 w-48 rounded-lg bg-[#E2E8F0]" />
                <div className="mt-3 h-4 w-64 rounded-md bg-[#E8ECF2]" />
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="h-[124px] rounded-2xl bg-[#E8ECF2]" />
                ))}
            </div>

            <div className="mt-3 grid gap-3 xl:grid-cols-[1.55fr_1fr]">
                <div className="h-[340px] rounded-2xl bg-[#E8ECF2]" />
                <div className="h-[340px] rounded-2xl bg-[#E8ECF2]" />
            </div>
        </div>
    );
}


/* =========================================================
   PAGE HEADER
========================================================= */

function PageHeader({ email, role }: { email: string; role: string }) {
    return (
        <div className="mb-8 border-b border-[#DCE1E8] pb-6">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#D8E3F8] bg-[#EFF6FF] px-3 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB]" />

                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#1D4ED8]">
                    Management
                </span>
            </div>

            <div>
                <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#111827] sm:text-4xl">
                    Dashboard
                </h1>

                <p className="mt-2 text-sm text-[#64748B]">
                    Welcome back,{" "}
                    <span className="font-medium text-[#334155]">
                        {email}
                    </span>
                </p>
            </div>
        </div>
    );
}/* =========================================================
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
    const enrolledCourseIds = new Set(
        enrollments.map((enrollment) => enrollment.courseId)
    );

    const myCourses = courses.filter((course) =>
        enrolledCourseIds.has(course.id)
    );

    return (
        <div className="relative -m-4 min-h-screen overflow-hidden sm:-m-6 lg:-m-8">
            {/* =========================
                FULL STUDENT DASHBOARD BACKGROUND
            ========================= */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                    backgroundImage: "url('/uni-background.jpeg')",
                }}
            />

            {/* Soft white overlay */}
            <div className="absolute inset-0 bg-white/15" />
            {/* =========================
                DASHBOARD CONTENT
            ========================= */}
            <div className="relative z-10 mx-auto w-full max-w-[1400px] p-4 sm:p-6 lg:p-8">

                {/* =========================
                    WELCOME SECTION
                ========================= */}
                <section className="overflow-hidden rounded-2xl border border-[#DCE1E8] bg-white/95 backdrop-blur-sm">
                    <div className="grid min-h-[320px] lg:grid-cols-[1fr_360px]">

                        {/* LEFT */}
                        <div className="flex items-center px-7 py-9 sm:px-10 lg:px-12">
                            <div className="max-w-xl">

                                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#D8E3F8] bg-[#EFF6FF] px-3 py-1.5">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB]" />

                                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#1D4ED8]">
                                        Student Portal
                                    </span>
                                </div>

                                <h1 className="text-[42px] font-bold leading-[1.05] tracking-[-0.035em] text-[#0F172A] sm:text-[50px]">
                                    Welcome back
                                </h1>

                                <p className="mt-4 max-w-lg text-[15px] leading-6 text-[#64748B] sm:text-base">
                                    Stay connected with your courses, academic
                                    activities and student information from
                                    one place.
                                </p>

                                <div className="mt-7 flex items-center gap-3">
                                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
                                        <BookOpen className="h-5 w-5" />
                                    </span>

                                    <div>
                                        <p className="text-sm font-semibold text-[#0F172A]">
                                            Your academic journey
                                        </p>

                                        <p className="mt-0.5 text-xs text-[#64748B]">
                                            Everything you need, in one place.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT — PROFILE */}
                        <div className="relative min-h-[260px] overflow-hidden border-t border-[#E2E8F0] lg:border-l lg:border-t-0">
                            {/* Profile background image */}
                            <img
                                src="/student-hero.png"
                                alt=""
                                className="absolute inset-0 h-full w-full object-cover object-center"
                            />

                            {/* Dark soft overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/80 via-[#0F172A]/35 to-[#0F172A]/10" />

                            {/* Profile content */}
                            <div className="relative z-10 flex h-full min-h-[260px] flex-col justify-end p-7 sm:p-8">
                                <Link
                                    href="/dashboard/profile"
                                    className="group"
                                >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/60 bg-white text-[#2563EB] shadow-xl">
                                        <UserIcon className="h-5 w-5" />
                                    </div>

                                    <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/70">
                                        Student Profile
                                    </p>

                                    <p className="mt-1 truncate text-base font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.35)]">
                                        {email}
                                    </p>

                                    <div className="mt-5 flex items-center justify-between border-t border-white/20 pt-4">
                                        <span className="text-sm font-semibold text-white">
                                            View profile
                                        </span>

                                        <ArrowUpRight className="h-4 w-4 text-white/70 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* =========================
                    MY COURSES
                ========================= */}
                <section className={`${CARD} mt-5 p-5 sm:p-6`}>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#2563EB]">
                                Academic
                            </p>

                            <h2 className="mt-1 text-xl font-semibold tracking-[-0.025em] text-[#0F172A]">
                                My Courses
                            </h2>

                            <p className="mt-1 text-sm text-[#64748B]">
                                Your currently enrolled courses.
                            </p>
                        </div>

                        <Link
                            href="/dashboard/courses"
                            className="text-sm font-semibold text-[#2563EB] transition-colors hover:text-[#1D4ED8]"
                        >
                            View all →
                        </Link>
                    </div>

                    {myCourses.length === 0 ? (
                        <div className="mt-5 flex min-h-[190px] flex-col items-center justify-center rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-5 text-center">
                            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB]">
                                <BookOpen className="h-5 w-5" />
                            </span>

                            <p className="mt-4 text-sm font-semibold text-[#0F172A]">
                                No courses yet
                            </p>

                            <p className="mt-1 max-w-sm text-xs leading-5 text-[#64748B]">
                                Your enrolled courses will appear here once
                                courses have been assigned to you.
                            </p>
                        </div>
                    ) : (
                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                            {myCourses.slice(0, 4).map((course) => {
                                const enrollment = enrollments.find(
                                    (item) => item.courseId === course.id
                                );

                                const grade = enrollment?.grade;

                                return (
                                    <div
                                        key={course.id}
                                        className="group overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white transition-all hover:-translate-y-0.5 hover:border-[#CBD5E1] hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]"
                                    >
                                        <div className="relative h-28 overflow-hidden bg-[#F1F5F9]">
                                            <div className="absolute inset-0 bg-[linear-gradient(135deg,#EFF6FF_0%,#F8FAFC_55%,#E8EEF8_100%)]" />

                                            <div className="absolute right-[-20px] top-[-35px] h-32 w-32 rounded-full border-[18px] border-white/70" />

                                            <div className="absolute bottom-[-45px] left-[-20px] h-28 w-28 rounded-full border-[15px] border-[#DCE8FA]" />

                                            <div className="absolute left-5 top-5">
                                                <span className="inline-flex rounded-lg bg-white px-2.5 py-1.5 text-[11px] font-bold tracking-wide text-[#2563EB] shadow-sm">
                                                    {course.code}
                                                </span>
                                            </div>

                                            <div className="absolute bottom-4 right-5 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#2563EB] shadow-sm">
                                                <BookOpen className="h-[18px] w-[18px]" />
                                            </div>
                                        </div>

                                        <div className="p-5">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="min-w-0">
                                                    <h3 className="truncate text-base font-semibold text-[#0F172A]">
                                                        {course.name}
                                                    </h3>

                                                    <p className="mt-1 line-clamp-2 text-sm leading-5 text-[#64748B]">
                                                        {course.description ||
                                                            "Course information is available here."}
                                                    </p>
                                                </div>

                                                <div className="shrink-0 text-right">
                                                    <p className="text-base font-semibold text-[#0F172A]">
                                                        {course.credits}
                                                    </p>

                                                    <p className="text-[10px] uppercase tracking-wide text-[#94A3B8]">
                                                        Credits
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-5 flex items-center justify-between border-t border-[#F1F5F9] pt-4">
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-wide text-[#94A3B8]">
                                                        Status
                                                    </p>

                                                    <p className="mt-1 text-xs font-semibold text-[#334155]">
                                                        {grade
                                                            ? "Completed"
                                                            : "In progress"}
                                                    </p>
                                                </div>

                                                <div className="text-right">
                                                    <p className="text-[10px] font-bold uppercase tracking-wide text-[#94A3B8]">
                                                        Grade
                                                    </p>

                                                    <p className="mt-1 text-xs font-semibold text-[#2563EB]">
                                                        {grade || "—"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
/* =========================================================
   STUDENT RESOURCE CARD
========================================================= */

function StudentResourceCard({
    title,
    description,
    icon: Icon,
    href,
    label,
}: {
    title: string;
    description: string;
    icon: LucideIcon;
    href: string;
    label: string;
}) {
    return (
        <Link
            href={href}
            className={`${CARD} group overflow-hidden transition-all hover:-translate-y-0.5 hover:border-[#CBD5E1] hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]`}
        >
            <div className="relative h-24 overflow-hidden bg-[#F8FAFC]">
                <div className="absolute inset-0 bg-[linear-gradient(135deg,#EFF6FF_0%,#F8FAFC_55%,#EEF2F7_100%)]" />

                <div className="absolute right-[-25px] top-[-45px] h-32 w-32 rounded-full border-[18px] border-white/80" />

                <div className="absolute bottom-[-40px] left-[-20px] h-24 w-24 rounded-full border-[14px] border-[#DCE8FA]" />

                <span className="absolute left-5 top-5 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#2563EB] shadow-sm">
                    <Icon className="h-[18px] w-[18px]" />
                </span>
            </div>

            <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h3 className="text-base font-semibold text-[#0F172A]">
                            {title}
                        </h3>

                        <p className="mt-1.5 text-sm leading-5 text-[#64748B]">
                            {description}
                        </p>
                    </div>

                    <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-[#CBD5E1] transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#2563EB]" />
                </div>

                <p className="mt-5 text-xs font-semibold text-[#2563EB]">
                    {label} →
                </p>
            </div>
        </Link>
    );
}
/* =========================================================
   ACTION CARD (student quick links)
========================================================= */

function ActionCard({
    href,
    title,
    description,
    cta,
    accent,
    icon: Icon,
}: {
    href: string;
    title: string;
    description: string;
    cta: string;
    accent: Accent;
    icon: LucideIcon;
}) {
    return (
        <Link
            href={href}
            className={`${CARD} group flex flex-col p-6 transition-colors hover:border-[#CBD5E1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]`}
        >
            <div className="flex items-start justify-between">
                <span
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${ACCENTS[accent].chip}`}
                >
                    <Icon className="h-5 w-5" strokeWidth={2} />
                </span>

                <ArrowUpRight className="h-4 w-4 text-[#CBD5E1] transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#64748B]" />
            </div>

            <h2 className="mt-5 text-base font-semibold text-[#0F172A]">
                {title}
            </h2>

            <p className="mt-1 text-sm leading-6 text-[#64748B]">
                {description}
            </p>

            <span
                className={`mt-5 text-xs font-semibold ${ACCENTS[accent].text}`}
            >
                {cta}
            </span>
        </Link>
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
    icon: Icon,
}: {
    label: string;
    value?: number;
    valueLabel?: string;
    description: string;
    accent: "blue" | "teal" | "coral" | "violet";
    icon: LucideIcon;
}) {
    return (
        <div className={`${CARD} p-5`}>

            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[#64748B]">
                    {label}
                </p>

                <span
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${ACCENTS[accent].chip}`}
                >
                    <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                </span>
            </div>

            <p className="mt-4 text-3xl font-semibold tabular-nums tracking-[-0.03em] text-[#0F172A]">
                {valueLabel ?? value}
            </p>

            <p className="mt-1 text-xs text-[#94A3B8]">
                {description}
            </p>

        </div>
    );
}
/* =========================================================
   TEACHER DASHBOARD
========================================================= */

function TeacherDashboard({
    email,
    students,
    courses,
    enrollments,
}: {
    email: string;
    students: Student[];
    courses: Course[];
    enrollments: Enrollment[];
}) {
    const recentEnrollments = [...enrollments]
        .sort(
            (a, b) =>
                new Date(b.enrolledAt).getTime() -
                new Date(a.enrolledAt).getTime()
        )
        .slice(0, 5);

    function getStudentName(studentId: number) {
        const student = students.find(
            (item) => item.id === studentId
        );

        return student
            ? `${student.firstName} ${student.lastName}`
            : `Student #${studentId}`;
    }

    function getCourseName(courseId: number) {
        const course = courses.find(
            (item) => item.id === courseId
        );

        return course
            ? `${course.code} — ${course.name}`
            : `Course #${courseId}`;
    }

    return (
        <main className="mx-auto w-full max-w-[1400px]">
            {/* =========================
                HEADER
            ========================= */}

            <header className="mb-8 border-b border-[#DCE1E8] pb-6">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#D8E3F8] bg-[#EFF6FF] px-3 py-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB]" />

                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#1D4ED8]">
                        Teacher Portal
                    </span>
                </div>

                <h1 className="text-[42px] font-bold leading-[1.05] tracking-[-0.03em] text-[#0F172A] sm:text-[46px]">
                    Teacher Dashboard
                </h1>

                <p className="mt-3 text-[15px] leading-6 text-[#64748B] sm:text-base">
                    Welcome back,{" "}
                    <span className="font-medium text-[#334155]">
                        {email}
                    </span>
                </p>
            </header>

            {/* =========================
                OVERVIEW
            ========================= */}

            <section className="grid gap-4 sm:grid-cols-3">
                {/* Students */}

                <div className="rounded-2xl border border-[#DCE1E8] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-[#64748B]">
                                Students
                            </p>

                            <p className="mt-2 text-3xl font-bold tracking-[-0.04em] text-[#0F172A]">
                                {students.length}
                            </p>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EFF6FF]">
                            <Users className="h-5 w-5 text-[#2563EB]" />
                        </div>
                    </div>

                    <p className="mt-3 text-xs text-[#94A3B8]">
                        Registered student profiles
                    </p>
                </div>

                {/* Courses */}

                <div className="rounded-2xl border border-[#DCE1E8] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-[#64748B]">
                                Courses
                            </p>

                            <p className="mt-2 text-3xl font-bold tracking-[-0.04em] text-[#0F172A]">
                                {courses.length}
                            </p>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#ECFDF8]">
                            <BookOpen className="h-5 w-5 text-[#0F9D8A]" />
                        </div>
                    </div>

                    <p className="mt-3 text-xs text-[#94A3B8]">
                        Courses available in the system
                    </p>
                </div>

                {/* Enrollments */}

                <div className="rounded-2xl border border-[#DCE1E8] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-[#64748B]">
                                Enrollments
                            </p>

                            <p className="mt-2 text-3xl font-bold tracking-[-0.04em] text-[#0F172A]">
                                {enrollments.length}
                            </p>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F5F3FF]">
                            <ClipboardList className="h-5 w-5 text-[#7C3AED]" />
                        </div>
                    </div>

                    <p className="mt-3 text-xs text-[#94A3B8]">
                        Current student-course enrollments
                    </p>
                </div>
            </section>

            {/* =========================
                MAIN CONTENT
            ========================= */}

            <section className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_1fr]">
                {/* Course Overview */}

                <div className="overflow-hidden rounded-2xl border border-[#DCE1E8] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                    <div className="border-b border-[#E2E8F0] px-6 py-5">
                        <h2 className="text-base font-semibold text-[#0F172A]">
                            Course Overview
                        </h2>

                        <p className="mt-1 text-sm text-[#64748B]">
                            Courses currently available to students.
                        </p>
                    </div>

                    {courses.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                            <BookOpen className="mx-auto h-8 w-8 text-[#CBD5E1]" />

                            <p className="mt-3 text-sm font-medium text-[#475569]">
                                No courses available
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-[#E2E8F0]">
                            {courses.slice(0, 5).map((course) => (
                                <div
                                    key={course.id}
                                    className="flex items-center justify-between gap-4 px-6 py-4"
                                >
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-[#0F172A]">
                                            {course.name}
                                        </p>

                                        <p className="mt-1 text-xs font-medium text-[#64748B]">
                                            {course.code}
                                        </p>
                                    </div>

                                    <span className="shrink-0 rounded-lg bg-[#EFF6FF] px-2.5 py-1 text-xs font-semibold text-[#2563EB]">
                                        {course.credits} credits
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Enrollments */}

                <div className="overflow-hidden rounded-2xl border border-[#DCE1E8] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                    <div className="border-b border-[#E2E8F0] px-6 py-5">
                        <h2 className="text-base font-semibold text-[#0F172A]">
                            Recent Enrollments
                        </h2>

                        <p className="mt-1 text-sm text-[#64748B]">
                            Latest student-course enrollment activity.
                        </p>
                    </div>

                    {recentEnrollments.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                            <ClipboardList className="mx-auto h-8 w-8 text-[#CBD5E1]" />

                            <p className="mt-3 text-sm font-medium text-[#475569]">
                                No enrollments yet
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-[#E2E8F0]">
                            {recentEnrollments.map((enrollment) => (
                                <div
                                    key={enrollment.id}
                                    className="px-6 py-4"
                                >
                                    <p className="text-sm font-semibold text-[#0F172A]">
                                        {getStudentName(
                                            enrollment.studentId
                                        )}
                                    </p>

                                    <p className="mt-1 truncate text-xs text-[#64748B]">
                                        {getCourseName(
                                            enrollment.courseId
                                        )}
                                    </p>

                                    <div className="mt-2 flex items-center justify-between">
                                        <span className="text-[11px] text-[#94A3B8]">
                                            {new Date(
                                                enrollment.enrolledAt
                                            ).toLocaleDateString()}
                                        </span>

                                        <span
                                            className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                                                enrollment.grade
                                                    ? "bg-[#ECFDF8] text-[#087F70]"
                                                    : "bg-[#EFF6FF] text-[#2563EB]"
                                            }`}
                                        >
                                            {enrollment.grade
                                                ? `Grade ${enrollment.grade}`
                                                : "In progress"}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* =========================
                QUICK ACCESS
            ========================= */}

            <section className="mt-6 grid gap-4 sm:grid-cols-3">
                <Link
                    href="/dashboard/students"
                    className="group rounded-2xl border border-[#DCE1E8] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#BFDBFE] hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]"
                >
                    <div className="flex items-center justify-between">
                        <GraduationCap className="h-5 w-5 text-[#2563EB]" />

                        <ArrowUpRight className="h-4 w-4 text-[#94A3B8] transition group-hover:text-[#2563EB]" />
                    </div>

                    <p className="mt-5 text-sm font-semibold text-[#0F172A]">
                        View Students
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[#64748B]">
                        Browse registered student profiles.
                    </p>
                </Link>

                <Link
                    href="/dashboard/courses"
                    className="group rounded-2xl border border-[#DCE1E8] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#BFDBFE] hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]"
                >
                    <div className="flex items-center justify-between">
                        <BookOpen className="h-5 w-5 text-[#0F9D8A]" />

                        <ArrowUpRight className="h-4 w-4 text-[#94A3B8] transition group-hover:text-[#2563EB]" />
                    </div>

                    <p className="mt-5 text-sm font-semibold text-[#0F172A]">
                        Manage Courses
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[#64748B]">
                        Create and update course information.
                    </p>
                </Link>

                <Link
                    href="/dashboard/enrollments"
                    className="group rounded-2xl border border-[#DCE1E8] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#BFDBFE] hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]"
                >
                    <div className="flex items-center justify-between">
                        <ClipboardList className="h-5 w-5 text-[#7C3AED]" />

                        <ArrowUpRight className="h-4 w-4 text-[#94A3B8] transition group-hover:text-[#2563EB]" />
                    </div>

                    <p className="mt-5 text-sm font-semibold text-[#0F172A]">
                        View Enrollments
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[#64748B]">
                        Review student-course enrollment records.
                    </p>
                </Link>
            </section>
        </main>
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
        <div className="mx-auto w-full max-w-[1400px] px-8 py-3">

            <PageHeader email={email} role={role} />


            {/* =========================
                PRIMARY METRICS
            ========================= */}

            <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                <MetricCard
                    label="Total users"
                    value={users.length}
                    description="Registered accounts"
                    accent="blue"
                    icon={Users}
                />

                <MetricCard
                    label="Students"
                    value={studentCount}
                    description="Student profiles"
                    accent="coral"
                    icon={GraduationCap}
                />

                <MetricCard
                    label="Teachers"
                    value={teacherCount}
                    description="Teacher accounts"
                    accent="violet"
                    icon={Briefcase}
                />

                <MetricCard
                    label="Administrators"
                    value={adminCount}
                    description="Admin accounts"
                    accent="navy"
                    icon={ShieldCheck}
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
                    icon={BookOpen}
                    iconStyle="teal"
                />

                <InfoCard
                    label="Enrollments"
                    value={enrollments.length}
                    description="Total enrollment records"
                    icon={ClipboardList}
                    iconStyle="blue"
                />

            </section>


            {/* =========================
                ANALYTICS
            ========================= */}

            <section className="mt-3 grid gap-3 lg:grid-cols-1 xl:grid-cols-[1.55fr_1fr]">

                {/* Enrollment Activity */}

                <div className={`${CARD} p-5 sm:p-6`}>

                    <div className="flex items-start justify-between gap-4">

                        <div>
                            <h2 className="text-base font-semibold text-[#0F172A]">
                                Enrollment activity
                            </h2>

                            <p className="mt-1 text-sm text-[#64748B]">
                                Enrollment growth over time
                            </p>
                        </div>

                        <span className="rounded-full bg-[#F1F5F9] px-3 py-1 text-[11px] font-semibold text-[#475569]">
                            Monthly
                        </span>

                    </div>


                    {enrollmentData.length === 0 ? (

                        <div className="mt-6 flex min-h-[240px] flex-col items-center justify-center rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-5 text-center">

                            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ECFDF8] text-[#0F9D8A]">
                                <ClipboardList className="h-5 w-5" />
                            </span>

                            <p className="mt-4 text-sm font-semibold text-[#0F172A]">
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

                <div className={`${CARD} p-5 sm:p-6`}>

                    <div>
                        <h2 className="text-base font-semibold text-[#0F172A]">
                            User distribution
                        </h2>

                        <p className="mt-1 text-sm text-[#64748B]">
                            Breakdown of registered accounts
                        </p>
                    </div>


                    {/* Distribution bar */}

                    <div className="mt-7 flex h-2.5 gap-1 overflow-hidden rounded-full bg-[#F1F5F9]">

                        {studentCount > 0 && (
                            <div
                                className="rounded-full bg-[#F9735B]"
                                style={{
                                    width: `${studentPercentage}%`,
                                }}
                            />
                        )}

                        {teacherCount > 0 && (
                            <div
                                className="rounded-full bg-[#7C3AED]"
                                style={{
                                    width: `${teacherPercentage}%`,
                                }}
                            />
                        )}

                        {adminCount > 0 && (
                            <div
                                className="rounded-full bg-[#172033]"
                                style={{
                                    width: `${adminPercentage}%`,
                                }}
                            />
                        )}

                    </div>


                    {/* Distribution rows */}

                    <div className="mt-6 divide-y divide-[#F1F5F9]">

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
    icon: Icon,
}: {
    label: string;
    value: number;
    description: string;
    accent: "blue" | "coral" | "violet" | "navy";
    icon: LucideIcon;
}) {
    return (
        <div className={`${CARD} p-5`}>

            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[#64748B]">
                    {label}
                </p>

                <span
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${ACCENTS[accent].chip}`}
                >
                    <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                </span>
            </div>

            <p className="mt-4 text-3xl font-semibold tabular-nums tracking-[-0.03em] text-[#0F172A]">
                {value}
            </p>

            <p className="mt-1 text-xs text-[#94A3B8]">
                {description}
            </p>

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
    icon: Icon,
    iconStyle,
}: {
    label: string;
    value: number;
    description: string;
    icon: LucideIcon;
    iconStyle: "teal" | "blue";
}) {
    return (
        <div className={`${CARD} flex items-center gap-5 p-5 sm:p-6`}>

            <span
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${ACCENTS[iconStyle].chip}`}
            >
                <Icon className="h-5 w-5" strokeWidth={2} />
            </span>

            <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[#64748B]">
                    {label}
                </p>

                <p className="mt-0.5 text-xs text-[#94A3B8]">
                    {description}
                </p>
            </div>

            <p className="text-3xl font-semibold tabular-nums tracking-[-0.03em] text-[#0F172A]">
                {value}
            </p>

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
    return (
        <div className="flex items-center justify-between py-3">

            <div className="flex items-center gap-3">

                <span
                    className={`h-2.5 w-2.5 rounded-full ${ACCENTS[dot].dot}`}
                />

                <span className="text-sm font-medium text-[#334155]">
                    {label}
                </span>

            </div>

            <div className="flex items-center gap-3">

                <span
                    className={`min-w-[2rem] rounded-md px-2 py-1 text-center text-xs font-bold tabular-nums ${ACCENTS[background].chip}`}
                >
                    {value}
                </span>

                <span className="w-10 text-right text-xs font-medium tabular-nums text-[#64748B]">
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
    return (
        <div className="flex items-center justify-between rounded-xl border border-[#E2E8F0] bg-white px-5 py-3.5">

            <div className="flex items-center gap-2.5">

                <span
                    className={`h-2 w-2 rounded-full ${ACCENTS[accent].dot}`}
                />

                <span className="text-xs font-medium text-[#64748B]">
                    {label}
                </span>

            </div>

            <span
                className={`text-lg font-semibold tabular-nums ${ACCENTS[accent].text}`}
            >
                {value}
            </span>

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
    const height = 260;
    const paddingLeft = 36;
    const paddingRight = 24;
    const paddingTop = 28;
    const paddingBottom = 32;

    const innerWidth = width - paddingLeft - paddingRight;
    const innerHeight = height - paddingTop - paddingBottom;
    const baseline = paddingTop + innerHeight;

    const max = Math.max(
        ...data.map((item) => item.count),
        1
    );

    const points = data.map((item, index) => {
        const x =
            data.length === 1
                ? paddingLeft + innerWidth / 2
                : paddingLeft +
                (index / (data.length - 1)) * innerWidth;

        const y = baseline - (item.count / max) * innerHeight;

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

    const areaPath = `${path} L ${points[points.length - 1].x} ${baseline} L ${points[0].x} ${baseline} Z`;

    return (
        <div className="mt-6">

            <svg
                viewBox={`0 0 ${width} ${height}`}
                className="h-auto w-full"
                role="img"
                aria-label="Monthly enrollment activity"
            >

                <defs>
                    <linearGradient
                        id="enrollmentFill"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                    >
                        <stop
                            offset="0%"
                            stopColor="#0F9D8A"
                            stopOpacity="0.18"
                        />
                        <stop
                            offset="100%"
                            stopColor="#0F9D8A"
                            stopOpacity="0"
                        />
                    </linearGradient>
                </defs>


                {/* Grid + y-axis labels */}

                {[0, 1, 2, 3].map((line) => {
                    const y =
                        paddingTop + (line / 3) * innerHeight;

                    return (
                        <g key={line}>
                            <line
                                x1={paddingLeft}
                                x2={width - paddingRight}
                                y1={y}
                                y2={y}
                                stroke="#E2E8F0"
                                strokeWidth="1"
                                strokeDasharray={
                                    line === 3 ? undefined : "4 5"
                                }
                            />

                            <text
                                x={paddingLeft - 10}
                                y={y + 4}
                                textAnchor="end"
                                fontSize="11"
                                fill="#94A3B8"
                            >
                                {Math.round(max * (1 - line / 3))}
                            </text>
                        </g>
                    );
                })}


                {/* Area */}

                {points.length > 1 && (
                    <path d={areaPath} fill="url(#enrollmentFill)" />
                )}


                {/* Line */}

                <path
                    d={path}
                    fill="none"
                    stroke="#0F9D8A"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />


                {/* Points */}

                {points.map((point) => (
                    <g key={`${point.month}-${point.x}`}>

                        <circle
                            cx={point.x}
                            cy={point.y}
                            r="4.5"
                            fill="#FFFFFF"
                            stroke="#0F9D8A"
                            strokeWidth="2.5"
                        />

                        <text
                            x={point.x}
                            y={point.y - 12}
                            textAnchor="middle"
                            fontSize="11"
                            fontWeight="600"
                            fill="#0F172A"
                        >
                            {point.count}
                        </text>

                        <text
                            x={point.x}
                            y={height - 8}
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