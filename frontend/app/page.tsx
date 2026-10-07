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
        <div className="mx-auto flex h-[80px] max-w-[1500px] items-center justify-between px-7 lg:px-12">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#111111] text-sm font-semibold text-white">
              N
            </div>

            <span className="text-lg font-semibold tracking-[-0.03em]">
              NEXORA
            </span>
          </Link>

          {/* Header Actions */}
          <div className="flex items-center gap-2.5">

            {/* Sign In */}
            <Link
              href="/login"
              className="flex h-[42px] items-center justify-center rounded-lg bg-white px-5 text-sm font-medium text-[#111111] shadow-sm ring-1 ring-[#d0d0d0] transition hover:bg-[#f7f7f7]"
            >
              Sign in
            </Link>

            {/* Get Started */}
            <Link
              href="/register"
              className="flex h-[42px] items-center justify-center rounded-lg bg-[#111111] px-5 text-sm font-medium text-white transition hover:bg-[#292929]"
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
            RIGHT SIDE IMAGE
        ========================== */}
        <div className="absolute inset-y-0 -right-[50px] z-0 hidden w-[60%] lg:block">

          <Image
            src="/hero.png"
            alt="Student management system dashboard"
            fill
            priority
            sizes="60vw"
            className="object-cover object-center"
          />

          {/* Fade image into page background */}
          <div className="absolute inset-y-0 left-0 w-[38%] bg-gradient-to-r from-[#f5f3ee] via-[#f5f3ee]/75 to-transparent" />

        </div>


        {/* =========================
            LEFT CONTENT
        ========================== */}
        <div className="relative z-10 flex h-full items-center">

          <div className="mx-auto w-full max-w-[1500px] px-7 lg:px-12">

            <div className="max-w-[760px] translate-y-[35px] lg:ml-[1vw] xl:ml-[2vw]">

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


              {/* =========================
                    HERO BUTTONS
                ========================= */}
              <div className="mt-8 flex items-center gap-3">

                {/* PRIMARY CTA */}
                <Link
                  href="/register"
                  className="group relative flex h-[46px] min-w-[158px] items-center justify-center gap-3 overflow-hidden rounded-[8px] bg-[#111111] px-6 text-[14px] font-medium tracking-[-0.01em] text-white shadow-[0_4px_14px_rgba(0,0,0,0.20)] transition-all duration-300 hover:-translate-y-[1px] hover:bg-[#000000] hover:shadow-[0_7px_20px_rgba(0,0,0,0.25)]"
                >
                  <span className="relative z-10">
                    Get started
                  </span>

                  <span className="relative z-10 text-[16px] font-normal leading-none transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>

                  {/* subtle shine */}
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                </Link>


                {/* SECONDARY CTA */}
                <Link
                  href="/login"
                  className="flex h-[46px] min-w-[148px] items-center justify-center rounded-[8px] bg-white px-6 text-[14px] font-medium tracking-[-0.01em] text-[#111111] shadow-[0_2px_7px_rgba(0,0,0,0.06)] ring-1 ring-[#d2d0cc] transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#fafafa] hover:ring-[#bdbab5]"
                >
                  Sign in
                </Link>

              </div>

              {/* =========================
                  FEATURE STRIP
              ========================== */}
              <div
                id="features"
                className="mt-8 flex max-w-[700px] border-t border-[#c8c5bf] pt-5"
              >

                {/* Student */}
                <div className="flex flex-1 items-center gap-3">

                  <span className="text-2xl">
                    ♙
                  </span>

                  <div>
                    <p className="text-sm font-medium">
                      Student
                    </p>

                    <p className="text-sm text-[#777777]">
                      Management
                    </p>
                  </div>

                </div>


                {/* Divider */}
                <div className="mx-4 w-px bg-[#c8c5bf]" />


                {/* Course */}
                <div className="flex flex-1 items-center gap-3">

                  <span className="text-2xl">
                    ▢
                  </span>

                  <div>
                    <p className="text-sm font-medium">
                      Course
                    </p>

                    <p className="text-sm text-[#777777]">
                      Management
                    </p>
                  </div>

                </div>


                {/* Divider */}
                <div className="mx-4 w-px bg-[#c8c5bf]" />


                {/* Academic */}
                <div className="flex flex-1 items-center gap-3">

                  <span className="text-2xl">
                    ▤
                  </span>

                  <div>
                    <p className="text-sm font-medium">
                      Academic
                    </p>

                    <p className="text-sm text-[#777777]">
                      Insights
                    </p>
                  </div>

                </div>

              </div>


              {/* =========================
                  BOTTOM CAPTION
              ========================== */}
              <div className="mt-5 flex items-center gap-3">

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