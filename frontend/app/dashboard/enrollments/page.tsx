"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Student, Course, Enrollment } from "@/lib/types";

export default function EnrollmentsPage() {
    const [role, setRole] = useState("");

    const [students, setStudents] = useState<Student[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

    const [studentId, setStudentId] = useState("");
    const [courseId, setCourseId] = useState("");

    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const currentRole = localStorage.getItem("role") ?? "";
        setRole(currentRole);

        loadData(currentRole);
    }, []);

    async function loadData(currentRole: string) {
        try {
            setLoading(true);
            setError("");

            const coursesData =
                await api<Course[]>("/api/courses");

            const enrollmentsData =
                await api<Enrollment[]>("/api/enrollments");

            setCourses(coursesData);
            setEnrollments(enrollmentsData);

            // Only ADMIN needs the student list
            if (currentRole === "ADMIN") {
                const studentsData =
                    await api<Student[]>("/api/students");

                setStudents(studentsData);
            }
        } catch (e) {
            setError(
                e instanceof Error
                    ? e.message
                    : "Failed to load enrollment data"
            );
        } finally {
            setLoading(false);
        }
    }

    async function handleEnroll() {
        setError("");
        setSuccess("");

        if (!studentId || !courseId) {
            setError("Please select a student and a course.");
            return;
        }

        try {
            setCreating(true);

            await api("/api/enrollments", {
                method: "POST",
                body: JSON.stringify({
                    studentId: Number(studentId),
                    courseId: Number(courseId),
                }),
            });

            setSuccess("Student enrolled successfully.");

            setStudentId("");
            setCourseId("");

            await loadData("ADMIN");
        } catch (e) {
            setError(
                e instanceof Error
                    ? e.message
                    : "Failed to create enrollment"
            );
        } finally {
            setCreating(false);
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#DCE1E8] border-t-[#2563EB]" />

                    <p className="text-sm font-medium text-[#64748B]">
                        Loading enrollments...
                    </p>
                </div>
            </div>
        );
    }

    const isAdmin = role === "ADMIN";
    const isTeacher = role === "TEACHER";
    const isStudent = role === "STUDENT";

    return (
        <main className="mx-auto w-full max-w-[1400px]">

            {/* Header */}
            <header className="border-b border-[#DCE1E8] pb-6">

                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#D8E3F8] bg-[#EFF6FF] px-3 py-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB]" />

                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#1D4ED8]">
                        {isStudent
                            ? "Academic Overview"
                            : "Academic Management"}
                    </span>
                </div>

                <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#111827] sm:text-4xl">
                    {isStudent ? "My Enrollments" : "Enrollments"}
                </h1>

                <p className="mt-2 text-sm text-[#64748B]">
                    {isAdmin
                        ? "Assign students to courses and manage enrollment records."
                        : isTeacher
                        ? "View current student-course enrollment records."
                        : "View the courses you are currently enrolled in."}
                </p>
            </header>

            {/* Error */}
            {error && (
                <div className="mt-5 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm font-medium text-[#B91C1C]">
                    {error}
                </div>
            )}

            {/* Success */}
            {success && (
                <div className="mt-5 rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 text-sm font-medium text-[#15803D]">
                    {success}
                </div>
            )}

            {/* =========================================
                ADMIN — ENROLL STUDENT
            ========================================== */}

            {isAdmin && (
                <section className="mt-6 rounded-2xl border border-[#DCE1E8] bg-white p-5 shadow-[0_4px_18px_rgba(15,23,42,0.045)] sm:p-6">

                    <div>
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-[#2563EB]" />

                            <h2 className="text-base font-semibold text-[#111827]">
                                Enroll Student
                            </h2>
                        </div>

                        <p className="mt-1 text-sm text-[#64748B]">
                            Select a student and assign them to a course.
                        </p>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-2">

                        {/* Student */}
                        <div>
                            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-[#64748B]">
                                Student
                            </label>

                            <select
                                value={studentId}
                                onChange={(e) =>
                                    setStudentId(e.target.value)
                                }
                                className="w-full rounded-xl border border-[#DCE1E8] bg-white px-4 py-3 text-sm text-[#111827] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10"
                            >
                                <option value="">
                                    Select a student
                                </option>

                                {students.map((student) => (
                                    <option
                                        key={student.id}
                                        value={student.id}
                                    >
                                        {student.firstName}{" "}
                                        {student.lastName} —{" "}
                                        {student.email}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Course */}
                        <div>
                            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-[#64748B]">
                                Course
                            </label>

                            <select
                                value={courseId}
                                onChange={(e) =>
                                    setCourseId(e.target.value)
                                }
                                className="w-full rounded-xl border border-[#DCE1E8] bg-white px-4 py-3 text-sm text-[#111827] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10"
                            >
                                <option value="">
                                    Select a course
                                </option>

                                {courses.map((course) => (
                                    <option
                                        key={course.id}
                                        value={course.id}
                                    >
                                        {course.code} — {course.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                    </div>

                    <div className="mt-5 flex justify-end">
                        <button
                            onClick={handleEnroll}
                            disabled={creating}
                            className="rounded-xl bg-[#172033] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0F172A] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {creating
                                ? "Enrolling..."
                                : "Enroll Student"}
                        </button>
                    </div>

                </section>
            )}

            {/* =========================================
                ENROLLMENT RECORDS
            ========================================== */}

            <section
                className={`${
                    isAdmin ? "mt-4" : "mt-6"
                } rounded-2xl border border-[#DCE1E8] bg-white shadow-[0_4px_18px_rgba(15,23,42,0.045)]`}
            >

                <div className="border-b border-[#E2E8F0] p-5 sm:p-6">

                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-[#0F9D8A]" />

                        <h2 className="text-base font-semibold text-[#111827]">
                            {isStudent
                                ? "My Courses"
                                : "Enrollment Records"}
                        </h2>
                    </div>

                    <p className="mt-1 text-sm text-[#64748B]">
                        {isStudent
                            ? "Courses assigned to your student account."
                            : "Current student-course assignments."}
                    </p>
                </div>

                {enrollments.length === 0 ? (
                    <div className="p-10 text-center">

                        <p className="text-sm font-semibold text-[#111827]">
                            {isStudent
                                ? "You are not enrolled in any courses yet."
                                : "No enrollments yet."}
                        </p>

                        {isAdmin && (
                            <p className="mt-1 text-xs text-[#64748B]">
                                Enroll a student in a course above.
                            </p>
                        )}

                    </div>
                ) : (
                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[650px] text-left">

                            <thead className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                                <tr>

                                    {!isStudent && (
                                        <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#64748B]">
                                            Student
                                        </th>
                                    )}

                                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#64748B]">
                                        Course
                                    </th>

                                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#64748B]">
                                        Grade
                                    </th>

                                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#64748B]">
                                        Enrolled
                                    </th>

                                </tr>
                            </thead>

                            <tbody>

                                {enrollments.map((enrollment) => {

                                    const student = students.find(
                                        (item) =>
                                            item.id === enrollment.studentId
                                    );

                                    const course = courses.find(
                                        (item) =>
                                            item.id === enrollment.courseId
                                    );

                                    return (
                                        <tr
                                            key={enrollment.id}
                                            className="border-b border-[#EEF2F6] last:border-0"
                                        >

                                            {!isStudent && (
                                                <td className="px-5 py-4">

                                                    <p className="text-sm font-semibold text-[#111827]">
                                                        {student
                                                            ? `${student.firstName} ${student.lastName}`
                                                            : `Student #${enrollment.studentId}`}
                                                    </p>

                                                    {student && (
                                                        <p className="mt-0.5 text-xs text-[#64748B]">
                                                            {student.email}
                                                        </p>
                                                    )}

                                                </td>
                                            )}

                                            <td className="px-5 py-4">

                                                <p className="text-sm font-semibold text-[#111827]">
                                                    {course
                                                        ? course.name
                                                        : `Course #${enrollment.courseId}`}
                                                </p>

                                                {course && (
                                                    <p className="mt-0.5 text-xs font-medium text-[#2563EB]">
                                                        {course.code}
                                                    </p>
                                                )}

                                            </td>

                                            <td className="px-5 py-4">

                                                <span className="rounded-lg bg-[#F8FAFC] px-2.5 py-1 text-xs font-semibold text-[#64748B]">
                                                    {enrollment.grade ??
                                                        "Not graded"}
                                                </span>

                                            </td>

                                            <td className="px-5 py-4 text-sm text-[#64748B]">
                                                {new Date(
                                                    enrollment.enrolledAt
                                                ).toLocaleDateString()}
                                            </td>

                                        </tr>
                                    );
                                })}

                            </tbody>

                        </table>

                    </div>
                )}

            </section>

        </main>
    );
}