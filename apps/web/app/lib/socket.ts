import { io, Socket } from 'socket.io-client';

// Ensure this URL matches your ws-server
const URL = 'http://localhost:8001';

// Create a singleton instance of the socket
// withCredentials is required to send the auth cookie
export const socket: Socket = io(URL, {
    autoConnect: false, // We will connect manually
    withCredentials: true,
});
