"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/onBoarding");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>Authentication successful. Redirecting...</p>
    </div>
  );
}