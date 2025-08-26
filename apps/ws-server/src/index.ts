import { WebSocketServer } from "ws";
import dotenv from "dotenv";

dotenv.config();

const port = process.env.WS_PORT || 4002;
const wss = new WebSocketServer({ port: Number(port) });

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (msg) => {
    console.log("Received:", msg.toString());
    ws.send(`Echo: ${msg}`);
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

console.log(`WebSocket server running on ws://localhost:${port}`);
