"use client";

import { Sparkles } from "lucide-react";

export function AiSummaryPanel() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
        <Sparkles className="h-7 w-7" />
      </span>
      <h3 className="mt-4 text-base font-semibold text-gray-900">
        AI summaries are coming soon
      </h3>
      <p className="mt-1 max-w-sm text-sm text-gray-500">
        Automatic conversation summaries aren&apos;t available yet. This feature
        isn&apos;t supported by the StudyVerse backend at the moment.
      </p>
    </div>
  );
}
