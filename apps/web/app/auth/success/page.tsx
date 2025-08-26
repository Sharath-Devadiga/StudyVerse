'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthSuccessPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/me`, {
          credentials: 'include', 
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        } else {
          router.push('/auth/signin');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/auth/signin');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Authentication Successful!
          </h2>
          {user && (
            <p className="mt-2 text-center text-sm text-gray-600">
              Welcome back! Redirecting you to dashboard...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}