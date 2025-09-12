'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthSuccessPage() {
  const router = useRouter();
  // This state is good for showing a personalized welcome message
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        // This fetch is great for confirming the session and getting user's name
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/me`, {
          credentials: 'include',
        });

        if (response.ok) {
          const userData = await response.json();
          setUserName(userData.name);
          // --- THIS IS THE FIX ---
          // Redirect to the main gatekeeper page. It will handle the rest.
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000); // 2-second delay to show the welcome message
        } else {
          // If the check fails, send them back to signin
          router.push('/auth/signin');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/auth/signin');
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndRedirect();
  }, [router]);

  // A more visually appealing loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold">
            Authentication Successful!
          </h2>
          {userName && (
            <p className="mt-2 text-center text-lg text-gray-400">
              Welcome back, {userName}! Redirecting you...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
