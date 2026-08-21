"use client";

import Link from "next/link";
import { Moon, SunMedium } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function LandingPlaceholder() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <div className="min-h-screen bg-white text-slate-950 transition-colors dark:bg-slate-950 dark:text-slate-50">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
          <Link href="/" className="flex items-center">
  <img
    src="/image.png"
    alt="StudyVerse"
    className="h-16 w-auto object-contain"
  />
</Link>

          <nav className="hidden items-center gap-8 text-sm text-slate-500 md:flex dark:text-slate-300">
            <a href="#features" className="transition hover:text-slate-950 dark:hover:text-slate-100">
              Features
            </a>
            <a href="#ai-summary" className="transition hover:text-slate-950 dark:hover:text-slate-100">
              AI Summary
            </a>
            <a href="#how-it-works" className="transition hover:text-slate-950 dark:hover:text-slate-100">
              How it works
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {isDark ? <SunMedium className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <Link
              href="/login"
              className="hidden text-sm font-medium text-slate-600 transition hover:text-slate-950 dark:text-slate-300 dark:hover:text-slate-100 sm:block"
            >
              Log in
            </Link>

            <Link
              href="/signup"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="overflow-hidden border-b border-slate-100">
          <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 lg:grid-cols-2 lg:px-8 lg:py-28">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-600">
                Academic Workspace
              </div>

              <h1 className="max-w-2xl text-5xl font-bold tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
                Your academic community,
                <span className="text-blue-600"> in one place.</span>
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-500">
                StudyVerse brings university discussions, study resources,
                semester rooms and AI-powered summaries into one organized
                workspace.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/signup"
                  className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
                >
                  Get Started
                </Link>

                <a
                  href="#features"
                  className="rounded-lg border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  Explore StudyVerse
                </a>
              </div>

              <p className="mt-5 text-xs text-slate-400">
                Built around how students actually study together.
              </p>
            </div>

            {/* Product Preview */}
            <div className="relative">
              <div className="absolute -inset-10 -z-10 bg-blue-100/40 blur-3xl" />

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/70">
                {/* Window bar */}
                <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                  <span className="ml-3 text-xs text-slate-400">
                    StudyVerse · Semester 2
                  </span>
                </div>

                <div className="grid min-h-[360px] grid-cols-[140px_1fr] sm:grid-cols-[150px_1fr_190px]">
                  {/* Sidebar */}
                  <div className="border-r border-slate-200 bg-slate-50 p-3">
                    <p className="mb-4 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Channels
                    </p>

                    <div className="space-y-1 text-xs">
                      <div className="rounded-md px-2 py-2 text-slate-500">
                        # general
                      </div>

                      <div className="rounded-md bg-blue-50 px-2 py-2 font-medium text-blue-600">
                        # exam-prep
                      </div>

                      <div className="rounded-md px-2 py-2 text-slate-500">
                        # assignments
                      </div>
                    </div>
                  </div>

                  {/* Chat */}
                  <div className="p-4">
                    <div className="mb-5">
                      <p className="text-xs font-semibold text-slate-900">
                        # exam-prep
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Computer Science · Semester 2
                      </p>
                    </div>

                    <div className="space-y-5">
                      <div className="flex gap-3">
                        <div className="h-7 w-7 shrink-0 rounded-full bg-blue-100" />

                        <div>
                          <p className="text-xs font-semibold">
                            Aisha
                            <span className="ml-2 font-normal text-slate-400">
                              10:41
                            </span>
                          </p>

                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            Does anyone have the DBMS normalization notes?
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="h-7 w-7 shrink-0 rounded-full bg-slate-200" />

                        <div>
                          <p className="text-xs font-semibold">
                            Rohan
                            <span className="ml-2 font-normal text-slate-400">
                              10:44
                            </span>
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            Yeah, uploading them now.
                          </p>

                          <div className="mt-2 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded bg-blue-600 text-[8px] font-bold text-white">
                              PDF
                            </div>

                            <span className="text-[11px] font-medium text-slate-600">
                              DBMS-Notes.pdf
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="h-7 w-7 shrink-0 rounded-full bg-blue-100" />

                        <div>
                          <p className="text-xs font-semibold">
                            Aisha
                            <span className="ml-2 font-normal text-slate-400">
                              10:46
                            </span>
                          </p>

                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            Perfect. Can someone explain 1NF vs 2NF?
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Summary */}
                  <div className="hidden border-l border-slate-200 bg-slate-50 p-4 sm:block">
                    <div className="mb-5 flex items-center gap-2">
                      <span className="text-blue-600">✦</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                        AI Summary
                      </span>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <p className="text-[10px] font-bold uppercase text-slate-800">
                          Discussions
                        </p>
                        <p className="mt-1 text-[11px] leading-4 text-slate-500">
                          DBMS normalization was discussed.
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase text-slate-800">
                          Materials
                        </p>
                        <p className="mt-1 text-[11px] leading-4 text-slate-500">
                          DBMS notes were shared.
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase text-slate-800">
                          Study Points
                        </p>
                        <p className="mt-1 text-[11px] leading-4 text-slate-500">
                          Review 1NF and 2NF.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Problem */}
        <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Why StudyVerse
            </p>

            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Your study group shouldn't live in five different apps.
            </h2>

            <p className="mt-4 text-base leading-7 text-slate-500">
              Discussions get buried, files disappear into folders and
              important messages become difficult to find.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-7">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Scattered
              </p>

              <div className="mt-5 space-y-3">
                {[
                  "WhatsApp — discussions",
                  "Telegram — shared files",
                  "Google Drive — notes",
                  "Random chats — important messages",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-7">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Organized with StudyVerse
              </p>

              <div className="mt-5 space-y-3">
                {[
                  "Semester-based study rooms",
                  "Focused channels",
                  "Resources connected to discussions",
                  "AI summaries for catching up",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-lg border border-blue-100 bg-white px-4 py-3 text-sm font-medium text-slate-700"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white">
                      ✓
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section
          id="features"
          className="border-y border-slate-100 bg-slate-50/60"
        >
          <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                Core features
              </p>

              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Built around how students actually study.
              </h2>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: "Study Rooms",
                  text: "Organize your academic community by university, department and semester.",
                  icon: "01",
                },
                {
                  title: "Real-time Chat",
                  text: "Discuss assignments, exams and questions instantly inside focused channels.",
                  icon: "02",
                },
                {
                  title: "Study Resources",
                  text: "Keep PDFs, notes, images and assignments connected to the right channel.",
                  icon: "03",
                },
                {
                  title: "AI Summary",
                  text: "Catch up on recent channel discussions and shared study material in seconds.",
                  icon: "04",
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-slate-200 bg-white p-6 transition duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/50"
                >
                  <span className="text-xs font-bold text-blue-600">
                    {feature.icon}
                  </span>

                  <h3 className="mt-5 font-semibold text-slate-950">
                    {feature.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {feature.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* AI Summary */}
        <section id="ai-summary">
          <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
            <div className="overflow-hidden rounded-3xl bg-slate-950 p-8 text-white sm:p-12 lg:p-16">
              <div className="grid items-center gap-12 lg:grid-cols-2">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-blue-400">
                    AI Study Summary
                  </p>

                  <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                    Turn hours of discussion into minutes of revision.
                  </h2>

                  <p className="mt-5 max-w-lg leading-7 text-slate-400">
                    Open AI Summary inside any channel and quickly understand
                    the important discussions, questions and study resources
                    from that channel.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-6">
                  <div className="flex items-center gap-2 text-sm font-semibold text-blue-400">
                    <span>✦</span>
                    AI Summary · # exam-prep
                  </div>

                  <div className="mt-7 space-y-6">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-white">
                        Important discussions
                      </p>
                      <p className="mt-2 text-sm text-slate-400">
                        DBMS normalization was a recurring discussion.
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-white">
                        Study materials
                      </p>
                      <p className="mt-2 text-sm text-slate-400">
                        DBMS-Notes.pdf was shared in the channel.
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-white">
                        Study points
                      </p>
                      <p className="mt-2 text-sm text-slate-400">
                        Review 1NF and 2NF before the exam.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section
          id="how-it-works"
          className="border-t border-slate-100"
        >
          <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                How it works
              </p>

              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                From sign-up to your study room in minutes.
              </h2>
            </div>

            <div className="mt-12 grid gap-8 md:grid-cols-4">
              {[
                ["01", "Create your account", "Set up your StudyVerse profile."],
                [
                  "02",
                  "Choose your university",
                  "Select your university and department.",
                ],
                [
                  "03",
                  "Join your semester",
                  "Enter the study room for your semester.",
                ],
                [
                  "04",
                  "Start studying",
                  "Chat, share resources and catch up with AI Summary.",
                ],
              ].map(([number, title, text]) => (
                <div key={number}>
                  <div className="text-sm font-bold text-blue-600">
                    {number}
                  </div>

                  <h3 className="mt-4 font-semibold text-slate-950">
                    {title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-5 pb-20 lg:px-8 lg:pb-28">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-blue-600 px-6 py-16 text-center text-white sm:px-10">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Build a better study space.
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-blue-100">
              Bring your academic conversations, resources and study community
              together with StudyVerse.
            </p>

            <div className="mt-8 flex justify-center gap-3">
              <Link
                href="/signup"
                className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
              >
                Get Started
              </Link>

              <Link
                href="/login"
                className="rounded-lg border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Log in
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div className="font-semibold text-slate-700">StudyVerse</div>

          <div className="flex gap-5">
            <a href="#features" className="hover:text-slate-700">
              Features
            </a>
            <a href="#ai-summary" className="hover:text-slate-700">
              AI Summary
            </a>
            <a href="#how-it-works" className="hover:text-slate-700">
              How it works
            </a>
          </div>

          <span>© 2026 StudyVerse</span>
        </div>
      </footer>
    </div>
  );
}