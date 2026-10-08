"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import { api } from "@/lib/api";

import type { Course } from "@/lib/types";

import {
    ArrowUpRight,
    Award,
    BookOpen,
    Clock3,
    GraduationCap,
    Search,
    Sparkles,
} from "lucide-react";

type Department = {
    id: number;
    name: string;
    description?: string | null;
    createdAt?: string;
};

type CourseForm = {
    departmentId: string;
    code: string;
    name: string;
    description: string;
    credits: string;
};

const emptyForm: CourseForm = {
    departmentId: "",
    code: "",
    name: "",
    description: "",
    credits: "3",
};

export default function CoursesPage() {
    const [role, setRole] = useState("");

    const [courses, setCourses] = useState<Course[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [formError, setFormError] = useState("");

    const [search, setSearch] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);

    // Delete confirmation modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
    const [deleteEnrollmentCount, setDeleteEnrollmentCount] = useState(0);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const [form, setForm] = useState<CourseForm>(emptyForm);

    const isStudent = role === "STUDENT";
    const canManage = role === "ADMIN" || role === "TEACHER";

    useEffect(() => {
        const currentRole = localStorage.getItem("role") ?? "";

        setRole(currentRole);
        loadData(currentRole);
    }, []);

    async function loadData(currentRole: string) {
        try {
            setLoading(true);
            setError("");
            setSuccess("");

            /*
             * ========================================================
             * STUDENT
             * ========================================================
             *
             * Students only receive their enrolled courses.
             */

            if (currentRole === "STUDENT") {
                const myCourses = await api<Course[]>(
                    "/api/students/me/courses"
                );

                setCourses(myCourses);
                setDepartments([]);

                return;
            }

            /*
             * ========================================================
             * ADMIN / TEACHER
             * ========================================================
             *
             * Admin and Teacher can see the complete course directory.
             */

            const coursesData = await api<Course[]>("/api/courses");

            setCourses(coursesData);

            const departmentsData =
                await api<Department[]>("/api/departments");

            setDepartments(departmentsData);
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

    const filteredCourses = useMemo(() => {
        const query = search.trim().toLowerCase();

        return courses.filter((course) => {
            const matchesSearch =
                !query ||
                course.code.toLowerCase().includes(query) ||
                course.name.toLowerCase().includes(query) ||
                (course.description ?? "")
                    .toLowerCase()
                    .includes(query);

            const matchesDepartment =
                !departmentFilter ||
                String(course.departmentId) === departmentFilter;

            return matchesSearch && matchesDepartment;
        });
    }, [courses, search, departmentFilter]);

    function getDepartmentName(departmentId: number | null) {
        if (departmentId === null) {
            return "No Department";
        }

        return (
            departments.find(
                (department) => department.id === departmentId
            )?.name ?? "Unknown"
        );
    }

    function openCreateModal() {
        if (!canManage) return;

        setEditingCourse(null);
        setForm(emptyForm);
        setFormError("");
        setError("");
        setSuccess("");
        setShowModal(true);
    }

    function openEditModal(course: Course) {
        if (!canManage) return;

        setEditingCourse(course);

        setForm({
            departmentId: String(course.departmentId),
            code: course.code,
            name: course.name,
            description: course.description ?? "",
            credits: String(course.credits),
        });

        setFormError("");
        setError("");
        setSuccess("");
        setShowModal(true);
    }

    function closeModal() {
        if (saving) return;

        setShowModal(false);
        setEditingCourse(null);
        setForm(emptyForm);
        setFormError("");
    }

    function updateField(
        field: keyof CourseForm,
        value: string
    ) {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));
    }

    function validateForm() {
        if (!form.departmentId) {
            return "Department is required.";
        }

        if (!form.code.trim()) {
            return "Course code is required.";
        }

        if (!form.name.trim()) {
            return "Course name is required.";
        }

        const credits = Number(form.credits);

        if (!form.credits || Number.isNaN(credits)) {
            return "Credits are required.";
        }

        if (credits < 1 || credits > 10) {
            return "Credits must be between 1 and 10.";
        }

        return "";
    }

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if (!canManage) return;

        const validationError = validateForm();

        if (validationError) {
            setFormError(validationError);
            return;
        }

        try {
            setSaving(true);
            setFormError("");
            setError("");
            setSuccess("");

            const payload = {
                departmentId: Number(form.departmentId),
                code: form.code.trim().toUpperCase(),
                name: form.name.trim(),
                description: form.description.trim() || null,
                credits: Number(form.credits),
            };

            if (editingCourse) {
                const updated = await api<Course>(
                    `/api/courses/${editingCourse.id}`,
                    {
                        method: "PUT",
                        body: JSON.stringify(payload),
                    }
                );

                setCourses((current) =>
                    current.map((course) =>
                        course.id === updated.id
                            ? updated
                            : course
                    )
                );

                setSuccess("Course updated successfully.");
            } else {
                const created = await api<Course>(
                    "/api/courses",
                    {
                        method: "POST",
                        body: JSON.stringify(payload),
                    }
                );

                setCourses((current) => [
                    created,
                    ...current,
                ]);

                setSuccess("Course created successfully.");
            }

            closeModal();
        } catch (e) {
            setFormError(
                e instanceof Error
                    ? e.message
                    : "Failed to save course"
            );
        } finally {
            setSaving(false);
        }
    }

    /*
     * ========================================================
     * DELETE COURSE
     * ========================================================
     *
     * First check how many enrollment records belong to the
     * course. Then open our custom confirmation modal.
     *
     * No browser window.confirm() is used.
     */

    async function handleDelete(course: Course) {
        if (!canManage) return;

        try {
            setError("");
            setSuccess("");

            const enrollments = await api<
                { id: number; courseId: number }[]
            >("/api/enrollments");

            const enrollmentCount = enrollments.filter(
                (enrollment) =>
                    enrollment.courseId === course.id
            ).length;

            setDeletingCourse(course);
            setDeleteEnrollmentCount(enrollmentCount);
            setShowDeleteModal(true);
        } catch (e) {
            setError(
                e instanceof Error
                    ? e.message
                    : "Failed to check course enrollments"
            );
        }
    }

    async function confirmDeleteCourse() {
        if (!deletingCourse) return;

        try {
            setDeleteLoading(true);
            setError("");
            setSuccess("");

            await api(`/api/courses/${deletingCourse.id}`, {
                method: "DELETE",
            });

            setCourses((current) =>
                current.filter(
                    (item) =>
                        item.id !== deletingCourse.id
                )
            );

            setShowDeleteModal(false);
            setDeletingCourse(null);
            setDeleteEnrollmentCount(0);

            setSuccess("Course deleted successfully.");
        } catch (e) {
            setError(
                e instanceof Error
                    ? e.message
                    : "Failed to delete course"
            );
        } finally {
            setDeleteLoading(false);
        }
    }

    function closeDeleteModal() {
        if (deleteLoading) return;

        setShowDeleteModal(false);
        setDeletingCourse(null);
        setDeleteEnrollmentCount(0);
    }

    /*
     * ============================================================
     * LOADING
     * ============================================================
     */

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

    /*
     * ============================================================
     * STUDENT — MY COURSES
     * ============================================================
     */

    if (isStudent) {
        return (
            <main className="mx-auto w-full max-w-[1400px]">

                {/* ==================================================
                    STUDENT HERO
                ================================================== */}

                <section className="relative overflow-hidden rounded-[28px] bg-[#0F172A] px-6 py-8 shadow-[0_20px_50px_rgba(15,23,42,0.12)] sm:px-8 sm:py-10 lg:px-10">

                    {/* Decorative shapes */}

                    <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#2563EB]/20 blur-3xl" />

                    <div className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-[#38BDF8]/10 blur-3xl" />

                    <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">

                        <div className="max-w-2xl">

                            {/* Label */}

                            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5">

                                <Sparkles className="h-3.5 w-3.5 text-[#60A5FA]" />

                                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#CBD5E1]">
                                    Student Learning Space
                                </span>

                            </div>

                            {/* Heading */}

                            <h1 className="text-3xl font-bold leading-tight tracking-[-0.035em] text-white sm:text-4xl lg:text-[48px]">
                                Keep learning.
                                <br />
                                <span className="text-[#60A5FA]">
                                    Keep moving forward.
                                </span>
                            </h1>

                            {/* Description */}

                            <p className="mt-4 max-w-xl text-sm leading-6 text-[#94A3B8] sm:text-base">
                                Your enrolled courses, academic progress
                                and learning resources — all in one place.
                            </p>

                        </div>

                        {/* Course count */}

                        <div className="relative w-fit rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4 backdrop-blur-sm">

                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#94A3B8]">
                                Currently enrolled
                            </p>

                            <div className="mt-1 flex items-end gap-2">

                                <span className="text-3xl font-bold text-white">
                                    {courses.length}
                                </span>

                                <span className="mb-1 text-sm text-[#94A3B8]">
                                    {courses.length === 1
                                        ? "course"
                                        : "courses"}
                                </span>

                            </div>

                        </div>

                    </div>

                </section>

                {/* ==================================================
                    ERROR
                ================================================== */}

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

                {/* ==================================================
                    EMPTY STATE
                ================================================== */}

                {courses.length === 0 ? (
                    <section className="mt-8 overflow-hidden rounded-[24px] border border-[#E2E8F0] bg-white shadow-[0_8px_30px_rgba(15,23,42,0.05)]">

                        <div className="flex min-h-[430px] flex-col items-center justify-center px-6 text-center">

                            <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#EFF6FF]">

                                <GraduationCap className="h-9 w-9 text-[#2563EB]" />

                                <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#2563EB] text-xs text-white">
                                    +
                                </span>

                            </div>

                            <h2 className="text-xl font-bold tracking-tight text-[#0F172A]">
                                Your learning journey starts here
                            </h2>

                            <p className="mt-2 max-w-md text-sm leading-6 text-[#64748B]">
                                You don't have any enrolled courses yet.
                                Browse the course catalog and request a
                                course to start learning.
                            </p>

                        </div>

                    </section>
                ) : (
                    <>
                        {/* ==================================================
                            COURSE SECTION
                        ================================================== */}

                        <section className="mt-10">

                            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

                                <div>

                                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#2563EB]">
                                        My Learning
                                    </p>

                                    <h2 className="mt-1 text-2xl font-bold tracking-[-0.025em] text-[#0F172A]">
                                        Your courses
                                    </h2>

                                    <p className="mt-1 text-sm text-[#64748B]">
                                        Continue with the courses you're
                                        currently enrolled in.
                                    </p>

                                </div>

                                <span className="text-xs font-medium text-[#94A3B8]">
                                    {courses.length}{" "}
                                    {courses.length === 1
                                        ? "course"
                                        : "courses"}
                                </span>

                            </div>

                            {/* Course cards */}

                            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

                                {courses.map((course, index) => (
                                    <StudentCourseCard
                                        key={course.id}
                                        course={course}
                                        index={index}
                                    />
                                ))}

                            </div>

                        </section>
                    </>
                )}

            </main>
        );
    }

    /*
     * ============================================================
     * ADMIN / TEACHER — COURSE MANAGEMENT
     * ============================================================
     */

    return (
        <main className="mx-auto w-full max-w-[1400px]">

            {/* HEADER */}

            <header className="border-b border-[#DCE1E8] pb-6">

                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#D8E3F8] bg-[#EFF6FF] px-3 py-1.5">

                    <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB]" />

                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#1D4ED8]">
                        Academic Management
                    </span>

                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

                    <div>

                        <h1 className="mt-3 text-[42px] font-bold leading-[1.05] tracking-[-0.03em] text-[#0F172A] sm:text-[46px]">
                            Courses
                        </h1>

                        <p className="mt-2 text-sm text-[#64748B]">
                            View and manage courses available in
                            the system.
                        </p>

                    </div>

                    {canManage && (
                        <button
                            onClick={openCreateModal}
                            className="inline-flex h-10 items-center justify-center rounded-xl bg-[#2563EB] px-4 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(37,99,235,0.18)] transition hover:bg-[#1D4ED8]"
                        >
                            + Add Course
                        </button>
                    )}

                </div>

            </header>

            {/* SUCCESS MESSAGE */}

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

            {/* ERROR MESSAGE */}

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

            {/* FILTERS */}

            <section className="mt-6 rounded-2xl border border-[#DCE1E8] bg-white p-4 shadow-[0_4px_18px_rgba(15,23,42,0.04)]">

                <div className="flex flex-col gap-3 md:flex-row">

                    <div className="relative flex-1">

                        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            placeholder="Search by course code, name or description..."
                            className="h-11 w-full rounded-xl border border-[#DCE1E8] bg-[#FBFCFE] pl-11 pr-4 text-sm text-[#111827] outline-none transition placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10"
                        />

                    </div>

                    <select
                        value={departmentFilter}
                        onChange={(e) =>
                            setDepartmentFilter(e.target.value)
                        }
                        className="h-11 rounded-xl border border-[#DCE1E8] bg-[#FBFCFE] px-4 text-sm text-[#111827] outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 md:w-64"
                    >
                        <option value="">
                            All Departments
                        </option>

                        {departments.map((department) => (
                            <option
                                key={department.id}
                                value={department.id}
                            >
                                {department.name}
                            </option>
                        ))}
                    </select>

                </div>

            </section>

            {/* COURSE TABLE */}

            <section className="mt-4 overflow-hidden rounded-2xl border border-[#DCE1E8] bg-white shadow-[0_4px_18px_rgba(15,23,42,0.045)]">

                <div className="border-b border-[#E2E8F0] px-5 py-4">

                    <div className="flex items-center justify-between gap-4">

                        <div>

                            <h2 className="text-base font-semibold text-[#111827]">
                                Course Directory
                            </h2>

                            <p className="mt-1 text-xs text-[#64748B]">
                                {filteredCourses.length} course
                                {filteredCourses.length === 1
                                    ? ""
                                    : "s"} found
                            </p>

                        </div>

                    </div>

                </div>

                {filteredCourses.length === 0 ? (
                    <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">

                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-[#E5E7EB] bg-[#F8F9FB] text-[#9CA3AF]">
                            —
                        </div>

                        <h3 className="text-sm font-semibold text-[#252832]">
                            No courses found
                        </h3>

                        <p className="mt-1 text-sm text-[#92959C]">
                            {search || departmentFilter
                                ? "Try changing your search or filter."
                                : "Courses added to the system will appear here."}
                        </p>

                    </div>
                ) : (
                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[950px] text-left">

                            <thead>

                                <tr className="border-b border-[#1E293B] bg-[#111827]">

                                    <th className="w-14 px-4 py-3.5 text-[11px] font-bold uppercase tracking-[0.1em] text-white">
                                        #
                                    </th>

                                    <th className="px-4 py-3.5 text-[11px] font-bold uppercase tracking-[0.1em] text-white">
                                        Code
                                    </th>

                                    <th className="px-4 py-3.5 text-[11px] font-bold uppercase tracking-[0.1em] text-white">
                                        Course
                                    </th>

                                    <th className="px-4 py-3.5 text-[11px] font-bold uppercase tracking-[0.1em] text-white">
                                        Department
                                    </th>

                                    <th className="px-4 py-3.5 text-[11px] font-bold uppercase tracking-[0.1em] text-white">
                                        Credits
                                    </th>

                                    <th className="px-4 py-3.5 text-[11px] font-bold uppercase tracking-[0.1em] text-white">
                                        Created
                                    </th>

                                    {canManage && (
                                        <th className="px-4 py-3.5 text-right text-[11px] font-bold uppercase tracking-[0.1em] text-white">
                                            Actions
                                        </th>
                                    )}

                                </tr>

                            </thead>

                            <tbody>

                                {filteredCourses.map(
                                    (course, index) => (
                                        <tr
                                            key={course.id}
                                            className={`border-b border-[#EEF1F5] transition-colors last:border-b-0 hover:bg-[#F5F8FC] ${
                                                index % 2 === 1
                                                    ? "bg-[#FCFDFE]"
                                                    : "bg-white"
                                            }`}
                                        >

                                            <td className="px-4 py-3 text-xs font-medium text-[#94A3B8]">
                                                {index + 1}
                                            </td>

                                            <td className="px-4 py-3">

                                                <span className="inline-flex rounded-lg bg-[#EFF6FF] px-2.5 py-1 text-xs font-bold text-[#1D4ED8]">
                                                    {course.code}
                                                </span>

                                            </td>

                                            <td className="px-4 py-3">

                                                <div>

                                                    <p className="text-sm font-semibold text-[#111827]">
                                                        {course.name}
                                                    </p>

                                                    {course.description && (
                                                        <p className="mt-0.5 max-w-[300px] truncate text-xs text-[#64748B]">
                                                            {course.description}
                                                        </p>
                                                    )}

                                                </div>

                                            </td>

                                            <td className="px-4 py-3">

                                                <span className="text-sm text-[#475569]">
                                                    {getDepartmentName(
                                                        course.departmentId
                                                    )}
                                                </span>

                                            </td>

                                            <td className="px-4 py-3">

                                                <span className="text-sm font-medium text-[#111827]">
                                                    {course.credits}
                                                </span>

                                            </td>

                                            <td className="px-4 py-3">

                                                <span className="text-xs text-[#64748B]">
                                                    {course.createdAt
                                                        ? new Date(
                                                              course.createdAt
                                                          ).toLocaleDateString()
                                                        : "—"}
                                                </span>

                                            </td>

                                            {canManage && (
                                                <td className="px-4 py-3">

                                                    <div className="flex justify-end gap-2">

                                                        <button
                                                            onClick={() =>
                                                                openEditModal(
                                                                    course
                                                                )
                                                            }
                                                            className="rounded-lg border border-[#DCE1E8] bg-white px-3 py-1.5 text-xs font-semibold text-[#334155] transition hover:border-[#2563EB] hover:text-[#2563EB]"
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            onClick={() =>
                                                                handleDelete(
                                                                    course
                                                                )
                                                            }
                                                            className="rounded-lg border border-[#FECACA] bg-white px-3 py-1.5 text-xs font-semibold text-[#DC2626] transition hover:bg-[#FEF2F2]"
                                                        >
                                                            Delete
                                                        </button>

                                                    </div>

                                                </td>
                                            )}

                                        </tr>
                                    )
                                )}

                            </tbody>

                        </table>

                    </div>
                )}

            </section>

            {/* ========================================================
                DELETE CONFIRMATION MODAL
            ======================================================== */}

            {showDeleteModal &&
                deletingCourse &&
                canManage && (
                    <div
                        className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0F172A]/50 px-4 backdrop-blur-[2px]"
                        onMouseDown={(event) => {
                            if (
                                event.target ===
                                event.currentTarget
                            ) {
                                closeDeleteModal();
                            }
                        }}
                    >

                        <div className="w-full max-w-md overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_24px_70px_rgba(15,23,42,0.22)]">

                            {/* Modal Header */}

                            <div className="border-b border-[#E5E7EB] px-6 py-5">

                                <div className="flex items-start gap-4">

                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FEF2F2]">

                                        <svg
                                            className="h-5 w-5 text-[#DC2626]"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M12 9v4m0 4h.01M10.29 3.86l-8.2 14A2 2 0 003.82 21h16.36a2 2 0 001.73-3.14l-8.2-14a2 2 0 00-3.42 0z"
                                            />
                                        </svg>

                                    </div>

                                    <div>

                                        <h2 className="text-lg font-semibold text-[#111827]">
                                            Delete Course
                                        </h2>

                                        <p className="mt-1 text-sm text-[#64748B]">
                                            This action cannot be undone.
                                        </p>

                                    </div>

                                </div>

                            </div>

                            {/* Modal Body */}

                            <div className="px-6 py-5">

                                <p className="text-sm leading-6 text-[#475569]">

                                    Are you sure you want to delete{" "}

                                    <span className="font-semibold text-[#111827]">
                                        {deletingCourse.name}
                                    </span>{" "}

                                    ({deletingCourse.code})?

                                </p>

                                {deleteEnrollmentCount > 0 ? (
                                    <div className="mt-4 rounded-xl border border-[#FDE68A] bg-[#FFFBEB] px-4 py-3">

                                        <p className="text-sm font-semibold text-[#92400E]">
                                            This course has{" "}
                                            {deleteEnrollmentCount}{" "}
                                            enrolled{" "}
                                            {deleteEnrollmentCount === 1
                                                ? "student"
                                                : "students"}
                                            .
                                        </p>

                                        <p className="mt-1 text-sm leading-5 text-[#A16207]">
                                            Deleting this course will
                                            also remove those enrollment
                                            records.
                                        </p>

                                    </div>
                                ) : (
                                    <p className="mt-3 text-sm text-[#64748B]">
                                        No students are currently
                                        enrolled in this course.
                                    </p>
                                )}

                            </div>

                            {/* Modal Actions */}

                            <div className="flex justify-end gap-3 border-t border-[#E5E7EB] bg-[#FAFBFC] px-6 py-4">

                                <button
                                    type="button"
                                    onClick={closeDeleteModal}
                                    disabled={deleteLoading}
                                    className="rounded-xl border border-[#DCE1E8] bg-white px-4 py-2.5 text-sm font-semibold text-[#475569] transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={confirmDeleteCourse}
                                    disabled={deleteLoading}
                                    className="rounded-xl bg-[#DC2626] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#B91C1C] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {deleteLoading
                                        ? "Deleting..."
                                        : "Delete Course"}
                                </button>

                            </div>

                        </div>

                    </div>
                )}

            {/* ========================================================
                ADD / EDIT COURSE MODAL
            ======================================================== */}

            {showModal && canManage && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/45 px-4 py-6 backdrop-blur-[2px]">

                    <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_20px_60px_rgba(15,23,42,0.18)]">

                        {/* Modal header */}

                        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-5">

                            <div>

                                <h2 className="text-lg font-semibold text-[#111827]">
                                    {editingCourse
                                        ? "Edit Course"
                                        : "Add Course"}
                                </h2>

                                <p className="mt-1 text-sm text-[#64748B]">
                                    {editingCourse
                                        ? "Update the course information."
                                        : "Create a new course in NEXORA."}
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={closeModal}
                                disabled={saving}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-lg text-[#64748B] transition hover:bg-[#F1F5F9] hover:text-[#111827]"
                            >
                                ×
                            </button>

                        </div>

                        {/* Form */}

                        <form
                            onSubmit={handleSubmit}
                            className="p-6"
                        >

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
                                    >
                                        ×
                                    </button>

                                </div>
                            )}

                            <div className="grid gap-5 sm:grid-cols-2">

                                {/* Department */}

                                <div className="sm:col-span-2">

                                    <label className="mb-1.5 block text-xs font-semibold text-[#374151]">
                                        Department{" "}
                                        <span className="text-red-500">
                                            *
                                        </span>
                                    </label>

                                    <select
                                        value={form.departmentId}
                                        onChange={(e) =>
                                            updateField(
                                                "departmentId",
                                                e.target.value
                                            )
                                        }
                                        className="h-11 w-full rounded-xl border border-[#DCE1E8] bg-white px-3 text-sm text-[#111827] outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10"
                                    >

                                        <option value="">
                                            Select department
                                        </option>

                                        {departments.map(
                                            (department) => (
                                                <option
                                                    key={
                                                        department.id
                                                    }
                                                    value={
                                                        department.id
                                                    }
                                                >
                                                    {department.name}
                                                </option>
                                            )
                                        )}

                                    </select>

                                </div>

                                {/* Course Code */}

                                <div>

                                    <label className="mb-1.5 block text-xs font-semibold text-[#374151]">
                                        Course Code{" "}
                                        <span className="text-red-500">
                                            *
                                        </span>
                                    </label>

                                    <input
                                        type="text"
                                        value={form.code}
                                        onChange={(e) =>
                                            updateField(
                                                "code",
                                                e.target.value
                                            )
                                        }
                                        placeholder="e.g. CS101"
                                        maxLength={20}
                                        className="h-11 w-full rounded-xl border border-[#DCE1E8] bg-white px-3 text-sm uppercase text-[#111827] outline-none transition placeholder:normal-case placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10"
                                    />

                                </div>

                                {/* Credits */}

                                <div>

                                    <label className="mb-1.5 block text-xs font-semibold text-[#374151]">
                                        Credits{" "}
                                        <span className="text-red-500">
                                            *
                                        </span>
                                    </label>

                                    <input
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={form.credits}
                                        onChange={(e) =>
                                            updateField(
                                                "credits",
                                                e.target.value
                                            )
                                        }
                                        className="h-11 w-full rounded-xl border border-[#DCE1E8] bg-white px-3 text-sm text-[#111827] outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10"
                                    />

                                </div>

                                {/* Name */}

                                <div className="sm:col-span-2">

                                    <label className="mb-1.5 block text-xs font-semibold text-[#374151]">
                                        Course Name{" "}
                                        <span className="text-red-500">
                                            *
                                        </span>
                                    </label>

                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) =>
                                            updateField(
                                                "name",
                                                e.target.value
                                            )
                                        }
                                        placeholder="e.g. Web Development"
                                        maxLength={150}
                                        className="h-11 w-full rounded-xl border border-[#DCE1E8] bg-white px-3 text-sm text-[#111827] outline-none transition placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10"
                                    />

                                </div>

                                {/* Description */}

                                <div className="sm:col-span-2">

                                    <label className="mb-1.5 block text-xs font-semibold text-[#374151]">
                                        Description
                                    </label>

                                    <textarea
                                        value={form.description}
                                        onChange={(e) =>
                                            updateField(
                                                "description",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Brief description of the course..."
                                        rows={4}
                                        className="w-full resize-none rounded-xl border border-[#DCE1E8] bg-white px-3 py-3 text-sm text-[#111827] outline-none transition placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10"
                                    />

                                </div>

                            </div>

                            {/* Actions */}

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
                                    type="submit"
                                    disabled={saving}
                                    className="rounded-xl bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingCourse
                                          ? "Save Changes"
                                          : "Create Course"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

        </main>
    );
}

/*
 * ============================================================
 * STUDENT COURSE CARD
 * ============================================================
 */

function StudentCourseCard({
    course,
    index,
}: {
    course: Course;
    index: number;
}) {
    const courseImages = [
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80",
    ];

    const image =
        courseImages[index % courseImages.length];

    return (
        <article className="group overflow-hidden rounded-[22px] border border-[#E2E8F0] bg-white shadow-[0_6px_24px_rgba(15,23,42,0.045)] transition-all duration-300 hover:-translate-y-1 hover:border-[#CBD5E1] hover:shadow-[0_18px_40px_rgba(15,23,42,0.10)]">

            {/* ==================================================
                COURSE IMAGE
            ================================================== */}

            <div className="relative h-[190px] overflow-hidden bg-[#E2E8F0]">

                <img
                    src={image}
                    alt=""
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />

                {/* Image overlay */}

                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/75 via-[#0F172A]/10 to-transparent" />

                {/* Course code */}

                <div className="absolute left-4 top-4">

                    <span className="rounded-lg border border-white/20 bg-[#0F172A]/70 px-3 py-1.5 text-[11px] font-bold tracking-wide text-white backdrop-blur-md">
                        {course.code}
                    </span>

                </div>

                {/* Enrolled badge */}

                <div className="absolute right-4 top-4">

                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/90 px-2.5 py-1.5 text-[10px] font-bold text-[#15803D] backdrop-blur-md">

                        <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" />

                        Enrolled

                    </span>

                </div>

                {/* Course title */}

                <div className="absolute bottom-4 left-4 right-4">

                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#BFDBFE]">
                        NEXORA Learning
                    </p>

                    <h3 className="mt-1 line-clamp-2 text-xl font-bold leading-tight tracking-[-0.02em] text-white">
                        {course.name}
                    </h3>

                </div>

            </div>

            {/* ==================================================
                CARD BODY
            ================================================== */}

            <div className="p-5">

                {/* Description */}

                <p className="line-clamp-2 min-h-[48px] text-sm leading-6 text-[#64748B]">
                    {course.description ||
                        "Explore the concepts, skills and knowledge covered in this course."}
                </p>

                {/* Course metadata */}

                <div className="mt-5 flex items-center gap-2">

                    {/* Credits */}

                    <div className="flex flex-1 items-center gap-2 rounded-xl bg-[#F8FAFC] px-3 py-2.5">

                        <Award className="h-4 w-4 shrink-0 text-[#2563EB]" />

                        <div>

                            <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#94A3B8]">
                                Credits
                            </p>

                            <p className="mt-0.5 text-sm font-bold text-[#0F172A]">
                                {course.credits}
                            </p>

                        </div>

                    </div>

                    {/* Status */}

                    <div className="flex flex-1 items-center gap-2 rounded-xl bg-[#F8FAFC] px-3 py-2.5">

                        <Clock3 className="h-4 w-4 shrink-0 text-[#64748B]" />

                        <div>

                            <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#94A3B8]">
                                Status
                            </p>

                            <p className="mt-0.5 text-sm font-bold text-[#15803D]">
                                Active
                            </p>

                        </div>

                    </div>

                </div>

                {/* View Course */}

                <button
                    type="button"
                    className="mt-5 flex h-11 w-full items-center justify-between rounded-xl bg-[#0F172A] px-4 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#2563EB]"
                >

                    <span>
                        View Course
                    </span>

                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 transition group-hover:bg-white/20">

                        <ArrowUpRight className="h-4 w-4" />

                    </span>

                </button>

            </div>

        </article>
    );
}