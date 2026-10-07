"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
    Building2,
    Search,
    Plus,
    X,
} from "lucide-react";
import { api } from "@/lib/api";

type Department = {
    id: number;
    name: string;
    description: string | null;
    createdAt: string;
};

type DepartmentForm = {
    name: string;
    description: string;
};

const emptyForm: DepartmentForm = {
    name: "",
    description: "",
};

export default function DepartmentsPage() {
    const [role, setRole] = useState("");
    const [departments, setDepartments] = useState<Department[]>([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [formError, setFormError] = useState("");

    const [search, setSearch] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [editingDepartment, setEditingDepartment] =
        useState<Department | null>(null);

    const [form, setForm] = useState<DepartmentForm>(emptyForm);

    const isAdmin = role === "ADMIN";

    useEffect(() => {
        const currentRole = localStorage.getItem("role") ?? "";

        setRole(currentRole);
        loadDepartments();
    }, []);

    async function loadDepartments() {
        try {
            setLoading(true);
            setError("");

            const data = await api<Department[]>("/api/departments");

            setDepartments(data);
        } catch (e) {
            setError(
                e instanceof Error
                    ? e.message
                    : "Failed to load departments"
            );
        } finally {
            setLoading(false);
        }
    }

    const filteredDepartments = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return departments;
        }

        return departments.filter(
            (department) =>
                department.name.toLowerCase().includes(query) ||
                (department.description ?? "")
                    .toLowerCase()
                    .includes(query)
        );
    }, [departments, search]);

    function openCreateModal() {
        setEditingDepartment(null);
        setForm(emptyForm);
        setFormError("");
        setError("");
        setSuccess("");
        setShowModal(true);
    }

    function openEditModal(department: Department) {
        setEditingDepartment(department);

        setForm({
            name: department.name,
            description: department.description ?? "",
        });

        setFormError("");
        setError("");
        setSuccess("");
        setShowModal(true);
    }

    function closeModal() {
        if (saving) {
            return;
        }

        setShowModal(false);
        setEditingDepartment(null);
        setForm(emptyForm);
        setFormError("");
    }

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setFormError("");
        setError("");
        setSuccess("");

        const name = form.name.trim();
        const description = form.description.trim();

        if (!name) {
            setFormError("Department name is required.");
            return;
        }

        try {
            setSaving(true);

            const body = JSON.stringify({
                name,
                description,
            });

            if (editingDepartment) {
                const updated = await api<Department>(
                    `/api/departments/${editingDepartment.id}`,
                    {
                        method: "PUT",
                        body,
                    }
                );

                setDepartments((current) =>
                    current.map((department) =>
                        department.id === updated.id
                            ? updated
                            : department
                    )
                );

                setSuccess("Department updated successfully.");
            } else {
                const created = await api<Department>(
                    "/api/departments",
                    {
                        method: "POST",
                        body,
                    }
                );

                setDepartments((current) => [
                    created,
                    ...current,
                ]);

                setSuccess("Department created successfully.");
            }

            setShowModal(false);
            setEditingDepartment(null);
            setForm(emptyForm);
        } catch (e) {
            setFormError(
                e instanceof Error
                    ? e.message
                    : "Failed to save department"
            );
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(department: Department) {
        const confirmed = window.confirm(
            `Delete "${department.name}"?\n\nThis action cannot be undone.`
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");
            setSuccess("");

            await api(
                `/api/departments/${department.id}`,
                {
                    method: "DELETE",
                }
            );

            setDepartments((current) =>
                current.filter(
                    (item) => item.id !== department.id
                )
            );

            setSuccess("Department deleted successfully.");
        } catch (e) {
            setError(
                e instanceof Error
                    ? e.message
                    : "Failed to delete department. Make sure no courses are using it."
            );
        }
    }

    function formatDate(date: string) {
        return new Date(date).toLocaleDateString();
    }

    if (loading) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#DCE1E8] border-t-[#2563EB]" />

                    <p className="text-sm font-medium text-[#64748B]">
                        Loading departments...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <main className="mx-auto w-full max-w-[1400px]">

            {/* =========================
                HEADER
            ========================= */}
            <header className="border-b border-[#DCE1E8] pb-6">

                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#D8E3F8] bg-[#EFF6FF] px-3 py-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB]" />

                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#1D4ED8]">
                        Academic Management
                    </span>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

                    <div>
                        <div className="flex items-center gap-3">

                            <div>
                                <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#111827] sm:text-4xl">
                                    Departments
                                </h1>

                                <p className="mt-2 text-sm text-[#64748B]">
                                    View and manage academic departments in NEXORA.
                                </p>
                            </div>
                        </div>
                    </div>

                    {isAdmin && (
                        <button
                            type="button"
                            onClick={openCreateModal}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-4 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(37,99,235,0.18)] transition hover:bg-[#1D4ED8]"
                        >
                            <Plus size={17} />
                            Add Department
                        </button>
                    )}
                </div>
            </header>

            {/* =========================
                SUCCESS MESSAGE
            ========================= */}
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

            {/* =========================
                ERROR MESSAGE
            ========================= */}
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

            {/* =========================
                SEARCH
            ========================= */}
            {/* FILTERS */}
            <section className="mt-6 rounded-2xl border border-[#DCE1E8] bg-white p-4 shadow-[0_4px_18px_rgba(15,23,42,0.04)]">
                <div className="flex flex-col gap-3 md:flex-row">
                    <div className="relative flex-1">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by department name or description..."
                            className="h-11 w-full rounded-xl border border-[#DCE1E8] bg-[#FBFCFE] px-4 pl-10 text-sm text-[#111827] outline-none transition placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10"
                        />
                    </div>
                </div>
            </section>

            {/* =========================
                DEPARTMENT TABLE
            ========================= */}
            <section className="mt-4 overflow-hidden rounded-2xl border border-[#DCE1E8] bg-white shadow-[0_4px_18px_rgba(15,23,42,0.045)]">

                {/* TABLE TITLE */}
                <div className="border-b border-[#E2E8F0] px-5 py-4">
                    <div>
                        <h2 className="text-base font-semibold text-[#111827]">
                            Department Directory
                        </h2>


                    </div>
                </div>

                {filteredDepartments.length === 0 ? (
                    <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">

                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-[#E5E7EB] bg-[#F8F9FB] text-[#9CA3AF]">
                            <Building2 size={18} />
                        </div>

                        <h3 className="text-sm font-semibold text-[#252832]">
                            No departments found
                        </h3>

                        <p className="mt-1 text-sm text-[#92959C]">
                            {search
                                ? "Try changing your search."
                                : "Departments added to the system will appear here."}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[850px] text-left">

                            {/* TABLE HEADER */}
                            <thead>
                                <tr className="border-b border-[#1E293B] bg-[#111827]">

                                    <th className="w-14 px-4 py-3.5 text-[11px] font-bold uppercase tracking-[0.1em] text-white">
                                        #
                                    </th>

                                    <th className="px-4 py-3.5 text-[11px] font-bold uppercase tracking-[0.1em] text-white">
                                        Department
                                    </th>

                                    <th className="px-4 py-3.5 text-[11px] font-bold uppercase tracking-[0.1em] text-white">
                                        Description
                                    </th>

                                    <th className="px-4 py-3.5 text-[11px] font-bold uppercase tracking-[0.1em] text-white">
                                        Created
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
                                {filteredDepartments.map(
                                    (department, index) => (
                                        <tr
                                            key={department.id}
                                            className={`border-b border-[#EEF1F5] transition-colors last:border-b-0 hover:bg-[#F5F8FC] ${index % 2 === 1
                                                    ? "bg-[#FCFDFE]"
                                                    : "bg-white"
                                                }`}
                                        >

                                            {/* NUMBER */}
                                            <td className="px-4 py-3 text-xs font-medium text-[#94A3B8]">
                                                {index + 1}
                                            </td>

                                            {/* DEPARTMENT */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">

                                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#2563EB]">
                                                        <Building2
                                                            size={17}
                                                        />
                                                    </div>

                                                    <div>
                                                        <p className="text-sm font-semibold text-[#111827]">
                                                            {department.name}
                                                        </p>

                                                        <p className="mt-0.5 text-xs text-[#94A3B8]">
                                                            Department #{department.id}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* DESCRIPTION */}
                                            <td className="max-w-[380px] px-4 py-3">
                                                <p className="truncate text-sm text-[#64748B]">
                                                    {department.description ||
                                                        "No description provided"}
                                                </p>
                                            </td>

                                            {/* CREATED */}
                                            <td className="px-4 py-3">
                                                <span className="text-xs text-[#64748B]">
                                                    {formatDate(
                                                        department.createdAt
                                                    )}
                                                </span>
                                            </td>

                                            {/* ACTIONS */}
                                            {isAdmin && (
                                                <td className="px-4 py-3">
                                                    <div className="flex justify-end gap-2">

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openEditModal(
                                                                    department
                                                                )
                                                            }
                                                            className="rounded-lg border border-[#DCE1E8] bg-white px-3 py-1.5 text-xs font-semibold text-[#334155] transition hover:border-[#2563EB] hover:text-[#2563EB]"
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    department
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

            {/* =========================
                MODAL
            ========================= */}
            {showModal && isAdmin && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/45 px-4 py-6 backdrop-blur-[2px]">

                    <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_20px_60px_rgba(15,23,42,0.18)]">

                        {/* MODAL HEADER */}
                        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-5">

                            <div>
                                <h2 className="text-lg font-semibold text-[#111827]">
                                    {editingDepartment
                                        ? "Edit Department"
                                        : "Add Department"}
                                </h2>

                                <p className="mt-1 text-sm text-[#64748B]">
                                    {editingDepartment
                                        ? "Update the department information."
                                        : "Create a new academic department in NEXORA."}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeModal}
                                disabled={saving}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#64748B] transition hover:bg-[#F1F5F9] hover:text-[#111827]"
                            >
                                <X size={18} />
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

                            <div className="space-y-5">

                                {/* NAME */}
                                <div>
                                    <label className="mb-1.5 block text-xs font-semibold text-[#374151]">
                                        Department Name{" "}
                                        <span className="text-red-500">
                                            *
                                        </span>
                                    </label>

                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                name: e.target.value,
                                            })
                                        }
                                        placeholder="e.g. Computer Science"
                                        maxLength={100}
                                        className="h-11 w-full rounded-xl border border-[#DCE1E8] bg-white px-3 text-sm text-[#111827] outline-none transition placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10"
                                    />
                                </div>

                                {/* DESCRIPTION */}
                                <div>
                                    <label className="mb-1.5 block text-xs font-semibold text-[#374151]">
                                        Description
                                    </label>

                                    <textarea
                                        value={form.description}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                description:
                                                    e.target.value,
                                            })
                                        }
                                        placeholder="Brief description of the department..."
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
                                        : editingDepartment
                                            ? "Save Changes"
                                            : "Create Department"}
                                </button>

                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}