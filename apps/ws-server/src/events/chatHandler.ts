import { Server, Socket } from "socket.io";
import { prisma } from "@repo/db/prisma";

interface ChatMessagePayload {
  room: string;
  channel: string;
  message: string;
}

interface MessageEditPayload {
  messageId: string;
  content: string;
}

interface MessageDeletePayload {
  messageId: string;
}

interface MutationAck {
  (response: { ok: boolean; error?: string }): void;
}

export const registerChatHandlers = (io: Server, socket: Socket) => {
  const joinRoom = async (roomId: string) => {
    try {
      if (!roomId || typeof roomId !== "string") {
        socket.emit("error", { error: "Valid room ID is required" });
        return;
      }

      const userId = socket.data.user.id;

      const room = await prisma.room.findFirst({
        where: {
          id: roomId,
          members: { some: { id: userId } },
        },
      });

      if (!room) {
        socket.emit("error", {
          error: "Forbidden: You are not a member of this room",
        });
        return;
      }

      socket.join(roomId);
      socket.emit(
        "joined-room",
        `You have successfully joined room: ${room.name}`
      );
    } catch {
      socket.emit("error", { error: "Failed to join room" });
    }
  };

  const joinChannel = async (data: { room: string; channel: string }) => {
    try {
      if (!data?.room || !data?.channel) throw new Error("Valid room and channel IDs are required");
      const room = await prisma.room.findFirst({ where: { id: data.room, members: { some: { id: socket.data.user.id } } } });
      const channel = room && await prisma.channel.findFirst({ where: { id: data.channel, roomId: room.id } });
      if (!channel) throw new Error("Forbidden: You cannot access this channel");
      socket.join(`channel:${channel.id}`);
      socket.emit("joined-channel", { roomId: room.id, channelId: channel.id });
    } catch (error) {
      socket.emit("error", { error: error instanceof Error ? error.message : "Failed to join channel" });
    }
  };

  const handleMessage = async (data: ChatMessagePayload) => {
    try {
      const sender = socket.data.user;

      if (!data?.room || !data?.channel || !data?.message || !sender) {
        socket.emit("error", { error: "Room, channel, and message are required" });
        return;
      }

      const content = data.message.trim();
      if (content.length === 0) {
        socket.emit("error", { error: "Message content cannot be empty" });
        return;
      }

      const room = await prisma.room.findFirst({
        where: {
          id: data.room,
          members: { some: { id: sender.id } },
        },
      });

      if (!room) {
        socket.emit("error", {
          error: "Forbidden: You are not a member of this room",
        });
        return;
      }

      const channel = await prisma.channel.findFirst({ where: { id: data.channel, roomId: room.id } });
      if (!channel) {
        socket.emit("error", { error: "Channel not found" });
        return;
      }

      const persistedMessage = await prisma.message.create({
        data: {
          content,
          userId: sender.id,
          roomId: data.room,
          channelId: channel.id,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true,
            },
          },
        },
      });

      io.in(`channel:${channel.id}`).emit("room-chat", {
        id: persistedMessage.id,
        content: persistedMessage.content,
        createdAt: persistedMessage.createdAt.toISOString(),
        userId: persistedMessage.userId,
        roomId: persistedMessage.roomId,
        channelId: persistedMessage.channelId,
        user: persistedMessage.user,
      });
    } catch {
      socket.emit("error", { error: "Failed to send message" });
    }
  };

  const editMessage = async (data: MessageEditPayload, ack?: MutationAck) => {
    try {
      const sender = socket.data.user;
      const content = data?.content?.trim();
      if (!sender || !data?.messageId || !content) {
        ack?.({ ok: false, error: "Message ID and content are required" });
        return;
      }
      if (content.length > 4000) {
        ack?.({ ok: false, error: "Message is too long" });
        return;
      }

      const message = await prisma.message.findFirst({
        where: { id: data.messageId, userId: sender.id },
        include: { channel: { select: { id: true, roomId: true } } },
      });
      if (!message?.channelId || !message.channel) {
        ack?.({ ok: false, error: "Message not found" });
        return;
      }

      const member = await prisma.room.findFirst({
        where: { id: message.channel.roomId, members: { some: { id: sender.id } } },
        select: { id: true },
      });
      if (!member) {
        ack?.({ ok: false, error: "Forbidden: You are not a member of this room" });
        return;
      }

      const updated = await prisma.message.update({
        where: { id: message.id },
        data: { content, editedAt: new Date() },
      });
      io.in(`channel:${message.channelId}`).emit("message-edited", {
        id: updated.id,
        content: updated.content,
        editedAt: updated.editedAt?.toISOString() ?? null,
        roomId: updated.roomId,
        channelId: updated.channelId,
      });
      ack?.({ ok: true });
    } catch {
      ack?.({ ok: false, error: "Failed to edit message" });
    }
  };

  const deleteMessage = async (data: MessageDeletePayload, ack?: MutationAck) => {
    try {
      const sender = socket.data.user;
      if (!sender || !data?.messageId) {
        ack?.({ ok: false, error: "Message ID is required" });
        return;
      }

      const message = await prisma.message.findFirst({
        where: { id: data.messageId, userId: sender.id },
        include: { channel: { select: { id: true, roomId: true } } },
      });
      if (!message?.channelId || !message.channel) {
        ack?.({ ok: false, error: "Message not found" });
        return;
      }

      const member = await prisma.room.findFirst({
        where: { id: message.channel.roomId, members: { some: { id: sender.id } } },
        select: { id: true },
      });
      if (!member) {
        ack?.({ ok: false, error: "Forbidden: You are not a member of this room" });
        return;
      }

      await prisma.message.delete({ where: { id: message.id } });
      io.in(`channel:${message.channelId}`).emit("message-deleted", {
        id: message.id,
        roomId: message.roomId,
        channelId: message.channelId,
      });
      ack?.({ ok: true });
    } catch {
      ack?.({ ok: false, error: "Failed to delete message" });
    }
  };

  socket.on("join-room", joinRoom);
  socket.on("join-channel", joinChannel);
  socket.on("publish-resource", async (resourceId: string) => {
    try {
      if (typeof resourceId !== "string") throw new Error("Valid resource ID is required");
      const message = await prisma.message.findFirst({ where: { resourceId, userId: socket.data.user.id }, include: { user: { select: { id: true, name: true, username: true, avatar: true } }, resource: { include: { uploader: { select: { id: true, name: true } }, channel: { select: { id: true, name: true } } } } } });
      if (!message?.channelId) throw new Error("Resource message not found");
      io.in(`channel:${message.channelId}`).emit("room-chat", { ...message, createdAt: message.createdAt.toISOString() });
    } catch (error) { socket.emit("error", { error: error instanceof Error ? error.message : "Failed to publish resource" }); }
  });
  socket.on("leave-channel", (channelId: string) => { if (typeof channelId === "string") socket.leave(`channel:${channelId}`); });
  socket.on("room-chat", handleMessage);
  socket.on("edit-message", editMessage);
  socket.on("delete-message", deleteMessage);
};
