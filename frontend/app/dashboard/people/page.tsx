"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";

type User = {
    id: number;
    email: string;
    role: "ADMIN" | "TEACHER" | "STUDENT";
    createdAt: string;

    studentId?: number;
    firstName?: string;
    lastName?: string;
    phone?: string;
    dateOfBirth?: string;
    address?: string;
};

type FormData = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: "ADMIN" | "TEACHER" | "STUDENT";
    phone: string;
    dateOfBirth: string;
    address: string;
};

const emptyForm: FormData = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "STUDENT",
    phone: "",
    dateOfBirth: "",
    address: "",
};

export default function PeoplePage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");

    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [form, setForm] = useState<FormData>(emptyForm);
    const [saving, setSaving] = useState(false);

    const [validationErrors, setValidationErrors] = useState<
        Record<string, string>
    >({});

    // =========================
    // LOAD USERS
    // =========================

    async function loadUsers() {
        try {
            setLoading(true);
            setError("");

            const data = await api<User[]>("/api/users");

            setUsers(data);
        } catch (e) {
            setError(
                e instanceof Error
                    ? e.message
                    : "Failed to load people"
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadUsers();
    }, []);

    // =========================
    // FILTER
    // =========================

    const filteredUsers = useMemo(() => {
        const query = search.toLowerCase().trim();

        return users.filter((user) => {
            const name =
                `${user.firstName ?? ""} ${user.lastName ?? ""}`.toLowerCase();

            const matchesSearch =
                !query ||
                name.includes(query) ||
                user.email.toLowerCase().includes(query) ||
                user.role.toLowerCase().includes(query);

            const matchesRole =
                roleFilter === "ALL" || user.role === roleFilter;

            return matchesSearch && matchesRole;
        });
    }, [users, search, roleFilter]);

    // =========================
    // CREATE
    // =========================

    function openCreate() {
        setEditingUser(null);
        setForm({ ...emptyForm });
        setValidationErrors({});
        setShowForm(true);
        setError("");
    }

    // =========================
    // EDIT
    // =========================

    function openEdit(user: User) {
        setEditingUser(user);

        setForm({
            firstName: user.firstName ?? "",
            lastName: user.lastName ?? "",
            email: user.email,
            password: "",
            role: user.role,
            phone: user.phone ?? "",
            dateOfBirth: user.dateOfBirth ?? "",
            address: user.address ?? "",
        });

        setValidationErrors({});
        setShowForm(true);
        setError("");
    }

    // =========================
    // CLOSE FORM
    // =========================

    function closeForm() {
        setShowForm(false);
        setEditingUser(null);
        setForm({ ...emptyForm });
        setValidationErrors({});
    }

    // =========================
    // VALIDATION
    // =========================

    function validateForm() {
        const errors: Record<string, string> = {};

        // Email
        if (!form.email.trim()) {
            errors.email = "Email is required.";
        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
        ) {
            errors.email = "Enter a valid email address.";
        }

        // Password
        if (!editingUser) {
            if (!form.password.trim()) {
                errors.password = "Password is required.";
            } else if (form.password.length < 8) {
                errors.password =
                    "Password must be at least 8 characters.";
            }
        } else if (
            form.password.trim() &&
            form.password.length < 8
        ) {
            errors.password =
                "Password must be at least 8 characters.";
        }

        // Student required fields
        if (form.role === "STUDENT") {
            if (!form.firstName.trim()) {
                errors.firstName = "First name is required.";
            }

            if (!form.lastName.trim()) {
                errors.lastName = "Last name is required.";
            }
        }

        setValidationErrors(errors);

        return Object.keys(errors).length === 0;
    }

    // =========================
    // SUBMIT
    // =========================

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setSaving(true);
            setError("");

            const payload: Record<string, unknown> = {
                email: form.email.trim(),
                role: form.role,
                firstName: form.firstName.trim(),
                lastName: form.lastName.trim(),
                phone: form.phone.trim() || null,
                dateOfBirth: form.dateOfBirth || null,
                address: form.address.trim() || null,
            };

            if (!editingUser) {
                payload.password = form.password;
            } else if (form.password.trim()) {
                payload.password = form.password;
            }

            if (editingUser) {
                await api(`/api/users/${editingUser.id}`, {
                    method: "PUT",
                    body: JSON.stringify(payload),
                });
            } else {
                await api("/api/users", {
                    method: "POST",
                    body: JSON.stringify(payload),
                });
            }

            closeForm();
            await loadUsers();
        } catch (e) {
            setError(
                e instanceof Error
                    ? e.message
                    : "Something went wrong"
            );
        } finally {
            setSaving(false);
        }
    }

    // =========================
    // DELETE
    // =========================

    async function handleDelete(user: User) {
        if (user.role === "ADMIN") {
            setError(
                "Administrator accounts cannot be deleted. The last administrator must always remain in the system."
            );
            return;
        }

        const label =
            user.role === "STUDENT"
                ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
                : user.email;

        if (!confirm(`Delete ${label}? This cannot be undone.`)) {
            return;
        }

        try {
            setError("");

            await api(`/api/users/${user.id}`, {
                method: "DELETE",
            });

            await loadUsers();
        } catch (e) {
            setError(
                e instanceof Error
                    ? e.message
                    : "Failed to delete user"
            );
        }
    }

    // =========================
    // ROLE CHANGE
    // =========================

    function handleRoleChange(
        newRole: FormData["role"]
    ) {
        setValidationErrors({});

        setForm((current) => ({
            ...current,
            role: newRole,
        }));
    }

    // =========================
    // RETURN
    // =========================

    return (
        <main className="min-h-full">

            {/* =========================
                HEADER
            ========================= */}

            <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9A9EA6]">
                        Management
                    </p>

                    <h1 className="text-[30px] font-semibold tracking-[-0.04em] text-[#252832]">
                        People
                    </h1>

                    <p className="mt-2 text-sm text-[#8B8E95]">
                        Manage administrators, teachers, and students.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={openCreate}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1B1C20] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#292A2E]"
                >
                    <span className="text-lg leading-none">
                        +
                    </span>

                    Add person
                </button>
            </div>

            {/* =========================
                SEARCH / FILTER
            ========================= */}

            <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-[#DDE3EC] bg-[#F8FAFD] p-3 shadow-[0_5px_24px_rgba(15,23,42,0.04)] sm:flex-row">

                <div className="relative flex-1">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9AA3B1]">
                        ⌕
                    </span>

                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search name, email, or role..."
                        className="h-11 w-full rounded-xl border border-[#DCE1E8] bg-white pl-10 pr-4 text-sm text-[#252832] outline-none transition placeholder:text-[#A3A9B3] focus:border-[#8EA8D8] focus:ring-4 focus:ring-[#2563EB]/5"
                    />
                </div>

                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="h-11 rounded-xl border border-[#DCE1E8] bg-white px-4 text-sm font-medium text-[#45484F] outline-none transition focus:border-[#8EA8D8] focus:ring-4 focus:ring-[#2563EB]/5"
                >
                    <option value="ALL">All roles</option>
                    <option value="STUDENT">Students</option>
                    <option value="TEACHER">Teachers</option>
                    <option value="ADMIN">Admins</option>
                </select>
            </div>

            {/* =========================
                ERROR
            ========================= */}

            {error && (
                <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    <span className="mt-0.5 font-semibold">
                        !
                    </span>

                    <span>
                        {error}
                    </span>
                </div>
            )}

            <div className="overflow-hidden rounded-2xl border border-[#E2E4E8] bg-white shadow-[0_6px_24px_rgba(15,23,42,0.035)]">
    {loading ? (
        <div className="flex min-h-[260px] items-center justify-center">
            <p className="text-sm text-[#8B8E95]">
                Loading people...
            </p>
        </div>
    ) : filteredUsers.length === 0 ? (
        <div className="flex min-h-[260px] flex-col items-center justify-center px-6 text-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-[#E5E7EB] bg-[#F8F9FB] text-[#9CA3AF]">
                —
            </div>

            <h3 className="text-sm font-semibold text-[#252832]">
                No people found
            </h3>

            <p className="mt-1 text-sm text-[#92959C]">
                Try changing your search or filter.
            </p>
        </div>
    ) : (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">

                {/* HEADER */}
                <thead>
    <tr className="border-b border-[#1E293B] bg-[#111827]">
        <th className="w-14 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
            #
        </th>

        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
            Person
        </th>

        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
            Email
        </th>

        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
            Role
        </th>

        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
            Joined
        </th>

        <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-[0.12em] text-white">
            Actions
        </th>
    </tr>
</thead>

                {/* USERS */}
                <tbody>
                    {filteredUsers.map((user, index) => (
                        <tr
                            key={user.id}
                            className={`
                                border-b border-[#EEF1F5]
                                transition-colors
                                last:border-b-0
                                hover:bg-[#F5F8FC]
                                ${
                                    index % 2 === 1
                                        ? "bg-[#FCFDFE]"
                                        : "bg-white"
                                }
                            `}
                        >

                            {/* NUMBER */}
                            <td className="px-4 py-3">
                                <span className="text-[11px] font-semibold tabular-nums text-[#A3A7AF]">
                                    {String(index + 1).padStart(2, "0")}
                                </span>
                            </td>

                            {/* PERSON */}
                            <td className="px-4 py-3">
                                <div className="flex items-center gap-2.5">

                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EEF4FF] text-[10px] font-bold text-[#2563EB]">
                                        {user.role === "STUDENT"
                                            ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
                                            : user.email[0]?.toUpperCase()}
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold leading-tight tracking-[-0.01em] text-[#252832]">
                                            {user.role === "STUDENT"
                                                ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
                                                : user.email}
                                        </p>

                                        <p className="mt-0.5 text-[10px] font-medium text-[#A0A4AC]">
                                            ID #{user.id}
                                        </p>
                                    </div>

                                </div>
                            </td>

                            {/* EMAIL */}
                            <td className="px-4 py-3">
                                <span className="text-xs text-[#62666F]">
                                    {user.email}
                                </span>
                            </td>

                            {/* ROLE */}
                            <td className="px-4 py-3">

                                {user.role === "ADMIN" && (
                                    <span className="inline-flex rounded-full border border-[#D6D8DC] bg-[#252832] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.08em] text-white">
                                        Admin
                                    </span>
                                )}

                                {user.role === "TEACHER" && (
                                    <span className="inline-flex rounded-full border border-[#BFDBFE] bg-[#EFF6FF] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.08em] text-[#2563EB]">
                                        Teacher
                                    </span>
                                )}

                                {user.role === "STUDENT" && (
                                    <span className="inline-flex rounded-full border border-[#D1D5DB] bg-[#F5F6F7] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.08em] text-[#555A63]">
                                        Student
                                    </span>
                                )}

                            </td>

                            {/* JOINED */}
                            <td className="px-4 py-3">
                                <span className="text-xs text-[#62666F]">
                                    {user.createdAt
                                        ? new Date(
                                              user.createdAt
                                          ).toLocaleDateString()
                                        : "—"}
                                </span>
                            </td>

                            {/* ACTIONS */}
                            <td className="px-4 py-3">
                                <div className="flex justify-end gap-1.5">

                                    <button
                                        type="button"
                                        onClick={() => openEdit(user)}
                                        className="rounded-lg border border-[#D9DCE1] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#45484F] shadow-sm transition hover:border-[#BFC3C9] hover:bg-[#F8F9FA]"
                                    >
                                        Edit
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleDelete(user)
                                        }
                                        disabled={user.role === "ADMIN"}
                                        className={
                                            user.role === "ADMIN"
                                                ? "cursor-not-allowed rounded-lg border border-[#E5E7EB] bg-[#F5F5F5] px-3 py-1.5 text-[11px] font-semibold text-[#B8BBC1]"
                                                : "rounded-lg border border-red-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-50"
                                        }
                                    >
                                        {user.role === "ADMIN"
                                            ? "Protected"
                                            : "Delete"}
                                    </button>

                                </div>
                            </td>

                        </tr>
                    ))}
                </tbody>

            </table>
        </div>
    )}
</div>
            {/* =========================
                MODAL
            ========================= */}

            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">

                    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-2xl">

                        {/* Modal Header */}
                        <div className="mb-6 flex items-start justify-between">

                            <div>
                                <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#9A9EA6]">
                                    People management
                                </p>

                                <h2 className="text-xl font-semibold tracking-[-0.02em] text-[#252832]">
                                    {editingUser
                                        ? "Edit person"
                                        : "Add person"}
                                </h2>

                                <p className="mt-1 text-sm text-[#8B8E95]">
                                    {editingUser
                                        ? "Update account information."
                                        : "Create a new account."}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeForm}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-xl text-[#8B8E95] transition hover:bg-[#F5F5F5] hover:text-[#252832]"
                            >
                                ×
                            </button>

                        </div>

                        {/* Form */}
                        <form
                            onSubmit={handleSubmit}
                            noValidate
                            className="space-y-5"
                        >

                            {/* Names */}
                            <div className="grid gap-4 sm:grid-cols-2">

                                <Field
                                    label="First name"
                                    value={form.firstName}
                                    required={
                                        form.role === "STUDENT"
                                    }
                                    error={
                                        validationErrors.firstName
                                    }
                                    onChange={(value) => {
                                        setValidationErrors(
                                            (current) => ({
                                                ...current,
                                                firstName: "",
                                            })
                                        );

                                        setForm((current) => ({
                                            ...current,
                                            firstName: value,
                                        }));
                                    }}
                                />

                                <Field
                                    label="Last name"
                                    value={form.lastName}
                                    required={
                                        form.role === "STUDENT"
                                    }
                                    error={
                                        validationErrors.lastName
                                    }
                                    onChange={(value) => {
                                        setValidationErrors(
                                            (current) => ({
                                                ...current,
                                                lastName: "",
                                            })
                                        );

                                        setForm((current) => ({
                                            ...current,
                                            lastName: value,
                                        }));
                                    }}
                                />

                            </div>

                            {/* Email */}
                            <Field
                                label="Email"
                                type="email"
                                value={form.email}
                                required={true}
                                error={validationErrors.email}
                                onChange={(value) => {
                                    setValidationErrors(
                                        (current) => ({
                                            ...current,
                                            email: "",
                                        })
                                    );

                                    setForm((current) => ({
                                        ...current,
                                        email: value,
                                    }));
                                }}
                            />

                            {/* Password */}
                            <Field
                                label={
                                    editingUser
                                        ? "New password (optional)"
                                        : "Password"
                                }
                                type="password"
                                value={form.password}
                                required={!editingUser}
                                error={
                                    validationErrors.password
                                }
                                onChange={(value) => {
                                    setValidationErrors(
                                        (current) => ({
                                            ...current,
                                            password: "",
                                        })
                                    );

                                    setForm((current) => ({
                                        ...current,
                                        password: value,
                                    }));
                                }}
                            />

                            {/* Role */}
                            <div>
                                <label className="mb-2 block text-xs font-semibold text-[#45484F]">
                                    Role
                                    <span className="ml-1 text-red-500">
                                        *
                                    </span>
                                </label>

                                <select
                                    value={form.role}
                                    onChange={(e) =>
                                        handleRoleChange(
                                            e.target
                                                .value as FormData["role"]
                                        )
                                    }
                                    className="h-11 w-full rounded-xl border border-[#DDDAD3] bg-white px-3 text-sm font-medium text-[#45484F] outline-none transition focus:border-[#9A9CA2] focus:ring-2 focus:ring-[#111827]/5"
                                >
                                    <option value="STUDENT">
                                        Student
                                    </option>

                                    <option value="TEACHER">
                                        Teacher
                                    </option>

                                    <option value="ADMIN">
                                        Admin
                                    </option>
                                </select>
                            </div>

                            {/* Student Details */}
                            {form.role === "STUDENT" && (
                                <div className="rounded-2xl border border-[#E7E5E0] bg-[#FAFAF9] p-5">

                                    <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.14em] text-[#96989F]">
                                        Student details
                                    </p>

                                    <div className="space-y-4">

                                        <Field
                                            label="Phone"
                                            value={form.phone}
                                            onChange={(value) =>
                                                setForm(
                                                    (
                                                        current
                                                    ) => ({
                                                        ...current,
                                                        phone: value,
                                                    })
                                                )
                                            }
                                        />

                                        <Field
                                            label="Date of birth"
                                            type="date"
                                            value={
                                                form.dateOfBirth
                                            }
                                            onChange={(value) =>
                                                setForm(
                                                    (
                                                        current
                                                    ) => ({
                                                        ...current,
                                                        dateOfBirth:
                                                            value,
                                                    })
                                                )
                                            }
                                        />

                                        <div>
                                            <label className="mb-2 block text-xs font-semibold text-[#45484F]">
                                                Address
                                            </label>

                                            <textarea
                                                value={
                                                    form.address
                                                }
                                                onChange={(e) =>
                                                    setForm(
                                                        (
                                                            current
                                                        ) => ({
                                                            ...current,
                                                            address:
                                                                e
                                                                    .target
                                                                    .value,
                                                        })
                                                    )
                                                }
                                                rows={3}
                                                className="w-full resize-none rounded-xl border border-[#DDDAD3] bg-white px-3 py-2 text-sm text-[#252832] outline-none transition placeholder:text-[#A3A7AF] focus:border-[#9A9CA2] focus:ring-2 focus:ring-[#111827]/5"
                                            />
                                        </div>

                                    </div>
                                </div>
                            )}

                            {/* Buttons */}
                            <div className="flex justify-end gap-3 border-t border-[#ECEAE5] pt-5">

                                <button
                                    type="button"
                                    onClick={closeForm}
                                    className="rounded-xl border border-[#DDDAD3] bg-white px-5 py-2.5 text-sm font-semibold text-[#45484F] transition hover:bg-[#F7F6F3]"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="rounded-xl bg-[#1B1C20] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#292A2E] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingUser
                                            ? "Save changes"
                                            : "Create person"}
                                </button>

                            </div>

                        </form>

                    </div>
                </div>
            )}

        </main>
    );
}

// ======================================================
// STAT CARD
// ======================================================

function StatCard({
    label,
    value,
}: {
    label: string;
    value: number;
}) {
    return (
        <div className="group relative overflow-hidden rounded-2xl border border-[#E2E6EE] bg-white p-5 shadow-[0_6px_24px_rgba(15,23,42,0.045)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(15,23,42,0.07)]">
            <div className="absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-[#EFF6FF]" />

            <div className="relative">
                <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8B93A1]">
                        {label}
                    </p>

                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#2563EB]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB]" />
                    </span>
                </div>

                <p className="mt-4 text-[28px] font-semibold tracking-[-0.04em] text-[#20242C]">
                    {value}
                </p>

                <div className="mt-3 h-1 w-10 rounded-full bg-[#2563EB]" />
            </div>
        </div>
    );
}

// ======================================================
// FIELD
// ======================================================

function Field({
    label,
    value,
    onChange,
    type = "text",
    required = false,
    error,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    required?: boolean;
    error?: string;
}) {
    return (
        <div>
            <label className="mb-2 block text-xs font-semibold text-[#45484F]">
                {label}

                {required && (
                    <span className="ml-1 text-red-500">
                        *
                    </span>
                )}
            </label>

            <input
                type={type}
                value={value}
                required={required}
                onChange={(e) =>
                    onChange(e.target.value)
                }
                className={`h-11 w-full rounded-xl border bg-white px-3 text-sm text-[#252832] outline-none transition placeholder:text-[#A3A7AF] ${error
                    ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    : "border-[#DDDAD3] focus:border-[#9A9CA2] focus:ring-2 focus:ring-[#111827]/5"
                    }`}
            />

            {error && (
                <p className="mt-1.5 text-xs font-medium text-red-500">
                    {error}
                </p>
            )}
        </div>
    );
}