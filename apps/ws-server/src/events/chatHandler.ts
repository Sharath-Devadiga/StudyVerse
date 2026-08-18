import { Server, Socket } from "socket.io";
import { prisma } from "@repo/db/prisma";

interface ChatMessagePayload {
  room: string;
  message: string;
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

  const handleMessage = async (data: ChatMessagePayload) => {
    try {
      const sender = socket.data.user;

      if (!data?.room || !data?.message || !sender) {
        socket.emit("error", { error: "Room and message are required" });
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

      const persistedMessage = await prisma.message.create({
        data: {
          content,
          userId: sender.id,
          roomId: data.room,
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

      io.in(data.room).emit("room-chat", {
        id: persistedMessage.id,
        content: persistedMessage.content,
        createdAt: persistedMessage.createdAt.toISOString(),
        userId: persistedMessage.userId,
        roomId: persistedMessage.roomId,
        user: persistedMessage.user,
      });
    } catch {
      socket.emit("error", { error: "Failed to send message" });
    }
  };

  socket.on("join-room", joinRoom);
  socket.on("room-chat", handleMessage);
};
