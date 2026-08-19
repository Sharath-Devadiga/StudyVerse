"use client";

import { Loader2, Users } from "lucide-react";
import type { Room, RoomMember } from "../../../lib/types";

interface RoomSidebarProps {
  rooms: Room[];
  activeRoomId: string;
  members: RoomMember[];
  membersLoading: boolean;
  membersError: string | null;
}

export function RoomSidebar({
  rooms: _rooms,
  activeRoomId: _activeRoomId,
  members,
  membersLoading,
  membersError,
}: RoomSidebarProps) {
  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="border-b border-gray-100 px-3 py-4">
        <div className="mb-2 flex items-center gap-1.5 px-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          <Users className="h-3.5 w-3.5" />
          Members
          {!membersLoading && !membersError && <span className="text-gray-400">({members.length})</span>}
        </div>

        {membersLoading ? (
          <div className="flex items-center gap-2 px-2 py-2 text-sm text-gray-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading...
          </div>
        ) : membersError ? (
          <p className="px-2 py-2 text-sm text-red-600">{membersError}</p>
        ) : <p className="px-2 py-2 text-sm text-gray-500">{members.length} {members.length === 1 ? "member" : "members"}</p>}
      </div>
    </div>
  );
}
