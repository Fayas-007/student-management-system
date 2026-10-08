"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import type { Student } from "@/lib/types";

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    setRole(localStorage.getItem("role") ?? "");

    async function load() {
      try {
        setLoading(true);
        setError("");

        setStudents(await api<Student[]>("/api/students"));
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const isAdmin = role === "ADMIN";
  const isTeacher = role === "TEACHER";

  const filteredStudents = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return students;

    return students.filter((student) =>
      `${student.firstName} ${student.lastName} ${
        student.email
      } ${student.phone ?? ""}`
        .toLowerCase()
        .includes(query)
    );
  }, [students, search]);

  function getInitials(firstName: string, lastName: string) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  return (
    <main className="mx-auto w-full max-w-[1400px]">
      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <div className="mb-8 border-b border-[#DCE1E8] pb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#D8E3F8] bg-[#EFF6FF] px-3 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB]" />

          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#1D4ED8]">
            {isTeacher ? "Academic Overview" : "Management"}
          </span>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-[42px] font-bold leading-[1.05] tracking-[-0.03em] text-[#0F172A] sm:text-[46px]">
              Students
            </h1>

            <p className="mt-3 text-[15px] leading-6 text-[#64748B] sm:text-base">
              {isTeacher
                ? "View student profiles and account information."
                : "Manage student profiles and account information."}
            </p>
          </div>

          {/* ADMIN ONLY */}
          {isAdmin && (
            <Link
              href="/dashboard/people"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1D4ED8]"
            >
              <span className="text-lg leading-none">+</span>
              Add Student
            </Link>
          )}
        </div>
      </div>

      {/* =====================================================
          TABLE CARD
      ====================================================== */}

      <section className="overflow-hidden rounded-2xl border border-[#DCE1E8] bg-white shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
        {/* TABLE HEADER */}

        <div className="flex flex-col gap-4 border-b border-[#E5E7EB] px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[#111827]">
              Student directory
            </h2>

            <p className="mt-1 text-xs text-[#94A3B8]">
              {isTeacher
                ? "View registered students."
                : "View and manage registered students."}
            </p>
          </div>

          {/* SEARCH */}
          <div className="relative w-full sm:w-72">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]">
              ⌕
            </span>

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search students..."
              className="h-10 w-full rounded-xl border border-[#DCE1E8] bg-white pl-9 pr-3 text-sm text-[#111827] placeholder:text-[#94A3B8] outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/5"
            />
          </div>
        </div>

        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <div className="space-y-4 p-6">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-14 animate-pulse rounded-xl bg-[#F1F5F9]"
              />
            ))}
          </div>
        )}

        {/* =================================================
            ERROR
        ================================================= */}

        {!loading && error && (
          <div className="p-8 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500">
              !
            </div>

            <h3 className="mt-4 text-sm font-semibold text-[#111827]">
              Unable to load students
            </h3>

            <p className="mt-1 text-sm text-[#64748B]">
              {error}
            </p>
          </div>
        )}

        {/* =================================================
            EMPTY
        ================================================= */}

        {!loading &&
          !error &&
          filteredStudents.length === 0 && (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EFF6FF] text-lg font-semibold text-[#2563EB]">
                S
              </div>

              <h3 className="mt-5 text-sm font-semibold text-[#111827]">
                {search ? "No students found" : "No students yet"}
              </h3>

              <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-[#64748B]">
                {search
                  ? "Try adjusting your search to find a student."
                  : "Students added to the system will appear here."}
              </p>
            </div>
          )}

        {/* =================================================
            TABLE
        ================================================= */}

        {!loading &&
          !error &&
          filteredStudents.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead className="bg-[#111827]">
                  <tr>
                    <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-[0.08em] text-white">
                      Student
                    </th>

                    <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-[0.08em] text-white">
                      Email
                    </th>

                    <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-[0.08em] text-white">
                      Phone
                    </th>

                    <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-[0.08em] text-white">
                      Joined
                    </th>

                    {/* ADMIN ONLY */}
                    {isAdmin && (
                      <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-[0.08em] text-white">
                        Access
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {filteredStudents.map((student, index) => (
                    <tr
                      key={student.id}
                      className={`border-b border-[#EEF1F5] transition-colors last:border-b-0 hover:bg-[#F5F8FC] ${
                        index % 2 === 1
                          ? "bg-[#FCFDFE]"
                          : "bg-white"
                      }`}
                    >
                      {/* STUDENT */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] text-xs font-bold text-[#2563EB]">
                            {getInitials(
                              student.firstName,
                              student.lastName
                            )}
                          </div>

                          <div>
                            <p className="text-sm font-semibold tracking-[-0.01em] text-[#111827]">
                              {student.firstName} {student.lastName}
                            </p>

                            <p className="mt-0.5 text-xs text-[#94A3B8]">
                              Student #{student.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* EMAIL */}
                      <td className="px-5 py-4">
                        <span className="text-sm text-[#475569]">
                          {student.email}
                        </span>
                      </td>

                      {/* PHONE */}
                      <td className="px-5 py-4">
                        <span className="text-sm text-[#475569]">
                          {student.phone ?? "—"}
                        </span>
                      </td>

                      {/* JOINED */}
                      <td className="px-5 py-4">
                        <span className="text-sm text-[#475569]">
                          {student.createdAt
                            ? new Date(
                                student.createdAt
                              ).toLocaleDateString()
                            : "—"}
                        </span>
                      </td>

                      {/* ADMIN ONLY */}
                      {isAdmin && (
                        <td className="px-5 py-4 text-right">
                          <span className="inline-flex rounded-full border border-[#D8E3F8] bg-[#EFF6FF] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.08em] text-[#2563EB]">
                            Managed by Admin
                          </span>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        {/* =================================================
            FOOTER
        ================================================= */}

        {!loading &&
          !error &&
          filteredStudents.length > 0 && (
            <div className="flex items-center justify-between border-t border-[#E5E7EB] bg-[#F8FAFC] px-5 py-3">
              <p className="text-xs text-[#64748B]">
                Showing{" "}
                <span className="font-semibold text-[#334155]">
                  {filteredStudents.length}
                </span>{" "}
                {filteredStudents.length === 1
                  ? "student"
                  : "students"}
              </p>

              <p className="text-xs font-medium text-[#94A3B8]">
                NEXORA
              </p>
            </div>
          )}
      </section>
    </main>
  );
}