import { io, Socket } from "socket.io-client";
import type { ConnectionStatus, Message } from "./types";
import { apiClient } from "./api/client";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:8080";

let socket: Socket | null = null;
let statusSubscriber: ((status: ConnectionStatus) => void) | null = null;
let errorSubscriber: ((message: string) => void) | null = null;

export function getSocket(): Socket | null {
  return socket;
}

export function connectSocket(
  onStatusChange: (status: ConnectionStatus) => void,
  onError: (message: string) => void,
  socketToken: string
): Socket {
  statusSubscriber = onStatusChange;
  errorSubscriber = onError;

  if (socket) {
    if (socket.connected) {
      onStatusChange("connected");
    } else {
      onStatusChange("connecting");
    }
    return socket;
  }

  onStatusChange("connecting");

  socket = io(WS_URL, {
    auth: { token: socketToken },
    withCredentials: true,
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => statusSubscriber?.("connected"));
  socket.on("disconnect", () => statusSubscriber?.("disconnected"));
  socket.on("connect_error", (err) => {
    statusSubscriber?.("error");
    errorSubscriber?.(err.message || "Connection failed");
    if (/authentication|invalid token|token/i.test(err.message)) {
      void getSocketToken()
        .then((nextToken) => {
          if (!socket) return;
          socket.auth = { token: nextToken };
          socket.connect();
        })
        .catch(() => {
          errorSubscriber?.("Unable to refresh live chat authentication");
        });
    }
  });
  socket.io.on("reconnect", () => statusSubscriber?.("connected"));
  socket.io.on("reconnect_failed", () => statusSubscriber?.("error"));

  return socket;
}

export async function getSocketToken(): Promise<string> {
  const { data } = await apiClient.get<{ token: string }>("/auth/socket-token");
  return data.token;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
  statusSubscriber = null;
  errorSubscriber = null;
}

export function joinSocketRoom(
  roomId: string,
  onJoined: (message: string) => void,
  onError: (message: string) => void
): void {
  if (!socket) return;

  const handleJoined = (msg: string) => {
    socket?.off("error", handleError);
    onJoined(msg);
  };

  const handleError = (payload: { error: string }) => {
    socket?.off("joined-room", handleJoined);
    onError(payload.error);
  };

  socket.once("joined-room", handleJoined);
  socket.once("error", handleError);
  socket.emit("join-room", roomId);
}

export function joinSocketChannel(roomId: string, channelId: string, onJoined: () => void, onError: (message: string) => void): void {
  if (!socket) return;
  const joined = (payload: { roomId: string; channelId: string }) => { if (payload.channelId === channelId) { socket?.off("error", failed); onJoined(); } };
  const failed = (payload: { error: string }) => { socket?.off("joined-channel", joined); onError(payload.error); };
  socket.once("joined-channel", joined);
  socket.once("error", failed);
  socket.emit("join-channel", { room: roomId, channel: channelId });
}

export function leaveSocketChannel(channelId: string): void { socket?.emit("leave-channel", channelId); }
export function publishResource(resourceId: string): void { socket?.emit("publish-resource", resourceId); }

export function sendChatMessage(roomId: string, channelId: string, message: string): void {
  socket?.emit("room-chat", { room: roomId, channel: channelId, message });
}

export function editChatMessage(messageId: string, content: string, onResult?: (ok: boolean, error?: string) => void): void {
  socket?.emit("edit-message", { messageId, content }, (response: { ok: boolean; error?: string }) => {
    onResult?.(response.ok, response.error);
  });
}

export function deleteChatMessage(messageId: string, onResult?: (ok: boolean, error?: string) => void): void {
  socket?.emit("delete-message", { messageId }, (response: { ok: boolean; error?: string }) => {
    onResult?.(response.ok, response.error);
  });
}

export function onChatMessage(handler: (message: Message) => void): () => void {
  if (!socket) return () => {};

  const listener = (msg: Message) => handler(msg);
  socket.on("room-chat", listener);
  return () => {
    socket?.off("room-chat", listener);
  };
}

export interface MessageEditedEvent {
  id: string;
  content: string;
  editedAt: string | null;
  roomId: string;
  channelId: string;
}

export interface MessageDeletedEvent {
  id: string;
  roomId: string;
  channelId: string;
}

export function onMessageEdited(handler: (message: MessageEditedEvent) => void): () => void {
  if (!socket) return () => {};
  socket.on("message-edited", handler);
  return () => socket?.off("message-edited", handler);
}

export function onMessageDeleted(handler: (message: MessageDeletedEvent) => void): () => void {
  if (!socket) return () => {};
  socket.on("message-deleted", handler);
  return () => socket?.off("message-deleted", handler);
}

export function onSocketError(handler: (message: string) => void): () => void {
  if (!socket) return () => {};

  const listener = (payload: { error: string }) => handler(payload.error);
  socket.on("error", listener);
  return () => {
    socket?.off("error", listener);
  };
}
