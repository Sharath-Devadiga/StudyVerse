"use client";

import Link from "next/link";
import { ArrowRight, Building2, Users } from "lucide-react";
import type { Room } from "../../../lib/types";

export function RoomCard({ room }: { room: Room }) {
  return (
    <Link
      href={`/room/${room.id}`}
      className="group flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
            Semester {room.semester.number}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Users className="h-3.5 w-3.5" />
            {room.memberCount}
          </span>
        </div>

        <h3 className="mt-3 text-base font-semibold text-gray-900">
          {room.department.name}
        </h3>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
          <Building2 className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{room.university.name}</span>
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-3">
        <span className="truncate text-sm text-gray-500">{room.name}</span>
        <span className="flex items-center gap-1 text-sm font-medium text-blue-600 opacity-0 transition-opacity group-hover:opacity-100">
          Open
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}
