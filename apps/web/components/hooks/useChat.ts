import { useEffect, useState } from 'react';
import { socket } from '../../app/lib/socket';
import { getMessages } from '../../app/lib/api'
import { Message } from '../../app/types';

export const useChat = (roomId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  // Fetch initial message history
  useEffect(() => {
    if (!roomId) return;
    setIsLoadingHistory(true);
    getMessages(roomId)
      .then(setMessages)
      .catch(err => console.error("Failed to fetch message history", err))
      .finally(() => setIsLoadingHistory(false));
  }, [roomId]);

  // Listen for new messages
  useEffect(() => {
    function onNewMessage(newMessage: Message) {
        // Add the new message to the state
        setMessages(prevMessages => [...prevMessages, newMessage]);
    }

    socket.on('new-message', onNewMessage);

    return () => {
        socket.off('new-message', onNewMessage);
    };
  }, []);

  // Function to send a message
  const sendMessage = (content: string) => {
    socket.emit('send-message', { roomId, content });
  };

  return { messages, sendMessage, isLoadingHistory };
};
