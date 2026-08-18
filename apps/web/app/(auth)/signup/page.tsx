// app/(auth)/signup/page.tsx
import { SignupForm } from "../../components/auth/SignupForm";

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <SignupForm />
    </main>
  );
}