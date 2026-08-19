"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "./store/AuthStore/useAuthStore";
import { isOnboardingComplete } from "../lib/utils";
import { LandingPlaceholder } from "./components/landing/LandingPlaceholder";

export default function RootPage() {
  const router = useRouter();
  const { isHydrated, isAuthenticated, user, rooms } = useAuthStore();

  useEffect(() => {
    if (!isHydrated) return;

    if (!isAuthenticated || !user) return;

    if (isOnboardingComplete(user) && rooms.length > 0) {
      router.replace("/dashboard");
    } else {
      router.replace("/onBoarding");
    }
  }, [isHydrated, isAuthenticated, user, rooms, router]);

  if (isHydrated && (!isAuthenticated || !user)) {
    return <LandingPlaceholder />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="text-sm text-gray-500">Loading StudyVerse...</p>
      </div>
    </div>
  );
}
