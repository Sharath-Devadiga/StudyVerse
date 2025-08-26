'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function SignUpPage() {
  const searchParams = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'user_exists') {
      setError('An account with this Google account already exists. Please sign in instead.');
    }
  }, [searchParams]);

  const handleGoogleSignUp = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/google?action=signup`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Start your journey with us today
          </p>
        </div>

        <div className="mt-6 space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleSignUp}
            className="group relative w-full flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google Logo"
              className="w-5 h-5"
            />
            Sign up with Google
          </button>

          <div className="text-center">
            <span className="text-sm text-gray-600">
              Already have an account?{' '}
              <a
                href="/auth/signin"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign in
              </a>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
