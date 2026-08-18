"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/AuthStore/useAuthStore";
import { isOnboardingComplete } from "../../../lib/utils";

interface AuthGuardProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

export function AuthGuard({
  children,
  requireOnboarding = true,
}: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, isHydrated, user, rooms } = useAuthStore();

  useEffect(() => {
    if (!isHydrated) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (requireOnboarding) {
      if (!user || !isOnboardingComplete(user)) {
        router.replace("/onBoarding");
        return;
      }
      if (rooms.length === 0) {
        router.replace("/onBoarding");
      }
    }
  }, [isHydrated, isAuthenticated, user, rooms, requireOnboarding, router]);

  if (!isHydrated || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (requireOnboarding && user && (!isOnboardingComplete(user) || rooms.length === 0)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
