"use client";

import Link from "next/link";

const stats = [
  {
    label: "Total Students",
    value: "1,260",
    change: "+12%",
    icon: "♙",
  },
  {
    label: "Total Courses",
    value: "48",
    change: "+8%",
    icon: "▢",
  },
  {
    label: "Enrollments",
    value: "892",
    change: "+16%",
    icon: "▤",
  },
  {
    label: "Departments",
    value: "6",
    change: "+2",
    icon: "⌂",
  },
];

const enrollmentData = [
  { month: "Apr", value: 50 },
  { month: "May", value: 75 },
  { month: "Jun", value: 100 },
  { month: "Jul", value: 135 },
  { month: "Aug", value: 160 },
  { month: "Sep", value: 195 },
];

const students = [
  {
    name: "Ahmed Khan",
    course: "Computer Science",
    joined: "Oct 5, 2026",
  },
  {
    name: "Sara Ali",
    course: "Business Management",
    joined: "Oct 4, 2026",
  },
  {
    name: "Nimal Perera",
    course: "Information Technology",
    joined: "Oct 4, 2026",
  },
  {
    name: "Tharushi Silva",
    course: "Software Engineering",
    joined: "Oct 3, 2026",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f5f3ee] text-[#111111]">

      {/* Navigation */}
      <header className="absolute left-0 right-0 top-0 z-20">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-7 py-7 lg:px-12">

          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#111111] text-lg font-semibold text-white">
              N
            </div>

            <span className="text-xl font-semibold tracking-[-0.03em]">
              NEXORA
            </span>
          </div>

          {/* Navigation */}
          <nav className="hidden items-center gap-10 text-sm text-[#444444] md:flex">
            <a href="#features" className="transition hover:text-black">
              Features
            </a>

            <a href="#about" className="transition hover:text-black">
              Why us
            </a>

            <a href="#contact" className="transition hover:text-black">
              Contact
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg border border-[#999999] bg-transparent px-5 py-3 text-sm font-medium transition hover:bg-white"
            >
              Sign in
            </Link>

            <Link
              href="/register"
              className="rounded-lg bg-[#111111] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#292929]"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="min-h-screen">

        <div className="relative min-h-screen">


{/* LEFT CONTENT */}
{/* LEFT CONTENT */}
<div className="flex min-h-screen w-full flex-col justify-start px-7 pb-12 pt-[20vh] lg:pl-[11vw] lg:pr-[40%] xl:pl-[12vw]">
  <div className="w-full max-w-[800px]">
    <p className="mb-7 text-sm font-medium uppercase tracking-[0.3em] text-[#666666]">
      Student Management System
    </p>

    <h1 className="text-[52px] font-semibold leading-[0.98] tracking-[-0.055em] sm:text-[64px] lg:text-[clamp(64px,5vw,96px)]">
      Simplify academic
      <br />
      management,
      <br />
      <span className="text-[#5d5d5d]">empower your institution.</span>
    </h1>

    <p className="mt-8 max-w-[720px] text-xl leading-9 text-[#5c5c5c]">
      Manage students, courses, enrollments and academic
      information through a modern, reliable and easy-to-use
      platform.
    </p>

    <div className="mt-10 flex flex-wrap gap-4">
      <Link
        href="/register"
        className="group flex items-center gap-5 rounded-lg bg-[#111111] px-8 py-5 text-base font-medium text-white transition hover:bg-[#292929]"
      >
        Get started
        <span className="text-xl transition-transform group-hover:translate-x-1">→</span>
      </Link>

      <Link
        href="/login"
        className="rounded-lg border border-[#8d8d8d] bg-transparent px-9 py-5 text-base font-medium transition hover:bg-white"
      >
        Sign in
      </Link>
    </div>

    <div className="mt-20 flex w-full max-w-[720px] border-t border-[#c8c5bf] pt-7">
      <div className="flex flex-1 items-center gap-3">
        <span className="text-3xl">♙</span>
        <div>
          <p className="text-base font-medium">Student</p>
          <p className="text-base text-[#777777]">Management</p>
        </div>
      </div>

      <div className="mx-5 w-px bg-[#c8c5bf]" />

      <div className="flex flex-1 items-center gap-3">
        <span className="text-3xl">▢</span>
        <div>
          <p className="text-base font-medium">Course</p>
          <p className="text-base text-[#777777]">Management</p>
        </div>
      </div>

      <div className="mx-5 w-px bg-[#c8c5bf]" />

      <div className="flex flex-1 items-center gap-3">
        <span className="text-3xl">▤</span>
        <div>
          <p className="text-base font-medium">Academic</p>
          <p className="text-base text-[#777777]">Insights</p>
        </div>
      </div>
    </div>

    <div className="mt-14 flex items-center gap-4">
      <div className="h-px w-8 bg-[#999999]" />
      <p className="text-[11px] uppercase tracking-[0.25em] text-[#777777]">
        Built for a better academic experience
      </p>
    </div>
  </div>
</div>


          {/* RIGHT VISUAL */}
          <div className="absolute right-0 top-0 hidden h-full w-[42%] overflow-hidden bg-[#d7d3ca] lg:block">

            {/* Architectural background */}
            <div className="absolute inset-0">

              <div className="absolute right-[18%] top-0 h-full w-[2px] bg-black/10" />

              <div className="absolute right-[42%] top-0 h-full w-[7px] bg-[#242424]" />

              <div className="absolute left-[10%] top-0 h-full w-[2px] bg-black/10" />

              <div className="absolute -left-20 top-[18%] h-[2px] w-[800px] rotate-[28deg] bg-black/10" />

              <div className="absolute -left-20 top-[55%] h-[2px] w-[800px] rotate-[28deg] bg-black/10" />

            </div>


            {/* Dashboard window */}
            <div className="absolute left-[8%] right-[-5%] top-[23%] rotate-[-2deg] rounded-[18px] border-[7px] border-[#181818] bg-[#111111] p-2 shadow-2xl">

              <div className="flex min-h-[570px] overflow-hidden rounded-lg bg-[#f6f6f4]">

                {/* Sidebar */}
                <aside className="w-[155px] shrink-0 bg-[#151515] px-4 py-6 text-white">

                  <div className="mb-9 flex items-center gap-2">

                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-xs font-bold text-black">
                      N
                    </div>

                    <span className="text-xs font-semibold">
                      NEXORA
                    </span>

                  </div>

                  <p className="mb-3 px-2 text-[8px] uppercase tracking-widest text-[#777777]">
                    Workspace
                  </p>

                  <div className="space-y-1 text-[10px]">

                    <div className="rounded-md bg-[#343434] px-3 py-2">
                      Dashboard
                    </div>

                    <div className="px-3 py-2 text-[#aaaaaa]">
                      Students
                    </div>

                    <div className="px-3 py-2 text-[#aaaaaa]">
                      Courses
                    </div>

                    <div className="px-3 py-2 text-[#aaaaaa]">
                      Enrollments
                    </div>

                    <div className="px-3 py-2 text-[#aaaaaa]">
                      Departments
                    </div>

                    <div className="px-3 py-2 text-[#aaaaaa]">
                      Users
                    </div>

                  </div>

                </aside>


                {/* Dashboard */}
                <div className="min-w-0 flex-1 p-6">

                  <div className="mb-6 flex items-center justify-between">

                    <div>

                      <p className="text-[9px] text-[#888888]">
                        Overview
                      </p>

                      <h2 className="mt-1 text-xl font-semibold">
                        Dashboard
                      </h2>

                      <p className="mt-1 text-[9px] text-[#888888]">
                        Welcome back, Admin
                      </p>

                    </div>

                    <div className="flex items-center gap-3">

                      <div className="w-32 rounded-md border border-[#dddddd] bg-white px-3 py-2 text-[8px] text-[#999999]">
                        Search...
                      </div>

                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#202020] text-[9px] text-white">
                        A
                      </div>

                    </div>

                  </div>


                  {/* Stats */}
                  <div className="grid grid-cols-4 gap-2">

                    {stats.map((stat) => (
                      <div
                        key={stat.label}
                        className="rounded-lg border border-[#e1e1df] bg-white p-3"
                      >

                        <div className="flex items-center justify-between">

                          <p className="text-[7px] text-[#888888]">
                            {stat.label}
                          </p>

                          <span className="text-[11px]">
                            {stat.icon}
                          </span>

                        </div>

                        <p className="mt-3 text-lg font-semibold">
                          {stat.value}
                        </p>

                        <p className="mt-1 text-[7px] text-emerald-600">
                          ↑ {stat.change}
                        </p>

                      </div>
                    ))}

                  </div>


                  {/* Chart + table */}
                  <div className="mt-3 grid grid-cols-[1.1fr_0.9fr] gap-3">

                    {/* Chart */}
                    <div className="rounded-lg border border-[#e1e1df] bg-white p-4">

                      <p className="text-[9px] font-semibold">
                        Student Enrollments
                      </p>

                      <p className="mt-1 text-[7px] text-[#999999]">
                        Past 6 months
                      </p>

                      <div className="mt-5 flex h-44 items-end justify-between gap-3 border-b border-[#eeeeee] px-2">

                        {enrollmentData.map((item) => (
                          <div
                            key={item.month}
                            className="flex h-full flex-1 flex-col justify-end"
                          >

                            <div
                              className="w-full rounded-t-sm bg-[#222222]"
                              style={{
                                height: `${item.value / 2}%`,
                              }}
                            />

                            <span className="mt-2 text-center text-[7px] text-[#999999]">
                              {item.month}
                            </span>

                          </div>
                        ))}

                      </div>

                    </div>


                    {/* Recent students */}
                    <div className="rounded-lg border border-[#e1e1df] bg-white p-4">

                      <div className="flex items-center justify-between">

                        <p className="text-[9px] font-semibold">
                          Recent Students
                        </p>

                        <span className="text-[7px] text-[#777777]">
                          View all
                        </span>

                      </div>

                      <div className="mt-5">

                        <div className="grid grid-cols-[1fr_1fr_55px] border-b border-[#eeeeee] pb-2 text-[7px] text-[#999999]">
                          <span>Name</span>
                          <span>Course</span>
                          <span>Joined</span>
                        </div>

                        {students.map((student) => (
                          <div
                            key={student.name}
                            className="grid grid-cols-[1fr_1fr_55px] border-b border-[#f0f0f0] py-3 text-[7px]"
                          >

                            <span className="font-medium">
                              {student.name}
                            </span>

                            <span className="text-[#777777]">
                              {student.course}
                            </span>

                            <span className="text-[#777777]">
                              {student.joined}
                            </span>

                          </div>
                        ))}

                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </div>


            {/* Foreground architectural surface */}
            <div className="absolute bottom-0 left-0 right-0 h-[19%] border-t border-black/10 bg-[#aaa59c]" />

            {/* Plant silhouette */}
            <div className="absolute bottom-[17%] right-[-20px] text-[150px] opacity-20">
              🌿
            </div>

          </div>

        </div>

      </section>

    </main>
  );
}