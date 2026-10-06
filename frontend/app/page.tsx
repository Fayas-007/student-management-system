"use client";

import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f5f3ee] text-[#111111]">

      {/* =========================
          HEADER
      ========================== */}
      <header className="absolute inset-x-0 top-0 z-30">
        <div className="mx-auto flex h-[88px] max-w-[1500px] items-center justify-between px-7 lg:px-12">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#111111] text-sm font-semibold text-white">
              N
            </div>

            <span className="text-lg font-semibold tracking-[-0.03em]">
              NEXORA
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden items-center gap-9 text-sm text-[#444444] md:flex">
            <a
              href="#features"
              className="transition-colors hover:text-black"
            >
              Features
            </a>

            <a
              href="#about"
              className="transition-colors hover:text-black"
            >
              Why us
            </a>

            <a
              href="#contact"
              className="transition-colors hover:text-black"
            >
              Contact
            </a>
          </nav>

          {/* Header Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg border border-[#999999] px-5 py-2.5 text-sm font-medium transition hover:bg-white"
            >
              Sign in
            </Link>

            <Link
              href="/register"
              className="rounded-lg bg-[#111111] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#292929]"
            >
              Get started
            </Link>
          </div>

        </div>
      </header>


      {/* =========================
          HERO
      ========================== */}
      <section className="relative h-screen min-h-[700px] overflow-hidden">

        {/* =========================
            RIGHT IMAGE
        ========================== */}
        <div className="absolute inset-y-0 right-0 z-0 hidden w-[56%] lg:block">

          <Image
            src="/hero.png"
            alt="Student management system dashboard"
            fill
            priority
            sizes="56vw"
            className="object-cover object-center"
          />

          {/* Soft fade into background */}
          <div className="absolute inset-y-0 left-0 w-[38%] bg-gradient-to-r from-[#f5f3ee] via-[#f5f3ee]/75 to-transparent" />

        </div>


        {/* =========================
            LEFT CONTENT
        ========================== */}
{/* LEFT CONTENT */}
<div className="relative z-10 flex h-full w-full items-center">

  <div className="mx-auto w-full max-w-[1500px] px-7 lg:px-12">

    <div className="max-w-[760px] lg:ml-[1vw] xl:ml-[2vw] translate-y-[35px]">

      {/* Eyebrow */}
      <p className="mb-5 text-xs font-medium uppercase tracking-[0.32em] text-[#666666] sm:text-sm">
        Student Management System
      </p>

      {/* Main Heading */}
      <h1 className="text-[52px] font-semibold leading-[0.98] tracking-[-0.055em] sm:text-[64px] lg:text-[clamp(60px,5vw,84px)]">
        Simplify academic
        <br />
        management,
        <br />
        <span className="text-[#5d5d5d]">
          empower your institution.
        </span>
      </h1>

      {/* Description */}
      <p className="mt-6 max-w-[620px] text-base leading-7 text-[#5c5c5c] sm:text-lg sm:leading-8">
        Manage students, courses, enrollments and academic
        information through a modern, reliable and easy-to-use
        platform.
      </p>

      {/* CTA */}
      <div className="mt-7 flex flex-wrap gap-3">

        <Link
          href="/register"
          className="group flex items-center gap-5 rounded-lg bg-[#111111] px-7 py-4 text-sm font-medium text-white transition hover:bg-[#292929]"
        >
          Get started

          <span className="text-lg transition-transform duration-200 group-hover:translate-x-1">
            →
          </span>
        </Link>

        <Link
          href="/login"
          className="rounded-lg border border-[#8d8d8d] px-8 py-4 text-sm font-medium transition hover:bg-white"
        >
          Sign in
        </Link>

      </div>

      {/* Feature Strip */}
      <div
        id="features"
        className="mt-9 flex max-w-[700px] border-t border-[#c8c5bf] pt-5"
      >

        <div className="flex flex-1 items-center gap-3">
          <span className="text-2xl">♙</span>

          <div>
            <p className="text-sm font-medium">Student</p>
            <p className="text-sm text-[#777777]">Management</p>
          </div>
        </div>

        <div className="mx-4 w-px bg-[#c8c5bf]" />

        <div className="flex flex-1 items-center gap-3">
          <span className="text-2xl">▢</span>

          <div>
            <p className="text-sm font-medium">Course</p>
            <p className="text-sm text-[#777777]">Management</p>
          </div>
        </div>

        <div className="mx-4 w-px bg-[#c8c5bf]" />

        <div className="flex flex-1 items-center gap-3">
          <span className="text-2xl">▤</span>

          <div>
            <p className="text-sm font-medium">Academic</p>
            <p className="text-sm text-[#777777]">Insights</p>
          </div>
        </div>

      </div>

      {/* Bottom Caption */}
      <div className="mt-6 flex items-center gap-3">

        <div className="h-px w-7 bg-[#999999]" />

        <p className="text-[10px] uppercase tracking-[0.24em] text-[#777777]">
          Built for a better academic experience
        </p>

      </div>

    </div>

  </div>

</div>

      </section>

    </main>
  );
}