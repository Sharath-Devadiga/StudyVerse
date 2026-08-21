"use client";

import { ThemeProvider as NextThemeProvider } from "next-themes";
import { ToastProvider } from "./components/providers/ToastProvider";
import { AuthProvider } from "./components/providers/AuthProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="studyverse-theme"
    >
      <ToastProvider>
        <AuthProvider>{children}</AuthProvider>
      </ToastProvider>
    </NextThemeProvider>
  );
}
