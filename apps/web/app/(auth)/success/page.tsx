"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserProfile } from "../../../lib/api/user";
import { getUserRooms } from "../../../lib/api/room";
import { useAuthStore } from "../../store/AuthStore/useAuthStore";
import { isOnboardingComplete ,setStoredToken } from "../../../lib/utils";

export default function AuthSuccessPage() {
  const router = useRouter();
  const { setUser, setRooms } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const hash = window.location.hash;

if (hash.startsWith("#token=")) {
  const token = decodeURIComponent(hash.substring("#token=".length));
  setStoredToken(token);

  window.history.replaceState(
    {},
    document.title,
    window.location.pathname + window.location.search
  );
}

    async function finalize() {
      try {
        // The backend set an httpOnly session cookie during the OAuth callback,
        // so we can load the profile directly with credentials.
        const user = await getUserProfile();
        if (cancelled) return;
        setUser(user);

        if (isOnboardingComplete(user)) {
          const rooms = await getUserRooms();
          if (cancelled) return;
          setRooms(rooms);
          if (rooms.length > 0) {
            router.replace("/dashboard");
            return;
          }
        }
        router.replace("/onBoarding");
      } catch {
        if (!cancelled) setError("We couldn't sign you in. Please try again.");
      }
    }

    finalize();
    return () => {
      cancelled = true;
    };
  }, [router, setUser, setRooms]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      {error ? (
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={() => router.replace("/login")}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Back to sign in
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-sm text-gray-500">
            Authentication successful. Setting things up...
          </p>
        </div>
      )}
    </main>
  );
}
