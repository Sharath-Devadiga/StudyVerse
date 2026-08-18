"use client";

import { useState } from "react";

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase();
  return (parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)).toUpperCase();
}

// Deterministic soft background based on the name so avatars stay stable.
const PALETTE = [
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-violet-100 text-violet-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
];

function colorFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return PALETTE[Math.abs(hash) % PALETTE.length]!;
}

export function Avatar({ name, src, size = 36, className = "" }: AvatarProps) {
  const [errored, setErrored] = useState(false);
  const dimension = { width: size, height: size };

  if (src && !errored) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src || "/placeholder.svg"}
        alt={name}
        width={size}
        height={size}
        onError={() => setErrored(true)}
        className={`shrink-0 rounded-full object-cover ${className}`}
        style={dimension}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <span
      aria-label={name}
      className={`flex shrink-0 items-center justify-center rounded-full font-medium ${colorFor(
        name
      )} ${className}`}
      style={{ ...dimension, fontSize: Math.max(11, size * 0.4) }}
    >
      {initials(name)}
    </span>
  );
}
