"use client";

import Link from "next/link";
import type { Room } from "../../../lib/types";

export function ProfileRoomsList({ rooms }: { rooms: Room[] }) {
  if (rooms.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        You haven&apos;t joined any semester rooms yet.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-gray-100">
      {rooms.map((room) => (
        <li key={room.id}>
          <Link
            href={`/room/${room.id}`}
            className="flex items-center justify-between gap-4 py-3 transition hover:bg-gray-50"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-900">
                {room.name}
              </p>
              <p className="truncate text-xs text-gray-500">
                {room.department.name} &middot; {room.university.name}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
              Sem {room.semester.number}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
