"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Student } from "@/lib/types";

export default function ProfilePage() {
    const [student, setStudent] = useState<Student | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await api<Student>("/api/students/me");
                setStudent(data);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load profile."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-sm text-[#64748B]">
                    Loading your profile...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                <p className="text-sm font-medium text-red-600">
                    {error}
                </p>
            </div>
        );
    }

    if (!student) {
        return (
            <div className="rounded-2xl border border-[#DCE1E8] bg-white p-8 text-center">
                <p className="text-sm text-[#64748B]">
                    Student profile not found.
                </p>
            </div>
        );
    }

    const initials = `${student.firstName?.[0] ?? ""}${student.lastName?.[0] ?? ""}`;

    return (
        <div className="mx-auto max-w-[1400px]">
            {/* =========================
                PAGE HEADER
            ========================= */}
            <div className="border-b border-[#DCE1E8] pb-6">
                <div className="mb-3 inline-flex items-center rounded-full bg-[#EFF6FF] px-3 py-1 text-xs font-semibold text-[#2563EB]">
                    Student Account
                </div>

                <h1 className="text-[42px] font-bold leading-[1.05] tracking-[-0.03em] text-[#0F172A] sm:text-[46px]">
                    My Profile
                </h1>

                <p className="mt-3 text-[15px] leading-6 text-[#64748B] sm:text-base">
                    View your personal student information and account details.
                </p>
            </div>

            {/* =========================
                PROFILE CARD
            ========================= */}
            <div className="mt-8 overflow-hidden rounded-2xl border border-[#DCE1E8] bg-white">
                {/* Profile summary */}
                <div className="border-b border-[#DCE1E8] p-6 sm:p-8">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#EFF6FF] text-2xl font-bold text-[#2563EB]">
                            {initials.toUpperCase()}
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold tracking-[-0.02em] text-[#0F172A]">
                                {student.firstName} {student.lastName}
                            </h2>

                            <p className="mt-1 text-sm text-[#64748B]">
                                Student ID #{student.id}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Personal information */}
                <div className="p-6 sm:p-8">
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-[#0F172A]">
                            Personal Information
                        </h3>

                        <p className="mt-1 text-sm text-[#64748B]">
                            Your registered student details.
                        </p>
                    </div>

                    <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
                        <ProfileField
                            label="First Name"
                            value={student.firstName}
                        />

                        <ProfileField
                            label="Last Name"
                            value={student.lastName}
                        />

                        <ProfileField
                            label="Email"
                            value={student.email}
                        />

                        <ProfileField
                            label="Phone"
                            value={student.phone}
                        />

                        <ProfileField
                            label="Date of Birth"
                            value={formatDate(student.dateOfBirth)}
                        />

                        <ProfileField
                            label="Student ID"
                            value={`#${student.id}`}
                        />

                        <div className="sm:col-span-2">
                            <ProfileField
                                label="Address"
                                value={student.address}
                            />
                        </div>

                        <ProfileField
                            label="Profile Created"
                            value={formatDateTime(student.createdAt)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function ProfileField({
    label,
    value,
}: {
    label: string;
    value: string | null;
}) {
    return (
        <div>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#64748B]">
                {label}
            </p>

            <p className="mt-2 break-words text-[15px] font-medium text-[#0F172A]">
                {value || "Not provided"}
            </p>
        </div>
    );
}

function formatDate(date: string | null) {
    if (!date) return null;

    const parsedDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) {
        return date;
    }

    return parsedDate.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function formatDateTime(date: string) {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return date;
    }

    return parsedDate.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}