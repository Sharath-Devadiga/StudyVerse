import { Server, Socket } from "socket.io";


export const registerChatHandlers = (io: Server, socket: Socket) => {

  const joinRoom = (roomName: string) => {
    socket.join(roomName);
    console.log(`User ${socket.data.user.username} (${socket.id}) joined room: ${roomName}`);
    
    socket.emit('joined-room', `You have successfully joined room: ${roomName}`);
  };

 
  const handleMessage = (data: { room: string; message: string }) => {
    const sender = socket.data.user;

    if (data.room && data.message && sender) {
      console.log(`Message from ${sender.username} in room ${data.room}: ${data.message}`);

      // Send the message in the same format as our Message type
      io.in(data.room).emit('room-chat', {
        id: Math.random().toString(36).substr(2, 9), // temporary ID until we implement DB
        content: data.message,
        createdAt: new Date().toISOString(),
        userId: sender.id,
        roomId: data.room,
        user: {
          id: sender.id,
          name: sender.name,
          avatar: sender.avatar
        }
      });
    }
  };

  socket.on('join-room', joinRoom);
  socket.on('room-chat', handleMessage);
};
