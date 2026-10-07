"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Course, Enrollment } from "@/lib/types";

export default function CoursesPage() {
    const [role, setRole] = useState("");
    const [courses, setCourses] = useState<Course[]>([]);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const currentRole = localStorage.getItem("role") ?? "";
        setRole(currentRole);

        async function loadCourses() {
            try {
                setLoading(true);
                setError("");

                const coursesData =
                    await api<Course[]>("/api/courses");

                setCourses(coursesData);

                if (currentRole === "STUDENT") {
                    const enrollmentsData =
                        await api<Enrollment[]>("/api/enrollments");

                    setEnrollments(enrollmentsData);
                }
            } catch (e) {
                setError(
                    e instanceof Error
                        ? e.message
                        : "Failed to load courses"
                );
            } finally {
                setLoading(false);
            }
        }

        loadCourses();
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#DCE1E8] border-t-[#2563EB]" />

                    <p className="text-sm font-medium text-[#64748B]">
                        Loading courses...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mx-auto w-full max-w-[1400px]">
                <div className="rounded-2xl border border-[#FECACA] bg-[#FEF2F2] p-6">
                    <h2 className="text-sm font-semibold text-[#991B1B]">
                        Unable to load courses
                    </h2>

                    <p className="mt-1 text-sm text-[#B91C1C]">
                        {error}
                    </p>
                </div>
            </div>
        );
    }

    const isStudent = role === "STUDENT";

    /*
     * Students should only see courses they are enrolled in.
     */
    const myCourses = courses.filter((course) =>
        enrollments.some(
            (enrollment) =>
                enrollment.courseId === course.id
        )
    );

    const displayedCourses = isStudent
        ? myCourses
        : courses;

    return (
        <main className="mx-auto w-full max-w-[1400px]">

            {/* Header */}
            <header className="border-b border-[#DCE1E8] pb-6">

                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#D8E3F8] bg-[#EFF6FF] px-3 py-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB]" />

                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#1D4ED8]">
                        {isStudent
                            ? "Academic Portal"
                            : "Academic Management"}
                    </span>
                </div>

                <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#111827] sm:text-4xl">
                    {isStudent ? "My Courses" : "Courses"}
                </h1>

                <p className="mt-2 text-sm text-[#64748B]">
                    {isStudent
                        ? "Courses assigned to your student account."
                        : "View and manage courses available in the system."}
                </p>

            </header>

            {/* Summary */}
            <section className="mt-6 grid gap-3 sm:grid-cols-2">

                <div className="relative overflow-hidden rounded-2xl border border-[#DCE1E8] bg-white p-5 shadow-[0_4px_18px_rgba(15,23,42,0.04)]">

                    <div className="absolute left-0 top-0 h-full w-1 bg-[#2563EB]" />

                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#64748B]">
                        {isStudent
                            ? "My Courses"
                            : "Total Courses"}
                    </p>

                    <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#111827]">
                        {displayedCourses.length}
                    </p>

                    <p className="mt-1 text-xs text-[#64748B]">
                        {isStudent
                            ? "Courses currently assigned to you"
                            : "Courses in the system"}
                    </p>

                </div>

                {isStudent && (
                    <div className="relative overflow-hidden rounded-2xl border border-[#DCE1E8] bg-white p-5 shadow-[0_4px_18px_rgba(15,23,42,0.04)]">

                        <div className="absolute left-0 top-0 h-full w-1 bg-[#0F9D8A]" />

                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#64748B]">
                            Enrollments
                        </p>

                        <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#111827]">
                            {enrollments.length}
                        </p>

                        <p className="mt-1 text-xs text-[#64748B]">
                            Your current enrollment records
                        </p>

                    </div>
                )}

            </section>

            {/* Course list */}
            <section className="mt-4 overflow-hidden rounded-2xl border border-[#DCE1E8] bg-white shadow-[0_4px_18px_rgba(15,23,42,0.045)]">

                <div className="border-b border-[#E2E8F0] p-5 sm:p-6">

                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-[#0F9D8A]" />

                        <h2 className="text-base font-semibold text-[#111827]">
                            {isStudent
                                ? "Enrolled Courses"
                                : "Course Directory"}
                        </h2>
                    </div>

                    <p className="mt-1 text-sm text-[#64748B]">
                        {isStudent
                            ? "Your assigned courses and academic information."
                            : "Courses currently registered in NEXORA."}
                    </p>

                </div>

                {displayedCourses.length === 0 ? (
                    <div className="p-12 text-center">

                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EFF6FF] text-sm font-bold text-[#2563EB]">
                            C
                        </div>

                        <h3 className="mt-4 text-sm font-semibold text-[#111827]">
                            {isStudent
                                ? "No courses assigned yet"
                                : "No courses yet"}
                        </h3>

                        <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-[#64748B]">
                            {isStudent
                                ? "Your assigned courses will appear here once an administrator enrolls you."
                                : "Courses added to the system will appear here."}
                        </p>

                    </div>
                ) : (
                    <div className="grid gap-4 p-5 sm:p-6 md:grid-cols-2 xl:grid-cols-3">

                        {displayedCourses.map((course) => {

                            const enrollment =
                                enrollments.find(
                                    (item) =>
                                        item.courseId === course.id
                                );

                            return (
                                <article
                                    key={course.id}
                                    className="group rounded-2xl border border-[#E2E8F0] bg-[#FBFCFE] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#CBD5E1] hover:bg-white hover:shadow-[0_8px_24px_rgba(15,23,42,0.07)]"
                                >

                                    <div className="flex items-start justify-between gap-4">

                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] text-sm font-bold text-[#2563EB]">
                                            C
                                        </div>

                                        {isStudent && (
                                            <span className="rounded-full bg-[#ECFDF8] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#087F70]">
                                                Enrolled
                                            </span>
                                        )}

                                    </div>

                                    <p className="mt-5 text-xs font-bold uppercase tracking-[0.12em] text-[#2563EB]">
                                        {course.code}
                                    </p>

                                    <h3 className="mt-2 text-lg font-semibold tracking-[-0.025em] text-[#111827]">
                                        {course.name}
                                    </h3>

                                    <p className="mt-2 min-h-[48px] text-sm leading-6 text-[#64748B]">
                                        {course.description ??
                                            "No course description available."}
                                    </p>

                                    <div className="mt-5 flex items-center justify-between border-t border-[#E2E8F0] pt-4">

                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                                                Credits
                                            </p>

                                            <p className="mt-1 text-sm font-semibold text-[#111827]">
                                                {course.credits}
                                            </p>
                                        </div>

                                        {isStudent && enrollment && (
                                            <div className="text-right">

                                                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                                                    Grade
                                                </p>

                                                <p className="mt-1 text-sm font-semibold text-[#111827]">
                                                    {enrollment.grade ??
                                                        "Pending"}
                                                </p>

                                            </div>
                                        )}

                                    </div>

                                </article>
                            );
                        })}

                    </div>
                )}

            </section>

        </main>
    );
}