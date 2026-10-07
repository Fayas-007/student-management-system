"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import type { Student } from "@/lib/types";

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
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

  const filteredStudents = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return students;

    return students.filter((student) =>
      `${student.firstName} ${student.lastName} ${student.email} ${
        student.phone ?? ""
      }`
        .toLowerCase()
        .includes(query)
    );
  }, [students, search]);

  function getInitials(firstName: string, lastName: string) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  return (
    <main className="min-h-full">

      {/* =========================
          PAGE HEADER
      ========================= */}
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#A0A2A8]">
            Management
          </p>

          <h1 className="text-[30px] font-semibold tracking-[-0.04em] text-[#252832]">
            Students
          </h1>

          <p className="mt-2 text-sm text-[#8B8E95]">
            Manage student profiles and account information.
          </p>
        </div>

        {/* Add Student */}
        <button
          type="button"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1B1C20] px-5 text-sm font-semibold text-white shadow-[0_5px_14px_rgba(27,28,32,0.12)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#292A2E] hover:shadow-[0_8px_18px_rgba(27,28,32,0.16)]"
        >
          <span className="text-lg leading-none">+</span>
          Add student
        </button>

      </div>

      {/* =========================
          SUMMARY
      ========================= */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

        <div className="rounded-2xl border border-[#E5E2DC] bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[#858890]">
              Total students
            </p>

            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FCE9DF] text-sm font-semibold text-[#9A6752]">
              S
            </span>
          </div>

          <p className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-[#252832]">
            {students.length}
          </p>

          <p className="mt-1 text-xs text-[#A0A2A8]">
            Registered student accounts
          </p>
        </div>

        <div className="rounded-2xl border border-[#E5E2DC] bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[#858890]">
              With phone
            </p>

            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F0F1F3] text-sm font-semibold text-[#687080]">
              #
            </span>
          </div>

          <p className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-[#252832]">
            {students.filter((student) => student.phone).length}
          </p>

          <p className="mt-1 text-xs text-[#A0A2A8]">
            Profiles with contact numbers
          </p>
        </div>

        <div className="rounded-2xl border border-[#E5E2DC] bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[#858890]">
              Showing
            </p>

            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F0F1F3] text-sm font-semibold text-[#687080]">
              ≡
            </span>
          </div>

          <p className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-[#252832]">
            {filteredStudents.length}
          </p>

          <p className="mt-1 text-xs text-[#A0A2A8]">
            Students matching your search
          </p>
        </div>

      </div>

      {/* =========================
          TABLE CARD
      ========================= */}
      <section className="overflow-hidden rounded-2xl border border-[#E5E2DC] bg-white shadow-[0_8px_25px_rgba(37,40,50,0.035)]">

        {/* Table Header */}
        <div className="flex flex-col gap-4 border-b border-[#ECEAE5] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h2 className="text-sm font-semibold text-[#252832]">
              Student directory
            </h2>

            <p className="mt-1 text-xs text-[#9A9CA2]">
              View and manage registered students.
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#A4A6AB]">
              ⌕
            </span>

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search students..."
              className="h-10 w-full rounded-xl border border-[#DDDAD3] bg-[#FBFAF8] pl-9 pr-3 text-sm text-[#252832] placeholder:text-[#A3A5AA] outline-none transition focus:border-[#252832] focus:bg-white focus:ring-4 focus:ring-[#252832]/5"
            />
          </div>

        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-4 p-6">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-14 animate-pulse rounded-xl bg-[#F3F2EE]"
              />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="p-8 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFF1EF] text-[#B94A45]">
              !
            </div>

            <h3 className="mt-4 text-sm font-semibold text-[#252832]">
              Unable to load students
            </h3>

            <p className="mt-1 text-sm text-[#92959C]">
              {error}
            </p>
          </div>
        )}

        {/* Empty */}
        {!loading &&
          !error &&
          filteredStudents.length === 0 && (
            <div className="px-6 py-16 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FCE9DF] text-lg font-semibold text-[#9A6752]">
                S
              </div>

              <h3 className="mt-5 text-sm font-semibold text-[#252832]">
                {search
                  ? "No students found"
                  : "No students yet"}
              </h3>

              <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-[#92959C]">
                {search
                  ? "Try adjusting your search to find a student."
                  : "Students added to the system will appear here."}
              </p>

            </div>
          )}

        {/* Desktop Table */}
        {!loading &&
          !error &&
          filteredStudents.length > 0 && (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[760px] text-left">

                <thead>
                  <tr className="border-b border-[#ECEAE5] bg-[#FBFAF8]">

                    <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#96989F]">
                      Student
                    </th>

                    <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#96989F]">
                      Email
                    </th>

                    <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#96989F]">
                      Phone
                    </th>

                    <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#96989F]">
                      Joined
                    </th>

                    <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-[#96989F]">
                      Action
                    </th>

                  </tr>
                </thead>

                <tbody>
                  {filteredStudents.map((student) => (
                    <tr
                      key={student.id}
                      className="group border-b border-[#F0EEE9] transition-colors last:border-b-0 hover:bg-[#FBFAF8]"
                    >

                      {/* Student */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FCE9DF] text-xs font-semibold text-[#93614D]">
                            {getInitials(
                              student.firstName,
                              student.lastName
                            )}
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-[#252832]">
                              {student.firstName} {student.lastName}
                            </p>

                            <p className="mt-0.5 text-xs text-[#9A9CA2]">
                              Student #{student.id}
                            </p>
                          </div>

                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-5 py-4">
                        <span className="text-sm text-[#62666F]">
                          {student.email}
                        </span>
                      </td>

                      {/* Phone */}
                      <td className="px-5 py-4">
                        <span className="text-sm text-[#62666F]">
                          {student.phone ?? "—"}
                        </span>
                      </td>

                      {/* Joined */}
                      <td className="px-5 py-4">
                        <span className="text-sm text-[#62666F]">
                          {student.createdAt
                            ? new Date(
                                student.createdAt
                              ).toLocaleDateString()
                            : "—"}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          className="rounded-lg px-3 py-2 text-xs font-semibold text-[#777A82] opacity-0 transition hover:bg-[#F0EFEB] hover:text-[#252832] group-hover:opacity-100"
                        >
                          View
                        </button>
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>

            </div>
          )}

        {/* Footer */}
        {!loading &&
          !error &&
          filteredStudents.length > 0 && (
            <div className="flex items-center justify-between border-t border-[#ECEAE5] bg-[#FBFAF8] px-5 py-3">

              <p className="text-xs text-[#999BA1]">
                Showing{" "}
                <span className="font-semibold text-[#656870]">
                  {filteredStudents.length}
                </span>{" "}
                {filteredStudents.length === 1
                  ? "student"
                  : "students"}
              </p>

              <p className="text-xs text-[#B0B1B5]">
                NEXORA
              </p>

            </div>
          )}

      </section>

    </main>
  );
}