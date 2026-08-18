"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  connectSocket,
  joinSocketRoom,
  onChatMessage,
  onSocketError,
  sendChatMessage,
} from "../../../lib/socket";
import { getRoomMessages } from "../../../lib/api/room";
import { useAuthStore } from "../../store/AuthStore/useAuthStore";
import { getApiErrorMessage } from "../../../lib/utils";
import type { ConnectionStatus, Message } from "../../../lib/types";

interface UseRoomChat {
  messages: Message[];
  status: ConnectionStatus;
  joined: boolean;
  joinError: string | null;
  historyLoading: boolean;
  historyError: string | null;
  sending: boolean;
  sendMessage: (text: string) => void;
  reloadHistory: () => void;
}

export function useRoomChat(roomId: string | null): UseRoomChat {
  const { user, setConnectionStatus } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [joined, setJoined] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const roomIdRef = useRef(roomId);
  roomIdRef.current = roomId;

  const loadHistory = useCallback(async () => {
    if (!roomId) return;
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const data = await getRoomMessages(roomId);
      setMessages(data);
    } catch (err) {
      setHistoryError(getApiErrorMessage(err, "Failed to load message history."));
    } finally {
      setHistoryLoading(false);
    }
  }, [roomId]);

  // Load persisted history over HTTP whenever the room changes.
  useEffect(() => {
    setMessages([]);
    setJoined(false);
    setJoinError(null);
    loadHistory();
  }, [loadHistory]);

  // Manage the Socket.IO connection and room membership.
  useEffect(() => {
    if (!roomId) return;

    const updateStatus = (s: ConnectionStatus) => {
      setStatus(s);
      setConnectionStatus(s);
    };

    const socket = connectSocket(updateStatus, (message) => {
      setJoinError(message);
    });

    const attemptJoin = () => {
      setJoinError(null);
      joinSocketRoom(
        roomId,
        () => {
          if (roomIdRef.current === roomId) setJoined(true);
        },
        (message) => {
          if (roomIdRef.current === roomId) {
            setJoined(false);
            setJoinError(message);
          }
        }
      );
    };

    if (socket.connected) {
      updateStatus("connected");
      attemptJoin();
    }

    socket.on("connect", attemptJoin);
    socket.io.on("reconnect", attemptJoin);

    // Only accept messages addressed to the room currently in view.
    const offMessage = onChatMessage((msg) => {
      if (msg.roomId !== roomIdRef.current) return;
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      if (user && msg.userId === user.id) setSending(false);
    });

    const offError = onSocketError(() => {
      setSending(false);
    });

    return () => {
      offMessage();
      offError();
      socket.off("connect", attemptJoin);
      socket.io.off("reconnect", attemptJoin);
    };
  }, [roomId, setConnectionStatus, user]);

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!roomId || trimmed.length === 0) return;
      setSending(true);
      sendChatMessage(roomId, trimmed);
      // Safety net so the composer never stays locked if no echo arrives.
      setTimeout(() => setSending(false), 5000);
    },
    [roomId]
  );

  return {
    messages,
    status,
    joined,
    joinError,
    historyLoading,
    historyError,
    sending,
    sendMessage,
    reloadHistory: loadHistory,
  };
}
