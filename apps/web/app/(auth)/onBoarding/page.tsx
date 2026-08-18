// app/(auth)/onBoarding/page.tsx
import { OnBoardingForm } from "../../components/auth/OnBoardingForm";

export default function OnBoardingPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <OnBoardingForm />
    </main>
  );
}
