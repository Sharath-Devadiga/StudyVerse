import dotenv from 'dotenv';
dotenv.config();

import { Server, Socket } from "socket.io";
import { prisma } from "@repo/db/prisma";
import jwt from 'jsonwebtoken';
import * as cookie from 'cookie'; 

interface AuthenticatedSocket extends Socket {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export function initializeWebSocket(io: Server) {

  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const cookies = socket.handshake.headers.cookie;
      if (!cookies) {
        return next(new Error("Authentication error: No cookies found."));
      }

      const parsedCookies = cookie.parse(cookies);
      const token = parsedCookies.token;

      if (!token) {
        return next(new Error("Authentication error: Token not found."));
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true, name: true }
      });

      if (!user) {
        return next(new Error("Authentication error: User not found."));
      }
      
      socket.user = user;
      next();

    } catch (error) {
      console.error("Socket authentication failed:", error);
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket: AuthenticatedSocket) => {
    console.log(`A user connected: ${socket.user?.name} (${socket.id})`);

    const user = socket.user;

    socket.on("join-room", (roomId: string) => {
      if (!user) return; // Guard clause
      socket.join(roomId);
      console.log(`User ${user.name} with socket ${socket.id} joined room ${roomId}`);
    });

    socket.on("send-message", async (data) => {
      if (!user) return; 

      const { roomId, content } = data;

      if (!roomId || !content) {
        return socket.emit("message-error", { message: "RoomId and content are required." });
      }

      try {
        const newMessage = await prisma.message.create({
          data: {
            content: content,
            roomId: roomId,
            userId: user.id, 
          },
          include: {
            user: { 
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        });

        socket.to(roomId).emit("new-message", newMessage);

      } catch (error) {
        console.error("Failed to send message:", error);
        socket.emit("message-error", { message: "Could not send message." });
      }
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.user?.name} (${socket.id})`);
    });
  });
}

