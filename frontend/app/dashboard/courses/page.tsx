"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import type { Course } from "@/lib/types";

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

    const [form, setForm] = useState<CourseForm>(emptyForm);

    const isStudent = role === "STUDENT";
    const canManage = role === "ADMIN" || role === "TEACHER";

    useEffect(() => {
        const currentRole = localStorage.getItem("role") ?? "";
        setRole(currentRole);
        loadData();
    }, []);

    async function loadData() {
        try {
            setLoading(true);
            setError("");
            setSuccess("");

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
        setEditingCourse(null);
        setForm(emptyForm);
        setFormError("");
        setError("");
        setSuccess("");
        setShowModal(true);
    }

    function openEditModal(course: Course) {
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

    async function handleDelete(course: Course) {
        const confirmed = window.confirm(
            `Delete "${course.name}" (${course.code})?\n\nThis action cannot be undone.`
        );

        if (!confirmed) return;

        try {
            setError("");
            setSuccess("");

            await api(`/api/courses/${course.id}`, {
                method: "DELETE",
            });

            setCourses((current) =>
                current.filter(
                    (item) => item.id !== course.id
                )
            );

            setSuccess("Course deleted successfully.");
        } catch (e) {
            setError(
                e instanceof Error
                    ? e.message
                    : "Failed to delete course"
            );
        }
    }

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

    return (
        <main className="mx-auto w-full max-w-[1400px]">

            {/* HEADER */}
            <header className="border-b border-[#DCE1E8] pb-6">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#D8E3F8] bg-[#EFF6FF] px-3 py-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB]" />

                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#1D4ED8]">
                        {isStudent
                            ? "Academic Portal"
                            : "Academic Management"}
                    </span>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#111827] sm:text-4xl">
                            {isStudent
                                ? "My Courses"
                                : "Courses"}
                        </h1>

                        <p className="mt-2 text-sm text-[#64748B]">
                            {isStudent
                                ? "Courses assigned to your student account."
                                : "View and manage courses available in the system."}
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
                        <input
                            type="text"
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            placeholder="Search by course code, name or description..."
                            className="h-11 w-full rounded-xl border border-[#DCE1E8] bg-[#FBFCFE] px-4 text-sm text-[#111827] outline-none transition placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10"
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

                            {/* TABLE HEADER */}
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

            {/* MODAL */}
            {showModal && canManage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/45 px-4 py-6 backdrop-blur-[2px]">
                    <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_20px_60px_rgba(15,23,42,0.18)]">

                        {/* MODAL HEADER */}
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

                        {/* FORM */}
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

                                {/* DEPARTMENT */}
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
                                                    {
                                                        department.name
                                                    }
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>

                                {/* CODE */}
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

                                {/* CREDITS */}
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

                                {/* NAME */}
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

                                {/* DESCRIPTION */}
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

                            {/* ACTIONS */}
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