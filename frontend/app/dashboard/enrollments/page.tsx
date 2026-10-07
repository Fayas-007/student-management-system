"use client";

import { useEffect, useState } from "react";

import { api } from "@/lib/api";

import type { Student, Course, Enrollment } from "@/lib/types";

export default function EnrollmentsPage() {
    const [role, setRole] = useState("");

    const [students, setStudents] = useState<Student[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

    // Create / edit form
    const [studentId, setStudentId] = useState("");
    const [courseId, setCourseId] = useState("");
    const [grade, setGrade] = useState("");

    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [formError, setFormError] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [editingEnrollment, setEditingEnrollment] =
        useState<Enrollment | null>(null);

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

    // ============================================================
    // CREATE ENROLLMENT
    // ============================================================

    async function handleEnroll() {
        setError("");
        setSuccess("");
        setFormError("");

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

    // ============================================================
    // OPEN EDIT MODAL
    // ============================================================

    function openEditModal(enrollment: Enrollment) {
        setEditingEnrollment(enrollment);

        setStudentId(String(enrollment.studentId));
        setCourseId(String(enrollment.courseId));
        setGrade(enrollment.grade ?? "");

        setFormError("");
        setError("");
        setSuccess("");

        setShowModal(true);
    }

    // ============================================================
    // CLOSE EDIT MODAL
    // ============================================================

    function closeModal() {
        if (saving) return;

        setShowModal(false);
        setEditingEnrollment(null);

        setStudentId("");
        setCourseId("");
        setGrade("");

        setFormError("");
    }

    // ============================================================
    // UPDATE ENROLLMENT
    // ============================================================

    async function handleUpdate() {
        setError("");
        setSuccess("");
        setFormError("");

        if (!studentId || !courseId) {
            setFormError("Please select a student and a course.");
            return;
        }

        if (!editingEnrollment) {
            return;
        }

        try {
            setSaving(true);

            const updated = await api<Enrollment>(
                `/api/enrollments/${editingEnrollment.id}`,
                {
                    method: "PUT",
                    body: JSON.stringify({
                        studentId: Number(studentId),
                        courseId: Number(courseId),
                        grade: grade.trim() || null,
                    }),
                }
            );

            setEnrollments((current) =>
                current.map((enrollment) =>
                    enrollment.id === updated.id
                        ? updated
                        : enrollment
                )
            );

            setSuccess("Enrollment updated successfully.");

            closeModal();
        } catch (e) {
            setFormError(
                e instanceof Error
                    ? e.message
                    : "Failed to update enrollment"
            );
        } finally {
            setSaving(false);
        }
    }

    // ============================================================
    // DELETE ENROLLMENT
    // ============================================================

    async function handleDelete(enrollment: Enrollment) {
        const student = students.find(
            (item) => item.id === enrollment.studentId
        );

        const course = courses.find(
            (item) => item.id === enrollment.courseId
        );

        const studentName = student
            ? `${student.firstName} ${student.lastName}`
            : `Student #${enrollment.studentId}`;

        const courseName = course
            ? course.name
            : `Course #${enrollment.courseId}`;

        const confirmed = window.confirm(
            `Delete enrollment for "${studentName}" in "${courseName}"?\n\nThis action cannot be undone.`
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeleting(true);
            setError("");
            setSuccess("");

            await api(`/api/enrollments/${enrollment.id}`, {
                method: "DELETE",
            });

            setEnrollments((current) =>
                current.filter(
                    (item) => item.id !== enrollment.id
                )
            );

            setSuccess("Enrollment deleted successfully.");
        } catch (e) {
            setError(
                e instanceof Error
                    ? e.message
                    : "Failed to delete enrollment"
            );
        } finally {
            setDeleting(false);
        }
    }

    // ============================================================
    // LOADING
    // ============================================================

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

            {/* =====================================================
                HEADER
            ====================================================== */}

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

            {/* =====================================================
                SUCCESS MESSAGE
            ====================================================== */}

            {success && (
                <div className="mt-5 flex items-center justify-between rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3">

                    <p className="text-sm font-medium text-[#166534]">
                        {success}
                    </p>

                    <button
                        type="button"
                        onClick={() => setSuccess("")}
                        className="ml-4 text-lg font-semibold leading-none text-[#166534] transition hover:text-[#14532D]"
                        aria-label="Dismiss success message"
                    >
                        ×
                    </button>

                </div>
            )}

            {/* =====================================================
                ERROR MESSAGE
            ====================================================== */}

            {error && (
                <div className="mt-5 flex items-center justify-between rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3">

                    <p className="text-sm font-medium text-[#B91C1C]">
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={() => setError("")}
                        className="ml-4 text-lg font-semibold leading-none text-[#B91C1C] transition hover:text-[#7F1D1D]"
                        aria-label="Dismiss error message"
                    >
                        ×
                    </button>

                </div>
            )}

            {/* =====================================================
                ADMIN — CREATE ENROLLMENT
            ====================================================== */}

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

                    {/* CREATE FORM */}

                    <div className="mt-6 grid gap-4 md:grid-cols-2">

                        {/* STUDENT */}

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

                        {/* COURSE */}

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
                            type="button"
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

            {/* =====================================================
                ENROLLMENT RECORDS
            ====================================================== */}

            <section
                className={`${
                    isAdmin ? "mt-4" : "mt-6"
                } overflow-hidden rounded-2xl border border-[#DCE1E8] bg-white shadow-[0_4px_18px_rgba(15,23,42,0.045)]`}
            >

                <div className="border-b border-[#E2E8F0] px-5 py-4 sm:px-6">

                    <div className="flex items-center justify-between gap-4">

                        <div>

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

                        <span className="text-xs font-medium text-[#64748B]">
                            {enrollments.length}{" "}
                            {enrollments.length === 1
                                ? "record"
                                : "records"}
                        </span>

                    </div>

                </div>

                {enrollments.length === 0 ? (

                    <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">

                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-[#E5E7EB] bg-[#F8F9FB] text-[#9CA3AF]">
                            —
                        </div>

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

                        <table className="w-full min-w-[850px] text-left">

                            {/* TABLE HEADER */}

                            <thead>

                                <tr className="border-b border-[#1E293B] bg-[#111827]">

                                    {!isStudent && (
                                        <th className="px-4 py-3.5 text-[11px] font-bold uppercase tracking-[0.1em] text-white">
                                            Student
                                        </th>
                                    )}

                                    <th className="px-4 py-3.5 text-[11px] font-bold uppercase tracking-[0.1em] text-white">
                                        Course
                                    </th>

                                    <th className="px-4 py-3.5 text-[11px] font-bold uppercase tracking-[0.1em] text-white">
                                        Grade
                                    </th>

                                    <th className="px-4 py-3.5 text-[11px] font-bold uppercase tracking-[0.1em] text-white">
                                        Enrolled
                                    </th>

                                    {isAdmin && (
                                        <th className="px-4 py-3.5 text-right text-[11px] font-bold uppercase tracking-[0.1em] text-white">
                                            Actions
                                        </th>
                                    )}

                                </tr>

                            </thead>

                            {/* TABLE BODY */}

                            <tbody>

                                {enrollments.map(
                                    (enrollment, index) => {

                                        const student =
                                            students.find(
                                                (item) =>
                                                    item.id ===
                                                    enrollment.studentId
                                            );

                                        const course =
                                            courses.find(
                                                (item) =>
                                                    item.id ===
                                                    enrollment.courseId
                                            );

                                        return (
                                            <tr
                                                key={enrollment.id}
                                                className={`border-b border-[#EEF1F5] transition-colors last:border-b-0 hover:bg-[#F5F8FC] ${
                                                    index % 2 === 1
                                                        ? "bg-[#FCFDFE]"
                                                        : "bg-white"
                                                }`}
                                            >

                                                {/* STUDENT */}

                                                {!isStudent && (
                                                    <td className="px-4 py-3.5">

                                                        <div>

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

                                                        </div>

                                                    </td>
                                                )}

                                                {/* COURSE */}

                                                <td className="px-4 py-3.5">

                                                    <div>

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

                                                    </div>

                                                </td>

                                                {/* GRADE */}

                                                <td className="px-4 py-3.5">

                                                    <span className="inline-flex rounded-lg bg-[#F8FAFC] px-2.5 py-1 text-xs font-semibold text-[#64748B]">
                                                        {enrollment.grade ??
                                                            "Not graded"}
                                                    </span>

                                                </td>

                                                {/* ENROLLED */}

                                                <td className="px-4 py-3.5">

                                                    <span className="text-xs text-[#64748B]">
                                                        {new Date(
                                                            enrollment.enrolledAt
                                                        ).toLocaleDateString()}
                                                    </span>

                                                </td>

                                                {/* ACTIONS */}

                                                {isAdmin && (
                                                    <td className="px-4 py-3.5">

                                                        <div className="flex justify-end gap-2">

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    openEditModal(
                                                                        enrollment
                                                                    )
                                                                }
                                                                disabled={
                                                                    deleting
                                                                }
                                                                className="rounded-lg border border-[#DCE1E8] bg-white px-3 py-1.5 text-xs font-semibold text-[#334155] transition hover:border-[#2563EB] hover:text-[#2563EB] disabled:cursor-not-allowed disabled:opacity-50"
                                                            >
                                                                Edit
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        enrollment
                                                                    )
                                                                }
                                                                disabled={
                                                                    deleting
                                                                }
                                                                className="rounded-lg border border-[#FECACA] bg-white px-3 py-1.5 text-xs font-semibold text-[#DC2626] transition hover:bg-[#FEF2F2] disabled:cursor-not-allowed disabled:opacity-50"
                                                            >
                                                                {deleting
                                                                    ? "Deleting..."
                                                                    : "Delete"}
                                                            </button>

                                                        </div>

                                                    </td>
                                                )}

                                            </tr>
                                        );
                                    }
                                )}

                            </tbody>

                        </table>

                    </div>
                )}

            </section>

            {/* =====================================================
                EDIT ENROLLMENT MODAL
            ====================================================== */}

            {showModal &&
                isAdmin &&
                editingEnrollment && (

                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/45 px-4 py-6 backdrop-blur-[2px]">

                        <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_20px_60px_rgba(15,23,42,0.18)]">

                            {/* MODAL HEADER */}

                            <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-5">

                                <div>

                                    <h2 className="text-lg font-semibold text-[#111827]">
                                        Edit Enrollment
                                    </h2>

                                    <p className="mt-1 text-sm text-[#64748B]">
                                        Update the student, course or grade.
                                    </p>

                                </div>

                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={saving}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-lg text-[#64748B] transition hover:bg-[#F1F5F9] hover:text-[#111827]"
                                    aria-label="Close edit modal"
                                >
                                    ×
                                </button>

                            </div>

                            {/* MODAL FORM */}

                            <div className="p-6">

                                {formError && (
                                    <div className="mb-5 flex items-center justify-between rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3">

                                        <p className="text-sm font-medium text-[#B91C1C]">
                                            {formError}
                                        </p>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setFormError("")
                                            }
                                            className="ml-4 text-lg font-semibold leading-none text-[#B91C1C]"
                                            aria-label="Dismiss form error"
                                        >
                                            ×
                                        </button>

                                    </div>
                                )}

                                <div className="grid gap-5 sm:grid-cols-2">

                                    {/* STUDENT */}

                                    <div className="sm:col-span-2">

                                        <label className="mb-1.5 block text-xs font-semibold text-[#374151]">
                                            Student{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>

                                        <select
                                            value={studentId}
                                            onChange={(e) =>
                                                setStudentId(
                                                    e.target.value
                                                )
                                            }
                                            className="h-11 w-full rounded-xl border border-[#DCE1E8] bg-white px-3 text-sm text-[#111827] outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10"
                                        >

                                            <option value="">
                                                Select student
                                            </option>

                                            {students.map(
                                                (student) => (
                                                    <option
                                                        key={student.id}
                                                        value={
                                                            student.id
                                                        }
                                                    >
                                                        {
                                                            student.firstName
                                                        }{" "}
                                                        {
                                                            student.lastName
                                                        }{" "}
                                                        —{" "}
                                                        {
                                                            student.email
                                                        }
                                                    </option>
                                                )
                                            )}

                                        </select>

                                    </div>

                                    {/* COURSE */}

                                    <div className="sm:col-span-2">

                                        <label className="mb-1.5 block text-xs font-semibold text-[#374151]">
                                            Course{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>

                                        <select
                                            value={courseId}
                                            onChange={(e) =>
                                                setCourseId(
                                                    e.target.value
                                                )
                                            }
                                            className="h-11 w-full rounded-xl border border-[#DCE1E8] bg-white px-3 text-sm text-[#111827] outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10"
                                        >

                                            <option value="">
                                                Select course
                                            </option>

                                            {courses.map(
                                                (course) => (
                                                    <option
                                                        key={course.id}
                                                        value={
                                                            course.id
                                                        }
                                                    >
                                                        {course.code} —{" "}
                                                        {course.name}
                                                    </option>
                                                )
                                            )}

                                        </select>

                                    </div>

                                    {/* GRADE — ONLY DURING EDIT */}

                                    <div>

                                        <label className="mb-1.5 block text-xs font-semibold text-[#374151]">
                                            Grade
                                        </label>

                                        <input
                                            type="text"
                                            value={grade}
                                            onChange={(e) =>
                                                setGrade(
                                                    e.target.value
                                                )
                                            }
                                            maxLength={5}
                                            placeholder="e.g. A"
                                            className="h-11 w-full rounded-xl border border-[#DCE1E8] bg-white px-3 text-sm text-[#111827] outline-none transition placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10"
                                        />

                                    </div>

                                </div>

                                {/* MODAL ACTIONS */}

                                <div className="mt-6 flex justify-end gap-3 border-t border-[#E5E7EB] pt-5">

                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        disabled={saving}
                                        className="rounded-xl border border-[#DCE1E8] bg-white px-4 py-2.5 text-sm font-semibold text-[#475569] transition hover:bg-[#F8FAFC]"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleUpdate}
                                        disabled={saving}
                                        className="rounded-xl bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {saving
                                            ? "Saving..."
                                            : "Save Changes"}
                                    </button>

                                </div>

                            </div>

                        </div>

                    </div>
                )}

        </main>
    );
}