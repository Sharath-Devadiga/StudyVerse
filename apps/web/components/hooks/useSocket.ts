import { useEffect, useState } from 'react';
import { socket } from '../../app/lib/socket';

export const useSocket = (roomId: string) => {
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
      console.log('✅ Socket connected, joining room:', roomId);
      socket.emit('join-room', roomId);
    }

    function onDisconnect() {
      setIsConnected(false);
      console.log('❌ Socket disconnected');
    }

    if (!socket.connected) {
      socket.connect();
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    // Join the room if already connected when component mounts
    if(socket.connected) {
        socket.emit('join-room', roomId);
    }
    
    // Cleanup on component unmount
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      // Optional: leave room on cleanup
      // socket.emit('leave-room', roomId); 
    };
  }, [roomId]);

  return { isConnected };
};
