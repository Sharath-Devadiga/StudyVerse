"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, RefreshCw, School } from "lucide-react";
import { AppHeader } from "../layout/AppHeader";
import { RoomCard } from "./RoomCard";
import { useAuthStore } from "../../store/AuthStore/useAuthStore";
import { getUserRooms } from "../../../lib/api/room";
import { getApiErrorMessage } from "../../../lib/utils";

export function DashboardContent() {
  const { user, rooms, setRooms } = useAuthStore();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(rooms.length === 0);
  const [error, setError] = useState<string | null>(null);

  async function loadRooms(showSpinner = false) {
    if (showSpinner) setLoading(true);
    setError(null);
    try {
      const data = await getUserRooms();
      setRooms(data);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load your study rooms."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRooms(rooms.length === 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rooms;
    return rooms.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.department.name.toLowerCase().includes(q) ||
        r.university.name.toLowerCase().includes(q) ||
        `semester ${r.semester.number}`.includes(q)
    );
  }, [rooms, query]);

  const firstName = user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader
        search={{
          value: query,
          onChange: setQuery,
          placeholder: "Search your study rooms...",
        }}
      />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              Welcome back, {firstName}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Jump back into your study rooms or join a new one.
            </p>
          </div>
          <Link
            href="/onBoarding"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Join a study room
          </Link>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Your study rooms
            </h2>
            <button
              type="button"
              onClick={() => loadRooms(true)}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-44 animate-pulse rounded-xl border border-gray-200 bg-white"
                />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
              <p className="text-sm text-red-700">{error}</p>
              <button
                type="button"
                onClick={() => loadRooms(true)}
                className="mt-3 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Try again
              </button>
            </div>
          ) : rooms.length === 0 ? (
            <div className="flex flex-col items-center rounded-xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <School className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-base font-semibold text-gray-900">
                No study rooms yet
              </h3>
              <p className="mt-1 max-w-sm text-sm text-gray-500">
                Join your semester&apos;s study room to start collaborating with
                classmates in real time.
              </p>
              <Link
                href="/onBoarding"
                className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Join a study room
              </Link>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
              <p className="text-sm text-gray-500">
                No rooms match &ldquo;{query}&rdquo;.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
