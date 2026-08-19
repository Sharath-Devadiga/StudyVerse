"use client";

import { useEffect, useState } from "react";
import { FolderOpen, Loader2 } from "lucide-react";
import { getRoomResources } from "../../../lib/api/room";
import { getApiErrorMessage } from "../../../lib/utils";
import type { Resource } from "../../../lib/types";

const roomResourcesCache = new Map<string, Resource[]>();

export function FilesPanel({ roomId, channelId }: { roomId: string; channelId: string }) {
  const [resources, setResources] = useState<Resource[]>(() => roomResourcesCache.get(roomId) ?? []);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(() => !roomResourcesCache.has(roomId));
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    const cached = roomResourcesCache.get(roomId);
    setResources(cached ?? []);
    setLoading(!cached);
    setError(null);

    if (cached) return () => {
      cancelled = true;
    };

    getRoomResources(roomId)
      .then((data) => {
        if (cancelled) return;
        roomResourcesCache.set(roomId, data);
        setResources(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(getApiErrorMessage(err, "Failed to load study materials."));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [roomId]);

  const channelResources = resources.filter((resource) => resource.channel?.id === channelId);

  if (loading) return <div className="flex h-full items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div>;
  if (error) return <div className="flex h-full items-center justify-center px-6 text-center text-sm text-red-700">{error}</div>;
  if (channelResources.length) { const filtered = channelResources.filter((resource) => resource.name.toLowerCase().includes(query.trim().toLowerCase())); return <div className="h-full overflow-y-auto p-5"><h2 className="mb-4 text-base font-semibold text-gray-900">Study materials</h2><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search files..." className="mb-4 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />{filtered.length ? <ul className="space-y-2">{filtered.map((resource) => <li key={resource.id}><a className="block rounded-lg border border-gray-200 bg-white p-3 hover:border-blue-300" href={resource.url} target="_blank" rel="noreferrer"><p className="text-sm font-medium text-gray-900">{resource.name}</p><p className="mt-1 text-xs text-gray-500">{resource.mimeType ?? "File"} · Shared by {resource.uploader.name}</p></a></li>)}</ul> : <p className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">No files match &ldquo;{query}&rdquo;.</p>}</div>; }
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
        <FolderOpen className="h-7 w-7" />
      </span>
      <h3 className="mt-4 text-base font-semibold text-gray-900">
        No study materials yet
      </h3>
      <p className="mt-1 max-w-sm text-sm text-gray-500">
        No resources have been shared in this channel yet.
      </p>
    </div>
  );
}
