
import http from 'http';
import express from 'express';
import { Server } from 'socket.io';
import { initializeWebSocket } from './ws-server'; 

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://127.0.0.1:5500", "http://localhost:5500"], 
    methods: ["GET", "POST"],
    credentials: true 
  }
});


initializeWebSocket(io);

const PORT = process.env.PORT || 8001; 
server.listen(PORT, () => {
  console.log(`WebSocket server is running on http://localhost:${PORT}`);
});
