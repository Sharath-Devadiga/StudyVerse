import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { authMiddleware } from "./middleware/auth";
import { registerChatHandlers } from "./events/chatHandler";


export const initSocketServer = (httpServer: HttpServer): Server => {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use(authMiddleware);

  const onConnection = (socket: Socket) => {
    console.log(`User connected: ${socket.data.user.username} (${socket.id})`);

    registerChatHandlers(io, socket);

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.data.user.username} (${socket.id})`);
    });
  };

  io.on("connection", onConnection);

  console.log("Socket.IO server initialized.");
  return io;
};
