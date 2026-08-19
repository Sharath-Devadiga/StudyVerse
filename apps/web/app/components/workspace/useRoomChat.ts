"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  connectSocket,
  joinSocketRoom,
  joinSocketChannel,
  leaveSocketChannel,
  onChatMessage,
  onSocketError,
  sendChatMessage,
} from "../../../lib/socket";
import { getChannelMessages } from "../../../lib/api/room";
import { useAuthStore } from "../../store/AuthStore/useAuthStore";
import { getApiErrorMessage } from "../../../lib/utils";
import type { ConnectionStatus, Message } from "../../../lib/types";

const channelHistoryCache = new Map<string, Message[]>();

export type ChatDisplayMessage = Message & {
  optimisticState?: "sending" | "failed";
};

interface UseRoomChat {
  messages: ChatDisplayMessage[];
  status: ConnectionStatus;
  joined: boolean;
  joinError: string | null;
  historyLoading: boolean;
  historyError: string | null;
  sending: boolean;
  sendMessage: (text: string) => void;
  retryMessage: (messageId: string) => void;
  addMessage: (message: Message) => void;
  reloadHistory: () => void;
}

export function useRoomChat(roomId: string | null, channelId: string | null): UseRoomChat {
  const { user, setConnectionStatus } = useAuthStore();
  const scopeKey = roomId && channelId ? `${roomId}:${channelId}` : null;
  const [messages, setMessages] = useState<ChatDisplayMessage[]>([]);
  const [messagesScopeKey, setMessagesScopeKey] = useState<string | null>(scopeKey);
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [joined, setJoined] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const roomIdRef = useRef(roomId);
  roomIdRef.current = roomId;
  const historyRequestRef = useRef(0);
  const pendingByTempIdRef = useRef<Map<string, { content: string; timeoutId: ReturnType<typeof setTimeout> }>>(new Map());

  const loadHistory = useCallback(async (force = false) => {
    if (!roomId || !channelId) return;
    const cacheKey = `${roomId}:${channelId}`;

    if (!force) {
      const cached = channelHistoryCache.get(cacheKey);
      if (cached) {
        setMessages(cached);
        setMessagesScopeKey(scopeKey);
        setHistoryLoading(false);
        setHistoryError(null);
        return;
      }
    }

    const requestId = historyRequestRef.current + 1;
    historyRequestRef.current = requestId;
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const data = await getChannelMessages(roomId, channelId);
      if (historyRequestRef.current === requestId) {
        channelHistoryCache.set(cacheKey, data);
        setMessages(data);
        setMessagesScopeKey(scopeKey);
      }
    } catch (err) {
      if (historyRequestRef.current === requestId) {
        setHistoryError(getApiErrorMessage(err, "Failed to load message history."));
      }
    } finally {
      if (historyRequestRef.current === requestId) {
        setHistoryLoading(false);
      }
    }
  }, [roomId, channelId, scopeKey]);

  // Load persisted history over HTTP whenever the room changes.
  useEffect(() => {
    pendingByTempIdRef.current.forEach((pending) => clearTimeout(pending.timeoutId));
    pendingByTempIdRef.current.clear();

    setMessages([]);
    setMessagesScopeKey(scopeKey);
    setHistoryLoading(true);
    setJoined(false);
    setJoinError(null);
    loadHistory();
  }, [loadHistory, scopeKey]);

  // Manage the Socket.IO connection and room membership.
  useEffect(() => {
    if (!roomId || !channelId) return;

    const updateStatus = (s: ConnectionStatus) => {
      setStatus(s);
      setConnectionStatus(s);
    };

    const socket = connectSocket(updateStatus, (message) => {
      setJoinError(message);
    });

    const attemptJoin = () => {
      setJoinError(null);
      joinSocketRoom(roomId, () => {
        joinSocketChannel(roomId, channelId, () => {
          if (roomIdRef.current === roomId) setJoined(true);
        }, (message) => {
          if (roomIdRef.current === roomId) {
            setJoined(false);
            setJoinError(message);
          }
        });
      }, (message) => {
        if (roomIdRef.current === roomId) { setJoined(false); setJoinError(message); }
      });
    };

    if (socket.connected) {
      updateStatus("connected");
      attemptJoin();
    }

    socket.on("connect", attemptJoin);
    socket.io.on("reconnect", attemptJoin);

    // Only accept messages addressed to the room currently in view.
    const offMessage = onChatMessage((msg) => {
      if (msg.roomId !== roomIdRef.current || msg.channelId !== channelId) return;
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;

        if (user && msg.userId === user.id) {
          const optimisticIndex = prev.findIndex(
            (item) => item.optimisticState === "sending" && item.content === msg.content
          );
          if (optimisticIndex !== -1) {
            const optimistic = prev[optimisticIndex]!;
            const pending = pendingByTempIdRef.current.get(optimistic.id);
            if (pending) {
              clearTimeout(pending.timeoutId);
              pendingByTempIdRef.current.delete(optimistic.id);
            }
            const next = [...prev];
            next[optimisticIndex] = msg;
            channelHistoryCache.set(scopeKey ?? "", next.filter((item) => !item.optimisticState));
            return next;
          }
        }

        const appended = [...prev, msg];
        channelHistoryCache.set(scopeKey ?? "", appended.filter((item) => !item.optimisticState));
        return appended;
      });
      setMessagesScopeKey(scopeKey);
      if (user && msg.userId === user.id) setSending(false);
    });

    const offError = onSocketError(() => {
      setMessages((previous) => {
        const failedIndex = previous.findIndex((item) => item.optimisticState === "sending");
        if (failedIndex === -1) return previous;

        const failed = previous[failedIndex]!;
        const pending = pendingByTempIdRef.current.get(failed.id);
        if (pending) {
          clearTimeout(pending.timeoutId);
          pendingByTempIdRef.current.delete(failed.id);
        }

        const next = [...previous];
        next[failedIndex] = { ...failed, optimisticState: "failed" };
        return next;
      });
      setSending(false);
    });

    return () => {
      pendingByTempIdRef.current.forEach((pending) => clearTimeout(pending.timeoutId));
      pendingByTempIdRef.current.clear();
      leaveSocketChannel(channelId);
      offMessage();
      offError();
      socket.off("connect", attemptJoin);
      socket.io.off("reconnect", attemptJoin);
    };
  }, [roomId, channelId, scopeKey, setConnectionStatus, user]);

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!roomId || !channelId || trimmed.length === 0 || !user) return;

      const tempId = `temp-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const nowIso = new Date().toISOString();
      const optimistic: ChatDisplayMessage = {
        id: tempId,
        content: trimmed,
        createdAt: nowIso,
        userId: user.id,
        roomId,
        channelId,
        user: {
          id: user.id,
          name: user.name,
          username: user.username ?? null,
          avatar: user.avatar ?? null,
        },
        optimisticState: "sending",
      };

      setMessages((previous) => [...previous, optimistic]);
      setMessagesScopeKey(scopeKey);
      setSending(true);

      sendChatMessage(roomId, channelId, trimmed);

      const timeoutId = setTimeout(() => {
        setMessages((previous) =>
          previous.map((message) =>
            message.id === tempId && message.optimisticState === "sending"
              ? { ...message, optimisticState: "failed" }
              : message
          )
        );
        pendingByTempIdRef.current.delete(tempId);
        setSending(false);
      }, 8000);

      pendingByTempIdRef.current.set(tempId, { content: trimmed, timeoutId });
    },
    [roomId, channelId, scopeKey, user]
  );

  const retryMessage = useCallback((messageId: string) => {
    let textToRetry: string | null = null;
    setMessages((previous) =>
      previous.map((message) => {
        if (message.id !== messageId || message.optimisticState !== "failed") return message;
        textToRetry = message.content;
        return { ...message, optimisticState: "sending" };
      })
    );

    if (!textToRetry || !roomId || !channelId) return;

    setSending(true);
    sendChatMessage(roomId, channelId, textToRetry);

    const timeoutId = setTimeout(() => {
      setMessages((previous) =>
        previous.map((message) =>
          message.id === messageId && message.optimisticState === "sending"
            ? { ...message, optimisticState: "failed" }
            : message
        )
      );
      pendingByTempIdRef.current.delete(messageId);
      setSending(false);
    }, 8000);

    pendingByTempIdRef.current.set(messageId, { content: textToRetry, timeoutId });
  }, [channelId, roomId]);

  const addMessage = useCallback((message: Message) => {
    const cacheKey = message.channelId ? `${message.roomId}:${message.channelId}` : null;
    setMessages((previous) => {
      if (previous.some((item) => item.id === message.id)) return previous;
      const next = [...previous, message];
      if (cacheKey) {
        channelHistoryCache.set(cacheKey, next.filter((item) => !item.optimisticState));
      }
      return next;
    });
    setMessagesScopeKey(scopeKey);
  }, [scopeKey]);

  return {
    messages: messagesScopeKey === scopeKey ? messages : [],
    status,
    joined,
    joinError,
    historyLoading,
    historyError,
    sending,
    sendMessage,
    retryMessage,
    addMessage,
    reloadHistory: () => void loadHistory(true),
  };
}
