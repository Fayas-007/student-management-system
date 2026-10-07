"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Student } from "@/lib/types";

export default function ProfilePage() {
    const [student, setStudent] = useState<Student | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadProfile() {
            try {
                setLoading(true);
                setError("");

                const data = await api<Student>("/api/students/me");

                setStudent(data);
            } catch (e) {
                setError(
                    e instanceof Error
                        ? e.message
                        : "Failed to load profile"
                );
            } finally {
                setLoading(false);
            }
        }

        loadProfile();
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#DCE1E8] border-t-[#2563EB]" />
                    <p className="text-sm font-medium text-[#64748B]">
                        Loading profile...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <main className="mx-auto w-full max-w-[1200px]">
                <div className="rounded-2xl border border-[#FECACA] bg-[#FEF2F2] px-5 py-4 text-sm font-medium text-[#B91C1C]">
                    {error}
                </div>
            </main>
        );
    }

    if (!student) {
        return null;
    }

    return (
        <main className="mx-auto w-full max-w-[1200px]">
            {/* Header */}
            <header className="border-b border-[#DCE1E8] pb-6">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#D8E3F8] bg-[#EFF6FF] px-3 py-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB]" />

                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#1D4ED8]">
                        Student Account
                    </span>
                </div>

                <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#111827] sm:text-4xl">
                    My Profile
                </h1>

                <p className="mt-2 text-sm text-[#64748B]">
                    View your personal and academic account information.
                </p>
            </header>

            {/* Profile */}
            <section className="mt-6 overflow-hidden rounded-2xl border border-[#DCE1E8] bg-white shadow-[0_4px_18px_rgba(15,23,42,0.045)]">
                {/* Profile header */}
                <div className="border-b border-[#E2E8F0] bg-[#F8FAFC] p-6 sm:p-8">
                    <div className="flex items-center gap-5">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#172033] text-xl font-bold text-white">
                            {student.firstName.charAt(0)}
                            {student.lastName.charAt(0)}
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-[#111827]">
                                {student.firstName} {student.lastName}
                            </h2>

                            <p className="mt-1 text-sm text-[#64748B]">
                                Student ID #{student.id}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Information */}
                <div className="grid gap-x-8 gap-y-7 p-6 sm:grid-cols-2 sm:p-8">
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
                        value={student.phone ?? "Not provided"}
                    />

                    <ProfileField
                        label="Date of Birth"
                        value={
                            student.dateOfBirth
                                ? new Date(
                                      student.dateOfBirth
                                  ).toLocaleDateString()
                                : "Not provided"
                        }
                    />

                    <ProfileField
                        label="Student ID"
                        value={`#${student.id}`}
                    />

                    <div className="sm:col-span-2">
                        <ProfileField
                            label="Address"
                            value={student.address ?? "Not provided"}
                        />
                    </div>
                </div>
            </section>
        </main>
    );
}

function ProfileField({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#64748B]">
                {label}
            </p>

            <p className="mt-2 text-sm font-medium text-[#111827]">
                {value}
            </p>
        </div>
    );
}