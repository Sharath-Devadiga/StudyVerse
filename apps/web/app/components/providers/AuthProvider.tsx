"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/AuthStore/useAuthStore";
import { getUserProfile } from "../../../lib/api/user";
import { getUserRooms } from "../../../lib/api/room";
import { isOnboardingComplete } from "../../../lib/utils";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { setUser, setHydrated, setRooms, isHydrated } = useAuthStore();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    async function hydrate() {
      try {
        const user = await getUserProfile();
        setUser(user);

        if (isOnboardingComplete(user)) {
          const rooms = await getUserRooms();
          setRooms(rooms);
        }
      } catch {
        setUser(null);
        setRooms([]);
      } finally {
        setHydrated(true);
      }
    }

    hydrate();
  }, [setUser, setHydrated, setRooms]);

  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export function useAuthRedirect(options: {
  requireAuth?: boolean;
  requireOnboarding?: boolean;
  redirectIfAuthenticated?: string;
}) {
  const router = useRouter();
  const { user, isAuthenticated, isHydrated, rooms } = useAuthStore();

  useEffect(() => {
    if (!isHydrated) return;

    if (options.requireAuth && !isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (options.redirectIfAuthenticated && isAuthenticated) {
      if (user && isOnboardingComplete(user) && rooms.length > 0) {
        router.replace(options.redirectIfAuthenticated);
      } else if (isAuthenticated) {
        router.replace("/onBoarding");
      }
      return;
    }

    if (options.requireOnboarding && user && !isOnboardingComplete(user)) {
      // Stay on onboarding
      return;
    }

    if (
      options.requireOnboarding === false &&
      user &&
      isOnboardingComplete(user) &&
      rooms.length > 0
    ) {
      // User completed onboarding, shouldn't be on onboarding page
    }
  }, [
    isHydrated,
    isAuthenticated,
    user,
    rooms,
    router,
    options.requireAuth,
    options.requireOnboarding,
    options.redirectIfAuthenticated,
  ]);
}
