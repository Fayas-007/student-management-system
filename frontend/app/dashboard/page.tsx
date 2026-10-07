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

function PageHeader({
    email,
    role,
}: {
    email: string;
    role: string;
}) {
    return (
        <header className="flex flex-col justify-between gap-4 border-b border-[#E2E8F0] pb-6 sm:flex-row sm:items-end">

            <div className="min-w-0">
                <h1 className="text-3xl font-semibold tracking-[-0.03em] text-[#0F172A] sm:text-[34px]">
                    Dashboard
                </h1>

                <p className="mt-1.5 truncate text-sm text-[#64748B]">
                    Welcome back,{" "}
                    <span className="font-medium text-[#334155]">
                        {email}
                    </span>
                </p>
            </div>

            <div className="flex w-fit items-center gap-2.5 rounded-full border border-[#E2E8F0] bg-white py-1.5 pl-2 pr-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#172033] text-[11px] font-bold text-white">
                    {role.charAt(0)}
                </span>

                <span className="text-xs font-semibold tracking-wide text-[#334155]">
                    {role}
                </span>
            </div>

        </header>
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

            <PageHeader email={email} role="STUDENT" />


            {/* Main Student Metrics */}
            <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

                <StudentMetricCard
                    label="Available courses"
                    value={courses.length}
                    description="Courses available in the system"
                    accent="blue"
                    icon={BookOpen}
                />

                <StudentMetricCard
                    label="My enrollments"
                    value={enrollments.length}
                    description="Your enrollment records"
                    accent="teal"
                    icon={ClipboardList}
                />

                <StudentMetricCard
                    label="Current role"
                    valueLabel="STUDENT"
                    description="Your account role"
                    accent="coral"
                    icon={GraduationCap}
                />

            </section>


            {/* Student Actions */}
            <section className="mt-3 grid gap-3 lg:grid-cols-3">

                <ActionCard
                    href="/dashboard/profile"
                    title="My Profile"
                    description="View and manage your student profile."
                    cta="View profile"
                    accent="blue"
                    icon={UserIcon}
                />

                <ActionCard
                    href="/dashboard/courses"
                    title="My Courses"
                    description="Browse available courses and manage your courses."
                    cta="View courses"
                    accent="teal"
                    icon={BookOpen}
                />

                <ActionCard
                    href="/dashboard/enrollments"
                    title="My Enrollments"
                    description="View your course enrollments and grades."
                    cta="View enrollments"
                    accent="coral"
                    icon={ClipboardList}
                />

            </section>


            {/* Student Overview */}
            <section className={`${CARD} mt-3 p-5 sm:p-6`}>

                <h2 className="text-base font-semibold text-[#0F172A]">
                    Student overview
                </h2>

                <p className="mt-1 text-sm text-[#64748B]">
                    Your academic information will appear here as you enroll
                    in courses.
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">

                    <div className="rounded-xl bg-[#F8FAFC] p-5 ring-1 ring-inset ring-[#E2E8F0]">
                        <p className="text-xs font-medium text-[#64748B]">
                            Enrollments
                        </p>

                        <p className="mt-2 text-2xl font-semibold tabular-nums text-[#0F172A]">
                            {enrollments.length}
                        </p>

                        <p className="mt-1 text-xs text-[#94A3B8]">
                            Total courses enrolled
                        </p>
                    </div>

                    <div className="rounded-xl bg-[#F8FAFC] p-5 ring-1 ring-inset ring-[#E2E8F0]">
                        <p className="text-xs font-medium text-[#64748B]">
                            Courses
                        </p>

                        <p className="mt-2 text-2xl font-semibold tabular-nums text-[#0F172A]">
                            {courses.length}
                        </p>

                        <p className="mt-1 text-xs text-[#94A3B8]">
                            Available courses
                        </p>
                    </div>

                </div>

            </section>

        </div>
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
    accent: "blue" | "teal" | "coral";
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