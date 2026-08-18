"use client";

import Link from "next/link";
import { useAuthStore } from "../../store/AuthStore/useAuthStore";
import { Button } from "../ui/button";
import { BookOpen, LogOut } from "lucide-react";

export function AppHeader() {
  const { user, logout } = useAuthStore();

  return (
    <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
          <BookOpen className="h-5 w-5 text-blue-600" />
          StudyVerse
        </Link>
        <div className="flex items-center gap-3">
          {user && (
            <span className="hidden text-sm text-gray-600 dark:text-gray-400 sm:inline">
              {user.name}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => logout()}
            aria-label="Log out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
