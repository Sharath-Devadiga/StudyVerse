"use client";

import { Hash, Loader2, Users } from "lucide-react";
import type { Channel } from "../../../lib/types";

interface RoomSidebarProps {
  channels: Channel[];
  channelsLoading: boolean;
  channelsError: string | null;
  activeChannelId: string | null;
  onSelectChannel: (channelId: string) => void;
  memberCount: number | null;
  memberCountLoading: boolean;
}

export function RoomSidebar({
  channels,
  channelsLoading,
  channelsError,
  activeChannelId,
  onSelectChannel,
  memberCount,
  memberCountLoading,
}: RoomSidebarProps) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <div className="mb-2 flex items-center gap-1.5 px-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          <Hash className="h-3.5 w-3.5" />
          Chats
        </div>

        {channelsLoading ? (
          <div className="flex items-center gap-2 px-2 py-2 text-sm text-gray-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading channels...
          </div>
        ) : channelsError ? (
          <p className="px-2 py-2 text-sm text-red-600">{channelsError}</p>
        ) : channels.length === 0 ? (
          <p className="px-2 py-2 text-sm text-gray-500">No channels created yet.</p>
        ) : (
          <nav className="space-y-1">
            {channels.map((channel) => (
              <button
                key={channel.id}
                type="button"
                onClick={() => onSelectChannel(channel.id)}
                className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm ${
                  channel.id === activeChannelId
                    ? "bg-blue-50 font-medium text-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span className="text-gray-400">#</span>
                <span className="truncate">{channel.name}</span>
              </button>
            ))}
          </nav>
        )}
      </div>

      <div className="border-t border-gray-100 px-3 py-3">
        <div className="mb-1 flex items-center gap-1.5 px-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          <Users className="h-3.5 w-3.5" />
          Members
        </div>

        {memberCountLoading ? (
          <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading...
          </div>
        ) : (
          <p className="px-2 py-1.5 text-sm text-gray-500">
            {memberCount ?? 0} {(memberCount ?? 0) === 1 ? "member" : "members"}
          </p>
        )}
      </div>
    </div>
  );
}
