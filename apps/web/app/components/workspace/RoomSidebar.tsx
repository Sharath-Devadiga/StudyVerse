"use client";

import Link from "next/link";
import { Hash, Loader2, Plus, Users } from "lucide-react";
import { Avatar } from "../layout/Avatar";
import type { Room, RoomMember } from "../../../lib/types";

interface RoomSidebarProps {
  rooms: Room[];
  activeRoomId: string;
  members: RoomMember[];
  membersLoading: boolean;
  membersError: string | null;
}

export function RoomSidebar({
  rooms,
  activeRoomId,
  members,
  membersLoading,
  membersError,
}: RoomSidebarProps) {
  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="px-3 py-4">
        <div className="mb-2 flex items-center justify-between px-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Study Rooms
          </h2>
          <Link
            href="/onBoarding"
            className="text-gray-400 hover:text-blue-600"
            aria-label="Join another study room"
            title="Join another study room"
          >
            <Plus className="h-4 w-4" />
          </Link>
        </div>
        <nav className="flex flex-col gap-0.5">
          {rooms.map((room) => {
            const active = room.id === activeRoomId;
            return (
              <Link
                key={room.id}
                href={`/room/${room.id}`}
                className={`flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors ${
                  active
                    ? "bg-blue-50 font-medium text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Hash
                  className={`h-4 w-4 shrink-0 ${active ? "text-blue-600" : "text-gray-400"}`}
                />
                <span className="min-w-0 flex-1 truncate">
                  {room.department.name}
                </span>
                <span
                  className={`shrink-0 rounded px-1.5 text-xs ${
                    active ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  S{room.semester.number}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto border-t border-gray-100 px-3 py-4">
        <div className="mb-2 flex items-center gap-1.5 px-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          <Users className="h-3.5 w-3.5" />
          Members
          {!membersLoading && !membersError && (
            <span className="text-gray-400">({members.length})</span>
          )}
        </div>

        {membersLoading ? (
          <div className="flex items-center gap-2 px-2 py-2 text-sm text-gray-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading...
          </div>
        ) : membersError ? (
          <p className="px-2 py-2 text-sm text-red-600">{membersError}</p>
        ) : members.length === 0 ? (
          <p className="px-2 py-2 text-sm text-gray-400">No members yet.</p>
        ) : (
          <ul className="flex max-h-48 flex-col gap-0.5 overflow-y-auto">
            {members.map((member) => (
              <li
                key={member.id}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5"
              >
                <Avatar name={member.name} src={member.avatar} size={26} />
                <span className="min-w-0 flex-1 truncate text-sm text-gray-700">
                  {member.name}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
