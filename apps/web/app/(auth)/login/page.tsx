// app/(auth)/login/page.tsx
import { LoginForm } from "../../components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <LoginForm />
    </main>
  );
}