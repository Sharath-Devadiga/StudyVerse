"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/AuthStore/useAuthStore";
import { Bell, BookOpen, LogOut, Search, User as UserIcon } from "lucide-react";
import { Avatar } from "./Avatar";

interface AppHeaderProps {
  /** Optional controlled search box shown in the header (e.g. on the dashboard). */
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  };
}

export function AppHeader({ search }: AppHeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [openMenu, setOpenMenu] = useState<"user" | "notifications" | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
        <Link
          href="/dashboard"
          className="flex shrink-0 items-center gap-2 font-semibold text-gray-900"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
            <BookOpen className="h-4.5 w-4.5" />
          </span>
          <span className="hidden sm:inline">StudyVerse</span>
        </Link>

        {search ? (
          <div className="relative mx-auto w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={search.value}
              onChange={(e) => search.onChange(e.target.value)}
              placeholder={search.placeholder ?? "Search..."}
              className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              aria-label="Search"
            />
          </div>
        ) : (
          <div className="flex-1" />
        )}

        <div ref={containerRef} className="flex shrink-0 items-center gap-1">
          {/* Notifications */}
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setOpenMenu((m) => (m === "notifications" ? null : "notifications"))
              }
              className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
            </button>
            {openMenu === "notifications" && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
                <p className="text-sm font-medium text-gray-900">Notifications</p>
                <div className="mt-3 rounded-lg border border-dashed border-gray-200 bg-gray-50 px-3 py-6 text-center">
                  <p className="text-sm text-gray-500">You&apos;re all caught up.</p>
                </div>
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenMenu((m) => (m === "user" ? null : "user"))}
              className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 hover:bg-gray-100"
              aria-label="Account menu"
            >
              <Avatar name={user?.name ?? "?"} src={user?.avatar} size={30} />
              <span className="hidden max-w-[8rem] truncate text-sm font-medium text-gray-700 md:inline">
                {user?.name}
              </span>
            </button>
            {openMenu === "user" && (
              <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                <div className="border-b border-gray-100 px-4 py-3">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {user?.name}
                  </p>
                  <p className="truncate text-xs text-gray-500">{user?.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setOpenMenu(null);
                    router.push("/profile");
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  <UserIcon className="h-4 w-4 text-gray-400" />
                  Profile
                </button>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="flex w-full items-center gap-2 border-t border-gray-100 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
