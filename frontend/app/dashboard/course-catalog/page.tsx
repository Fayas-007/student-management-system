"use client";

import { useEffect, useMemo, useState } from "react";
import {
    ArrowLeft,
    ArrowUpRight,
    BookOpen,
    Search,
} from "lucide-react";

import { api } from "@/lib/api";
import type { Course } from "@/lib/types";

/* ============================================================
   REVEAL ANIMATIONS
============================================================ */

const reveal = `
@keyframes catalogReveal {
    from {
        opacity: 0;
        transform: translateY(12px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.catalog-reveal {
    opacity: 0;
    animation: catalogReveal 550ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.catalog-reveal-1 {
    animation-delay: 0ms;
}

.catalog-reveal-2 {
    animation-delay: 70ms;
}

.catalog-reveal-3 {
    animation-delay: 140ms;
}

.catalog-reveal-4 {
    animation-delay: 210ms;
}

.catalog-reveal-5 {
    animation-delay: 280ms;
}


@keyframes catalogCardReveal {
    from {
        opacity: 0;
        transform: translateY(18px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.catalog-card-reveal {
    opacity: 0;
    animation: catalogCardReveal 600ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
}


@media (prefers-reduced-motion: reduce) {
    .catalog-reveal,
    .catalog-card-reveal {
        opacity: 1;
        animation: none;
        transform: none;
    }
}
`;

/* ============================================================
   TYPES
============================================================ */

type Department = {
    id: number;
    name: string;
    description?: string | null;
    createdAt?: string;
};

/* ============================================================
   DEPARTMENT IMAGES
============================================================ */

const departmentImages = [
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=85",
    "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1400&q=85",
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=85",
    "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1400&q=85",
    "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1400&q=85",
    "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=1400&q=85",
];

/* ============================================================
   COURSE IMAGES
============================================================ */

const courseImages = [
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=85",
    "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1000&q=85",
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1000&q=85",
    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1000&q=85",
    "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=85",
    "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1000&q=85",
];

export default function CourseCatalogPage() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);

    const [selectedDepartment, setSelectedDepartment] =
        useState<Department | null>(null);

    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    /* ============================================================
       LOAD DATA
    ============================================================ */

    useEffect(() => {
        async function loadCatalog() {
            try {
                setLoading(true);
                setError("");

                const [departmentData, courseData] = await Promise.all([
                    api<Department[]>("/api/departments"),
                    api<Course[]>("/api/courses"),
                ]);

                setDepartments(departmentData);
                setCourses(courseData);
            } catch (e) {
                setError(
                    e instanceof Error
                        ? e.message
                        : "Failed to load course catalog."
                );
            } finally {
                setLoading(false);
            }
        }

        loadCatalog();
    }, []);

    /* ============================================================
       HELPERS
    ============================================================ */

    function getCourseCount(departmentId: number) {
        return courses.filter(
            (course) => course.departmentId === departmentId
        ).length;
    }

    const selectedCourses = useMemo(() => {
        if (!selectedDepartment) return [];

        const query = search.trim().toLowerCase();

        return courses.filter((course) => {
            if (course.departmentId !== selectedDepartment.id) {
                return false;
            }

            if (!query) return true;

            return (
                course.name.toLowerCase().includes(query) ||
                course.code.toLowerCase().includes(query) ||
                (course.description ?? "")
                    .toLowerCase()
                    .includes(query)
            );
        });
    }, [courses, selectedDepartment, search]);

    /* ============================================================
       LOADING
    ============================================================ */

    if (loading) {
        return (
            <main className="flex min-h-[70vh] items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#DCE1E8] border-t-[#2563EB]" />

                    <p className="text-sm font-medium text-[#64748B]">
                        Loading catalog...
                    </p>
                </div>
            </main>
        );
    }

    /* ============================================================
       ERROR
    ============================================================ */

    if (error) {
        return (
            <main className="mx-auto w-full max-w-[1500px]">
                <div className="rounded-2xl border border-[#FECACA] bg-[#FEF2F2] px-5 py-4 text-sm font-medium text-[#B91C1C]">
                    {error}
                </div>
            </main>
        );
    }

    /* ============================================================
       DEPARTMENT VIEW
    ============================================================ */

    if (!selectedDepartment) {
        return (
            <main className="mx-auto w-full max-w-[1500px]">
                <style>{reveal}</style>

                {/* ==================================================
                    CATALOG INTRO
                ================================================== */}

                <section className="catalog-reveal catalog-reveal-1 mb-10">
                    <div className="relative">
                        {/* TOP EDITORIAL LINE */}

                        <div className="catalog-reveal catalog-reveal-2 mb-7 flex items-center gap-4">
                            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#2563EB]">
                                NEXORA · Academic Catalog
                            </span>

                            <div className="h-px flex-1 bg-[#DCE1E8]" />

                            <span className="hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-[#94A3B8] sm:block">
                                Explore · Discover · Learn
                            </span>
                        </div>

                        {/* MAIN EDITORIAL AREA */}

                        <div className="grid gap-8 lg:grid-cols-[1fr_280px] lg:items-end">
                            {/* LEFT */}

                            <div>
                                <h1 className="catalog-reveal catalog-reveal-3 max-w-4xl text-[42px] font-semibold leading-[0.96] tracking-[-0.055em] text-[#0F172A] sm:text-[52px] lg:text-[64px]">
                                    <span className="block font-semibold">
                                        Explore our
                                    </span>

                                    <span className="mt-1 block font-bold text-[#2563EB]">
                                        academic departments.
                                    </span>
                                </h1>

                                <div className="catalog-reveal catalog-reveal-4 mt-7 flex max-w-2xl gap-5">
                                    <div className="w-px shrink-0 bg-[#2563EB]" />

                                    <p className="text-sm leading-6 text-[#64748B] sm:text-base">
                                        Discover the courses available across
                                        NEXORA. Choose a department to explore
                                        its complete course collection.
                                    </p>
                                </div>
                            </div>

                            {/* RIGHT EDITORIAL ELEMENT */}

                            <div className="relative hidden lg:block">
                                <div className="flex items-end justify-end gap-5">
                                    <div className="pb-2 text-right">
                                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#94A3B8]">
                                            Academic areas
                                        </p>

                                        <div className="mt-2 h-px w-24 bg-[#CBD5E1]" />
                                    </div>

                                    <div className="leading-none">
                                        <span className="text-[92px] font-bold tracking-[-0.08em] text-[#E2E8F0]">
                                            {String(
                                                departments.length
                                            ).padStart(2, "0")}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CONNECTION INTO DEPARTMENT GRID */}

                        <div className="catalog-reveal catalog-reveal-5 mt-9 flex items-center gap-3">
                            <span className="text-[9px] font-bold tracking-[0.18em] text-[#94A3B8]">
                                01
                            </span>

                            <div className="h-px flex-1 bg-[#E2E8F0]" />

                            <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#94A3B8]">
                                Departments
                            </span>

                            <div className="h-px w-10 bg-[#2563EB]" />
                        </div>
                    </div>
                </section>

                {/* ==================================================
                    DEPARTMENT GRID
                ================================================== */}

                <section>
                    {departments.length === 0 ? (
                        <div className="flex min-h-[420px] items-center justify-center rounded-[28px] border border-dashed border-[#CBD5E1] bg-white">
                            <div className="text-center">
                                <BookOpen className="mx-auto h-10 w-10 text-[#94A3B8]" />

                                <h2 className="mt-4 text-lg font-bold text-[#0F172A]">
                                    No departments available
                                </h2>

                                <p className="mt-1 text-sm text-[#64748B]">
                                    Departments will appear here once they are
                                    created.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                            {departments.map((department, index) => {
                                const courseCount = getCourseCount(
                                    department.id
                                );

                                const image =
                                    departmentImages[
                                        index % departmentImages.length
                                    ];

                                return (
                                    <button
                                        key={department.id}
                                        type="button"
                                        onClick={() =>
                                            setSelectedDepartment(department)
                                        }
                                        className="catalog-card-reveal group relative min-h-[390px] overflow-hidden rounded-[26px] bg-[#0F172A] text-left shadow-[0_8px_30px_rgba(15,23,42,0.10)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(15,23,42,0.16)] sm:min-h-[430px]"
                                        style={{
    animationDelay: `${350 + index * 70}ms`,
}}
                                    >
                                        {/* IMAGE */}

                                        <img
                                            src={image}
                                            alt=""
                                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                        />

                                        {/* DARK OVERLAY */}

                                        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#0F172A]/55 to-[#0F172A]/5" />

                                        {/* TOP CONTENT */}

                                        <div className="absolute left-5 right-5 top-5 flex items-start justify-between">
                                            <span className="rounded-full border border-white/20 bg-black/20 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur-md">
                                                Department
                                            </span>

                                            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-all duration-200 group-hover:bg-white group-hover:text-[#2563EB]">
                                                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                                            </span>
                                        </div>

                                        {/* BOTTOM CONTENT */}

                                        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-7">
                                            <div className="mb-3 flex items-center gap-2">
                                                <span className="h-1.5 w-1.5 rounded-full bg-[#60A5FA]" />

                                                <span className="text-xs font-semibold text-white/70">
                                                    {courseCount}{" "}
                                                    {courseCount === 1
                                                        ? "course"
                                                        : "courses"}
                                                </span>
                                            </div>

                                            <h2 className="max-w-[90%] text-2xl font-bold leading-tight tracking-[-0.025em] text-white sm:text-[28px]">
                                                {department.name}
                                            </h2>

                                            <p className="mt-2 line-clamp-2 max-w-xl text-sm leading-5 text-white/65">
                                                {department.description ||
                                                    "Explore the courses available in this academic department."}
                                            </p>

                                            <div className="mt-5 flex items-center gap-2 text-sm font-bold text-white">
                                                Explore department

                                                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </section>
            </main>
        );
    }

    /* ============================================================
       COURSES INSIDE DEPARTMENT
    ============================================================ */

    return (
        <main className="mx-auto w-full max-w-[1500px]">
            <style>{reveal}</style>

            {/* BACK */}

            <button
                type="button"
                onClick={() => {
                    setSelectedDepartment(null);
                    setSearch("");
                }}
                className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#64748B] transition-colors hover:text-[#2563EB]"
            >
                <ArrowLeft className="h-4 w-4" />
                All departments
            </button>

            {/* ==================================================
                DEPARTMENT HEADER
            ================================================== */}

            <section className="catalog-reveal catalog-reveal-1 relative mb-8 overflow-hidden rounded-[28px] bg-[#0F172A] px-6 py-8 sm:px-8 sm:py-10 lg:px-10">
                <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-[#2563EB]/20 blur-3xl" />

                <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-[#38BDF8]/10 blur-3xl" />

                <div className="relative z-10 flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#60A5FA]">
                            Academic Department
                        </p>

                        <h1 className="text-3xl font-bold tracking-[-0.04em] text-white sm:text-4xl lg:text-5xl">
                            {selectedDepartment.name}
                        </h1>

                        <p className="mt-4 max-w-2xl text-sm leading-6 text-[#94A3B8] sm:text-base">
                            {selectedDepartment.description ||
                                "Explore all courses available in this department."}
                        </p>
                    </div>

                    <div className="shrink-0 rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4 backdrop-blur-sm">
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#94A3B8]">
                            Courses
                        </p>

                        <p className="mt-1 text-3xl font-bold text-white">
                            {getCourseCount(selectedDepartment.id)}
                        </p>
                    </div>
                </div>
            </section>

            {/* ==================================================
                SEARCH
            ================================================== */}

            <div className="catalog-reveal catalog-reveal-2 mb-8 flex items-center gap-3 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
                <Search className="h-5 w-5 shrink-0 text-[#94A3B8]" />

                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search courses..."
                    className="w-full bg-transparent text-sm text-[#0F172A] outline-none placeholder:text-[#94A3B8]"
                />
            </div>

            {/* ==================================================
                COURSE GRID
            ================================================== */}

            <section className="catalog-reveal catalog-reveal-3">
                <div className="mb-5 flex items-end justify-between">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#2563EB]">
                            Course Collection
                        </p>

                        <h2 className="mt-1 text-2xl font-bold tracking-[-0.025em] text-[#0F172A] sm:text-3xl">
                            Available courses
                        </h2>
                    </div>

                    <span className="text-xs font-medium text-[#94A3B8]">
                        {selectedCourses.length}{" "}
                        {selectedCourses.length === 1
                            ? "course"
                            : "courses"}
                    </span>
                </div>

                {selectedCourses.length === 0 ? (
                    <div className="flex min-h-[350px] flex-col items-center justify-center rounded-[24px] border border-dashed border-[#CBD5E1] bg-white px-6 text-center">
                        <BookOpen className="h-9 w-9 text-[#94A3B8]" />

                        <h3 className="mt-4 text-base font-bold text-[#0F172A]">
                            No courses found
                        </h3>

                        <p className="mt-1 text-sm text-[#64748B]">
                            Try another search term.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                        {selectedCourses.map((course, index) => (
                            <article
                                key={course.id}
                                className="catalog-card-reveal group overflow-hidden rounded-[22px] border border-[#E2E8F0] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-1 hover:border-[#CBD5E1] hover:shadow-[0_15px_35px_rgba(15,23,42,0.08)]"
                                style={{
                                    animationDelay: `${
                                        500 + index * 100
                                    }ms`,
                                }}
                            >
                                {/* IMAGE */}

                                <div className="relative h-44 overflow-hidden bg-[#E2E8F0]">
                                    <img
                                        src={
                                            courseImages[
                                                index % courseImages.length
                                            ]
                                        }
                                        alt=""
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />

                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/60 via-transparent to-transparent" />

                                    <span className="absolute left-4 top-4 rounded-lg bg-white px-2.5 py-1.5 text-[10px] font-bold tracking-[0.08em] text-[#2563EB] shadow-sm">
                                        {course.code}
                                    </span>
                                </div>

                                {/* CONTENT */}

                                <div className="p-5 sm:p-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <h3 className="text-lg font-bold leading-tight tracking-[-0.02em] text-[#0F172A]">
                                            {course.name}
                                        </h3>

                                        <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-[#94A3B8] transition-colors group-hover:text-[#2563EB]" />
                                    </div>

                                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#64748B]">
                                        {course.description ||
                                            "No course description available."}
                                    </p>

                                    <div className="mt-6 flex items-center justify-between border-t border-[#E2E8F0] pt-4">
                                        <div>
                                            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#94A3B8]">
                                                Credits
                                            </p>

                                            <p className="mt-1 text-sm font-bold text-[#0F172A]">
                                                {course.credits}
                                            </p>
                                        </div>

                                        <span className="rounded-lg bg-[#EFF6FF] px-3 py-2 text-xs font-bold text-[#2563EB]">
                                            Available
                                        </span>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}