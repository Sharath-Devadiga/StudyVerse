"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Lock,
  MessageSquare,
  FolderOpen,
  Sparkles,
} from "lucide-react";
import { AppHeader } from "../layout/AppHeader";
import { RoomSidebar } from "./RoomSidebar";
import { ChatPanel } from "./ChatPanel";
import { FilesPanel } from "./FilesPanel";
import { AiSummaryPanel } from "./AiSummaryPanel";
import { useRoomChat } from "./useRoomChat";
import { useAuthStore } from "../../store/AuthStore/useAuthStore";
import { getRoom, getRoomChannels } from "../../../lib/api/room";
import { getApiErrorMessage } from "../../../lib/utils";
import type { Channel, Room } from "../../../lib/types";

const roomCache = new Map<string, Room>();
const roomChannelsCache = new Map<string, Channel[]>();

type Tab = "chats" | "files" | "ai";

const TABS: { key: Tab; label: string; icon: typeof MessageSquare }[] = [
  { key: "chats", label: "Chats", icon: MessageSquare },
  { key: "files", label: "Files", icon: FolderOpen },
  { key: "ai", label: "AI Summary", icon: Sparkles },
];

export function WorkspaceContent({ roomId }: { roomId: string }) {
  const router = useRouter();
  const { rooms, setActiveRoomId } = useAuthStore();

  const [room, setRoom] = useState<Room | null>(null);
  const [roomLoading, setRoomLoading] = useState(true);
  const [roomError, setRoomError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [channelsLoading, setChannelsLoading] = useState(true);
  const [channelsError, setChannelsError] = useState<string | null>(null);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);

  const [tab, setTab] = useState<Tab>("chats");
  const loadRequestRef = useRef(0);
  const lastChannelByRoomRef = useRef<Record<string, string>>({});

  const chat = useRoomChat(forbidden ? null : roomId, activeChannelId);

  function selectChannel(channelId: string) {
    lastChannelByRoomRef.current[roomId] = channelId;
    setActiveChannelId(channelId);
  }

  useEffect(() => {
    setActiveRoomId(roomId);
  }, [roomId, setActiveRoomId]);

  // Load room details and channels with stale-safe cache-first behavior.
  useEffect(() => {
    const requestId = loadRequestRef.current + 1;
    loadRequestRef.current = requestId;

    const cachedRoom = roomCache.get(roomId) ?? rooms.find((candidate) => candidate.id === roomId) ?? null;
    const cachedChannels = roomChannelsCache.get(roomId) ?? null;

    setRoom(cachedRoom);
    setRoomLoading(!cachedRoom);
    setRoomError(null);
    setForbidden(false);

    setChannels(cachedChannels ?? []);
    setChannelsLoading(!cachedChannels);
    setChannelsError(null);
    const preferredCachedChannelId = lastChannelByRoomRef.current[roomId];
    setActiveChannelId(
      cachedChannels?.find((channel) => channel.id === preferredCachedChannelId)?.id ??
        cachedChannels?.[0]?.id ??
        null
    );

    const shouldFetchRoom = !cachedRoom;
    const shouldFetchChannels = !cachedChannels;
    if (!shouldFetchRoom && !shouldFetchChannels) return;

    const roomPromise = shouldFetchRoom ? getRoom(roomId) : Promise.resolve(cachedRoom as Room);
    const channelsPromise = shouldFetchChannels ? getRoomChannels(roomId) : Promise.resolve(cachedChannels as Channel[]);

    Promise.allSettled([roomPromise, channelsPromise]).then(([roomResult, channelsResult]) => {
      if (loadRequestRef.current !== requestId) return;

      const roomStatus = roomResult.status === "rejected" ? (roomResult.reason as { response?: { status?: number } })?.response?.status : undefined;
      const channelsStatus = channelsResult.status === "rejected" ? (channelsResult.reason as { response?: { status?: number } })?.response?.status : undefined;
      if (roomStatus === 403 || channelsStatus === 403) {
        setForbidden(true);
        setRoomLoading(false);
        setChannelsLoading(false);
        return;
      }

      if (roomResult.status === "fulfilled") {
        roomCache.set(roomId, roomResult.value);
        setRoom(roomResult.value);
      } else if (shouldFetchRoom) {
        setRoomError(getApiErrorMessage(roomResult.reason, "Failed to load this study room."));
      }
      setRoomLoading(false);

      if (channelsResult.status === "fulfilled") {
        roomChannelsCache.set(roomId, channelsResult.value);
        setChannels(channelsResult.value);
        const preferredChannelId = lastChannelByRoomRef.current[roomId];
        setActiveChannelId(
          channelsResult.value.find((channel) => channel.id === preferredChannelId)?.id ??
            channelsResult.value[0]?.id ??
            null
        );
      } else if (shouldFetchChannels) {
        setChannelsError(getApiErrorMessage(channelsResult.reason, "Failed to load channels."));
      }
      setChannelsLoading(false);
    });
  }, [roomId, rooms]);

  if (forbidden) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600">
            <Lock className="h-7 w-7" />
          </span>
          <h1 className="mt-4 text-lg font-semibold text-gray-900">
            You&apos;re not a member of this room
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Join this semester&apos;s study room to access its conversations.
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              href="/dashboard"
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Back to dashboard
            </Link>
            <Link
              href="/onBoarding"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Join a room
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <AppHeader />

      {/* Semester header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            {roomLoading ? (
              <div className="h-5 w-48 animate-pulse rounded bg-gray-200" />
            ) : room ? (
              <>
                <h1 className="truncate text-base font-semibold text-gray-900">
                  {room.name}
                </h1>
                <p className="truncate text-xs text-gray-500">
                  {room.university.name} · {room.department.name} · Semester{" "}
                  {room.semester.number}
                </p>
              </>
            ) : (
              <h1 className="text-base font-semibold text-gray-900">Study room</h1>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mx-auto max-w-6xl px-2">
          <div className="flex gap-1 overflow-x-auto">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                  tab === key
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Channels (mobile and tablet) */}
        <div className="border-t border-gray-100 lg:hidden">
          <div className="mx-auto max-w-6xl overflow-x-auto px-3 py-2">
            {channelsLoading ? (
              <div className="px-2 text-xs text-gray-400">Loading channels...</div>
            ) : channelsError ? (
              <p className="px-2 text-xs text-red-600">{channelsError}</p>
            ) : channels.length === 0 ? (
              <p className="px-2 text-xs text-gray-500">No channels created yet.</p>
            ) : (
              <nav aria-label="Study channels" className="flex min-w-max gap-1">
                {channels.map((channel) => (
                  <button
                    key={channel.id}
                    type="button"
                    onClick={() => selectChannel(channel.id)}
                    className={`flex max-w-48 shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm ${
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
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto flex w-full max-w-6xl flex-1 overflow-hidden">
        {/* Sidebar (desktop) */}
        <aside className="hidden w-64 shrink-0 border-r border-gray-200 bg-white lg:flex lg:flex-col">
          <RoomSidebar
            channels={channels}
            channelsLoading={channelsLoading}
            channelsError={channelsError}
            activeChannelId={activeChannelId}
            onSelectChannel={selectChannel}
            memberCount={room?.memberCount ?? null}
            memberCountLoading={roomLoading}
          />
        </aside>

        {/* Main content */}
        <main className="flex min-w-0 flex-1 flex-col bg-white">
          {roomError ? (
            <div className="flex flex-1 items-center justify-center px-6">
              <div className="max-w-sm rounded-xl border border-red-200 bg-red-50 p-6 text-center">
                <p className="text-sm text-red-700">{roomError}</p>
                <Link
                  href="/dashboard"
                  className="mt-3 inline-block rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                  Back to dashboard
                </Link>
              </div>
            </div>
          ) : roomLoading ? (
            <div className="flex flex-1 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          ) : tab === "chats" && !activeChannelId ? (
            <div className="flex flex-1 items-center justify-center text-sm text-gray-500">{channelsLoading ? "Loading channels..." : "No study channels have been created yet."}</div>
          ) : tab === "chats" ? (
            <ChatPanel
              key={activeChannelId}
              messages={chat.messages}
              status={chat.status}
              joined={chat.joined}
              joinError={chat.joinError}
              historyLoading={chat.historyLoading}
              historyError={chat.historyError}
              sending={chat.sending}
              onSend={chat.sendMessage}
              onRetryMessage={chat.retryMessage}
              onEditMessage={chat.editMessage}
              onDeleteMessage={chat.deleteMessage}
              onReloadHistory={chat.reloadHistory}
              roomId={roomId}
              channelId={activeChannelId!}
              onResource={chat.addMessage}
            />
          ) : tab === "files" ? (
            activeChannelId ? <FilesPanel key={activeChannelId} roomId={roomId} channelId={activeChannelId} /> : <div className="flex flex-1 items-center justify-center text-sm text-gray-500">Select a channel to view its files.</div>
          ) : (
            activeChannelId ? <AiSummaryPanel key={activeChannelId} roomId={roomId} channelId={activeChannelId} /> : <div className="flex flex-1 items-center justify-center text-sm text-gray-500">Select a channel to summarize its activity.</div>
          )}
        </main>
      </div>
    </div>
  );
}
