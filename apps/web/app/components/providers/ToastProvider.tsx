"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

interface ToastContextValue {
  toast: (options: {
    title?: string;
    description?: string;
    variant?: "default" | "destructive";
  }) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let toastCount = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(
    ({
      title,
      description,
      variant = "default",
    }: {
      title?: string;
      description?: string;
      variant?: "default" | "destructive";
    }) => {
      const id = String(++toastCount);
      setToasts((prev) => [...prev, { id, title, description, variant }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="alert"
            className={`rounded-lg border px-4 py-3 shadow-lg animate-in slide-in-from-right ${
              t.variant === "destructive"
                ? "border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100"
                : "border-gray-200 bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            }`}
          >
            {t.title && <p className="font-semibold text-sm">{t.title}</p>}
            {t.description && (
              <p className="text-sm opacity-90 mt-0.5">{t.description}</p>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}
