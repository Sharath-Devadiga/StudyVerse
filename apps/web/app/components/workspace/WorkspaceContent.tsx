"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Lock,
  MessageSquare,
  Menu,
  FolderOpen,
  Sparkles,
  X,
} from "lucide-react";
import { AppHeader } from "../layout/AppHeader";
import { RoomSidebar } from "./RoomSidebar";
import { ChatPanel } from "./ChatPanel";
import { FilesPanel } from "./FilesPanel";
import { AiSummaryPanel } from "./AiSummaryPanel";
import { useRoomChat } from "./useRoomChat";
import { useAuthStore } from "../../store/AuthStore/useAuthStore";
import { getRoom, getRoomChannels, getRoomMembers, getUserRooms } from "../../../lib/api/room";
import { getApiErrorMessage } from "../../../lib/utils";
import type { Channel, Room, RoomMember } from "../../../lib/types";

type Tab = "chats" | "files" | "ai";

const TABS: { key: Tab; label: string; icon: typeof MessageSquare }[] = [
  { key: "chats", label: "Chats", icon: MessageSquare },
  { key: "files", label: "Files", icon: FolderOpen },
  { key: "ai", label: "AI Summary", icon: Sparkles },
];

export function WorkspaceContent({ roomId }: { roomId: string }) {
  const router = useRouter();
  const { rooms, setRooms, setActiveRoomId } = useAuthStore();

  const [room, setRoom] = useState<Room | null>(null);
  const [roomLoading, setRoomLoading] = useState(true);
  const [roomError, setRoomError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);

  const [members, setMembers] = useState<RoomMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [channelsLoading, setChannelsLoading] = useState(true);
  const [channelsError, setChannelsError] = useState<string | null>(null);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);

  const [tab, setTab] = useState<Tab>("chats");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const chat = useRoomChat(forbidden ? null : roomId, activeChannelId);

  useEffect(() => {
    setActiveRoomId(roomId);
  }, [roomId, setActiveRoomId]);

  // Ensure the sidebar room list is populated.
  useEffect(() => {
    if (rooms.length === 0) {
      getUserRooms()
        .then(setRooms)
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load the room details.
  useEffect(() => {
    let cancelled = false;
    setRoomLoading(true);
    setRoomError(null);
    setForbidden(false);
    getRoom(roomId)
      .then((data) => {
        if (!cancelled) setRoom(data);
      })
      .catch((err) => {
        if (cancelled) return;
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 403) {
          setForbidden(true);
        } else {
          setRoomError(getApiErrorMessage(err, "Failed to load this study room."));
        }
      })
      .finally(() => {
        if (!cancelled) setRoomLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [roomId]);

  // Load room members.
  useEffect(() => {
    if (forbidden) return;
    let cancelled = false;
    setMembersLoading(true);
    setMembersError(null);
    getRoomMembers(roomId)
      .then((data) => {
        if (!cancelled) setMembers(data);
      })
      .catch((err) => {
        if (!cancelled)
          setMembersError(getApiErrorMessage(err, "Failed to load members."));
      })
      .finally(() => {
        if (!cancelled) setMembersLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [roomId, forbidden]);

  useEffect(() => {
    let cancelled = false;
    setChannelsLoading(true);
    setChannelsError(null);
    setActiveChannelId(null);
    getRoomChannels(roomId)
      .then((data) => {
        if (!cancelled) { setChannels(data); setActiveChannelId(data[0]?.id ?? null); }
      })
      .catch((err) => !cancelled && setChannelsError(getApiErrorMessage(err, "Failed to load channels.")))
      .finally(() => !cancelled && setChannelsLoading(false));
    return () => { cancelled = true; };
  }, [roomId]);

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
            onClick={() => setSidebarOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 lg:hidden"
            aria-label="Open rooms sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
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
          <div className="flex gap-1">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
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
      </div>

      {/* Body */}
      <div className="mx-auto flex w-full max-w-6xl flex-1 overflow-hidden">
        {/* Sidebar (desktop) */}
        <aside className="hidden w-64 shrink-0 border-r border-gray-200 bg-white lg:flex lg:flex-col">
          <RoomSidebar
            rooms={rooms}
            activeRoomId={roomId}
            members={members}
            membersLoading={membersLoading}
            membersError={membersError}
          />
        </aside>

        {/* Sidebar (mobile drawer) */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="absolute inset-0 bg-gray-900/40"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="absolute left-0 top-0 flex h-full w-72 flex-col bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <span className="text-sm font-semibold text-gray-900">Rooms</span>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="text-gray-400 hover:text-gray-700"
                  aria-label="Close sidebar"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <RoomSidebar
                rooms={rooms}
                activeRoomId={roomId}
                members={members}
                membersLoading={membersLoading}
                membersError={membersError}
              />
            </div>
          </div>
        )}

        {/* Channel navigation */}
        <aside className="hidden w-48 shrink-0 border-r border-gray-200 bg-slate-50 xl:block">
          <div className="px-3 py-4">
            <h2 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Channels</h2>
            {channelsLoading ? <Loader2 className="m-2 h-4 w-4 animate-spin text-blue-600" /> : channelsError ? <p className="px-2 text-xs text-red-600">{channelsError}</p> : channels.length === 0 ? <p className="px-2 text-xs text-gray-500">No channels created yet.</p> : <nav className="space-y-1">{channels.map((channel) => <button key={channel.id} type="button" onClick={() => setActiveChannelId(channel.id)} className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm ${channel.id === activeChannelId ? "bg-blue-50 font-medium text-blue-700" : "text-gray-600 hover:bg-gray-100"}`}><span className="text-gray-400">#</span>{channel.name}</button>)}</nav>}
          </div>
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
              messages={chat.messages}
              status={chat.status}
              joined={chat.joined}
              joinError={chat.joinError}
              historyLoading={chat.historyLoading}
              historyError={chat.historyError}
              sending={chat.sending}
              onSend={chat.sendMessage}
              onReloadHistory={chat.reloadHistory}
              roomId={roomId}
              channelId={activeChannelId!}
            />
          ) : tab === "files" ? (
            <FilesPanel roomId={roomId} />
          ) : (
            <AiSummaryPanel roomId={roomId} />
          )}
        </main>
      </div>
    </div>
  );
}
