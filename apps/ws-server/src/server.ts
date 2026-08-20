import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { createServer } from 'http';
import { initSocketServer } from './socket';


const app = express();
const httpServer = createServer(app);

initSocketServer(httpServer);

const port = process.env.WS_PORT || process.env.PORT || 8080;

app.get('/', (req, res) => {
  res.send('WebSocket server is running');
});

httpServer.listen(port, () => {
  console.log(`WebSocket server is running on port ${port}`);
});
