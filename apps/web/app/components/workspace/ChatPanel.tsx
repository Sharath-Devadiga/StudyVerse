"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, FileText, Loader2, Paperclip, SendHorizonal, WifiOff, X } from "lucide-react";
import { Avatar } from "../layout/Avatar";
import { useAuthStore } from "../../store/AuthStore/useAuthStore";
import { formatMessageDate, formatMessageTime } from "../../../lib/utils";
import type { ConnectionStatus, Message } from "../../../lib/types";
import { uploadResource } from "../../../lib/api/room";
import { getApiErrorMessage } from "../../../lib/utils";
import { publishResource } from "../../../lib/socket";
import type { ChatDisplayMessage } from "./useRoomChat";

interface ChatPanelProps {
  messages: ChatDisplayMessage[];
  status: ConnectionStatus;
  joined: boolean;
  joinError: string | null;
  historyLoading: boolean;
  historyError: string | null;
  sending: boolean;
  onSend: (text: string) => void;
  onRetryMessage: (messageId: string) => void;
  onReloadHistory: () => void;
  roomId: string;
  channelId: string;
  onResource: (message: Message) => void;
}

function ConnectionBanner({
  status,
  joinError,
}: {
  status: ConnectionStatus;
  joinError: string | null;
}) {
  if (joinError) {
    return (
      <div className="flex items-center gap-2 border-b border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
        <AlertCircle className="h-4 w-4 shrink-0" />
        <span>{joinError}</span>
      </div>
    );
  }
  if (status === "connected") return null;

  const config: Record<
    Exclude<ConnectionStatus, "connected">,
    { text: string; className: string; icon: typeof WifiOff }
  > = {
    connecting: {
      text: "Connecting to live chat...",
      className: "border-amber-200 bg-amber-50 text-amber-700",
      icon: Loader2,
    },
    disconnected: {
      text: "Disconnected. Trying to reconnect...",
      className: "border-gray-200 bg-gray-50 text-gray-600",
      icon: WifiOff,
    },
    error: {
      text: "Connection error. Attempting to reconnect...",
      className: "border-red-200 bg-red-50 text-red-700",
      icon: WifiOff,
    },
  };

  const c = config[status];
  const Icon = c.icon;
  return (
    <div
      className={`flex items-center gap-2 border-b px-4 py-2 text-sm ${c.className}`}
    >
      <Icon className={`h-4 w-4 shrink-0 ${status === "connecting" ? "animate-spin" : ""}`} />
      <span>{c.text}</span>
    </div>
  );
}

export function ChatPanel({
  messages,
  status,
  joined,
  joinError,
  historyLoading,
  historyError,
  sending,
  onSend,
  onRetryMessage,
  onReloadHistory,
  roomId,
  channelId,
  onResource,
}: ChatPanelProps) {
  const { user } = useAuthStore();
  const [draft, setDraft] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFilePreviewUrl, setSelectedFilePreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, historyLoading]);

  const selectedFileSize = useMemo(() => {
    if (!selectedFile) return null;
    const mb = selectedFile.size / 1024 / 1024;
    return `${mb >= 1 ? mb.toFixed(1) : mb.toFixed(2)} MB`;
  }, [selectedFile]);

  useEffect(() => {
    return () => {
      if (selectedFilePreviewUrl) URL.revokeObjectURL(selectedFilePreviewUrl);
    };
  }, [selectedFilePreviewUrl]);

  useEffect(() => {
    setDraft("");
    setUploadError(null);
    setUploading(false);
    if (selectedFilePreviewUrl) URL.revokeObjectURL(selectedFilePreviewUrl);
    setSelectedFile(null);
    setSelectedFilePreviewUrl(null);
  }, [channelId]);

  function setComposerFile(file: File | null) {
    setUploadError(null);
    if (selectedFilePreviewUrl) {
      URL.revokeObjectURL(selectedFilePreviewUrl);
      setSelectedFilePreviewUrl(null);
    }
    setSelectedFile(file);
    if (file && file.type.startsWith("image/")) {
      setSelectedFilePreviewUrl(URL.createObjectURL(file));
    }
  }

  function submit() {
    const text = draft.trim();
    if (!joined || uploading || sending) return;
    if (!text && !selectedFile) return;

    if (selectedFile) {
      void uploadSelectedAttachment(text);
      return;
    }

    onSend(text);
    setDraft("");
  }

  const canSend = joined && status === "connected" && !sending && !uploading;
  async function uploadSelectedAttachment(textToSendAfterUpload: string) {
    if (!selectedFile) return;
    setUploading(true);
    setUploadError(null);
    try {
      const uploaded = await uploadResource(roomId, channelId, selectedFile);
      onResource(uploaded.message);
      publishResource(uploaded.resource.id);

      if (textToSendAfterUpload) {
        onSend(textToSendAfterUpload);
      }

      setDraft("");
      setComposerFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (e) {
      setUploadError(getApiErrorMessage(e, "Upload failed. You can retry sending this file."));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <ConnectionBanner status={status} joinError={joinError} />

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        {historyLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        ) : historyError ? (
          <div className="mx-auto mt-8 max-w-sm rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-sm text-red-700">{historyError}</p>
            <button
              type="button"
              onClick={onReloadHistory}
              className="mt-3 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="text-sm font-medium text-gray-700">No messages yet</p>
            <p className="mt-1 text-sm text-gray-400">
              Be the first to say something to your study group.
            </p>
          </div>
        ) : (
          <ul className="mx-auto flex max-w-3xl flex-col gap-1">
            {messages.map((message, index) => {
              const prev = messages[index - 1];
              const isMine = message.userId === user?.id;
              const showDate =
                !prev ||
                formatMessageDate(prev.createdAt) !==
                  formatMessageDate(message.createdAt);
              const grouped =
                prev &&
                prev.userId === message.userId &&
                !showDate &&
                new Date(message.createdAt).getTime() -
                  new Date(prev.createdAt).getTime() <
                  5 * 60 * 1000;

              return (
                <li key={message.id}>
                  {showDate && (
                    <div className="my-3 flex items-center justify-center">
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
                        {formatMessageDate(message.createdAt)}
                      </span>
                    </div>
                  )}
                  <div
                    className={`flex items-start gap-3 ${grouped ? "mt-0.5" : "mt-3"}`}
                  >
                    <div className="w-9 shrink-0">
                      {!grouped && (
                        <Avatar
                          name={message.user.name}
                          src={message.user.avatar}
                          size={36}
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      {!grouped && (
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-semibold text-gray-900">
                            {isMine ? "You" : message.user.name}
                          </span>
                          {message.user.username && (
                            <span className="text-xs text-gray-400">
                              @{message.user.username}
                            </span>
                          )}
                          <span className="text-xs text-gray-400">
                            {formatMessageTime(message.createdAt)}
                          </span>
                          {message.optimisticState === "sending" && (
                            <span className="text-xs text-blue-500">Sending...</span>
                          )}
                          {message.optimisticState === "failed" && (
                            <button
                              type="button"
                              onClick={() => onRetryMessage(message.id)}
                              className="text-xs font-medium text-red-600 hover:text-red-700"
                            >
                              Retry
                            </button>
                          )}
                        </div>
                      )}
                      {message.content && <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-700">{message.content}</p>}
                      {message.resource && <AttachmentCard resource={message.resource} />}
                    </div>
                  </div>
                </li>
              );
            })}
            <div ref={endRef} />
          </ul>
        )}
      </div>

      {/* Composer */}
      <div className="border-t border-gray-200 bg-white px-4 py-3">
        {uploadError && <p className="mx-auto mb-2 max-w-3xl text-xs text-red-600">{uploadError}</p>}
        {selectedFile && (
          <div className="mx-auto mb-3 max-w-3xl rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                {selectedFilePreviewUrl ? (
                  <img
                    src={selectedFilePreviewUrl}
                    alt={selectedFile.name}
                    className="mb-2 max-h-32 rounded-md border border-slate-200 object-cover"
                  />
                ) : (
                  <div className="mb-2 flex items-center gap-2 text-sm text-slate-700">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="truncate">{selectedFile.name}</span>
                  </div>
                )}
                <p className="truncate text-sm font-medium text-slate-800">{selectedFile.name}</p>
                <p className="text-xs text-slate-500">
                  {selectedFile.type || "File"}
                  {selectedFileSize ? ` · ${selectedFileSize}` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setComposerFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="rounded-md p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
                aria-label="Remove selected attachment"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
        <div className="mx-auto flex max-w-3xl items-end gap-2">
          <label className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">
            <input
              ref={fileInputRef}
              className="sr-only"
              type="file"
              accept=".pdf,.txt,.docx,image/jpeg,image/png,image/webp"
              disabled={!joined || uploading || sending}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setComposerFile(file);
              }}
            />
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
          </label>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.shiftKey &&
                !e.nativeEvent.isComposing &&
                e.keyCode !== 229
              ) {
                e.preventDefault();
                submit();
              }
            }}
            rows={1}
            placeholder={selectedFile ? "Add an optional caption..." : joined ? "Write a message..." : "Joining room..."}
            disabled={!joined || uploading}
            className="max-h-32 min-h-[2.5rem] flex-1 resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          />
          <button
            type="button"
            onClick={submit}
            disabled={!canSend || (draft.trim().length === 0 && !selectedFile)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Send message"
          >
            {sending || uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SendHorizonal className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function AttachmentCard({ resource }: { resource: NonNullable<Message["resource"]> }) {
  const image = resource.mimeType?.startsWith("image/"); const size = resource.sizeBytes ? `${(resource.sizeBytes / 1024 / 1024).toFixed(resource.sizeBytes > 1024 * 1024 ? 1 : 2)} MB` : resource.mimeType?.split("/").pop()?.toUpperCase() ?? "FILE";
  if (image) return <a href={resource.url} target="_blank" rel="noreferrer" className="mt-2 block max-w-sm overflow-hidden rounded-lg border border-slate-200 bg-white"><img src={resource.url} alt={resource.name} className="max-h-64 w-full object-cover" /><div className="flex items-center justify-between p-3 text-xs text-slate-600"><span className="truncate font-medium text-slate-800">{resource.name}</span><span>{size}</span></div></a>;
  return <a href={resource.url} target="_blank" rel="noreferrer" className="mt-2 flex max-w-sm items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 hover:border-blue-300"><FileText className="h-8 w-8 shrink-0 text-blue-600" /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-slate-900">{resource.name}</span><span className="block text-xs text-slate-500">{size} · Open or download</span></span></a>;
}
