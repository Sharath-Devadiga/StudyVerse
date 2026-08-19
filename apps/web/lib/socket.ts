import { io, Socket } from "socket.io-client";
import type { ConnectionStatus, Message } from "./types";
import { getStoredToken } from "./utils";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:8080";

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  return socket;
}

export function connectSocket(
  onStatusChange: (status: ConnectionStatus) => void,
  onError: (message: string) => void
): Socket {
  if (socket?.connected) {
    return socket;
  }

  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  onStatusChange("connecting");

  const token = getStoredToken();

  socket = io(WS_URL, {
    auth: token ? { token } : undefined,
    withCredentials: true,
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => onStatusChange("connected"));
  socket.on("disconnect", () => onStatusChange("disconnected"));
  socket.on("connect_error", (err) => {
    onStatusChange("error");
    onError(err.message || "Connection failed");
  });
  socket.io.on("reconnect", () => onStatusChange("connected"));
  socket.io.on("reconnect_failed", () => onStatusChange("error"));

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
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

export function sendChatMessage(roomId: string, channelId: string, message: string): void {
  socket?.emit("room-chat", { room: roomId, channel: channelId, message });
}

export function onChatMessage(handler: (message: Message) => void): () => void {
  if (!socket) return () => {};

  const listener = (msg: Message) => handler(msg);
  socket.on("room-chat", listener);
  return () => {
    socket?.off("room-chat", listener);
  };
}

export function onSocketError(handler: (message: string) => void): () => void {
  if (!socket) return () => {};

  const listener = (payload: { error: string }) => handler(payload.error);
  socket.on("error", listener);
  return () => {
    socket?.off("error", listener);
  };
}
