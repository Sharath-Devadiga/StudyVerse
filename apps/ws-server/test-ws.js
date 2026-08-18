const { io } = require("socket.io-client");

const token = process.argv[2];
const roomId = process.argv[3];

if (!token || !roomId) {
  console.error("Usage: node test-ws.js <token> <roomId>");
  process.exit(1);
}

const socket = io("http://localhost:8081", {
  auth: { token },
  transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("CONNECTED", socket.id);
  socket.emit("join-room", roomId);
});

socket.on("joined-room", (msg) => {
  console.log("JOINED", msg);
  socket.emit("room-chat", {
    room: roomId,
    message: `Test message at ${new Date().toISOString()}`,
  });
});

socket.on("room-chat", (msg) => {
  console.log("RECEIVED", JSON.stringify(msg));
  socket.disconnect();
  process.exit(0);
});

socket.on("error", (err) => {
  console.error("ERROR", err);
  process.exit(1);
});

socket.on("connect_error", (err) => {
  console.error("CONNECT_ERROR", err.message);
  process.exit(1);
});

setTimeout(() => {
  console.error("TIMEOUT");
  process.exit(1);
}, 15000);
