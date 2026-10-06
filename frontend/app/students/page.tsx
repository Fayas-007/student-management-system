"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Student } from "@/lib/types";

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setStudents(await api<Student[]>("/api/students"));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      } finally {
        setLoading(false);

        
      }
    }
    load();
  }, []);

  if (loading) return <p className="p-6">Loading students...</p>;
  if (error) return <p className="p-6 text-red-600">Error: {error}</p>;

  return (
    <main className="p-6">
      <h1 className="mb-4 text-2xl font-bold">Students</h1>
      {students.length === 0 ? (
        <p>No students yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b font-semibold">
              <tr>
                <th className="p-2">Name</th>
                <th className="p-2">Email</th>
                <th className="p-2">Phone</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-b">
                  <td className="p-2">{s.firstName} {s.lastName}</td>
                  <td className="p-2">{s.email}</td>
                  <td className="p-2">{s.phone ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}