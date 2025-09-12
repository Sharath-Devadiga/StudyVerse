'use client';

import { useChat } from '../../hooks/useChat';
import { useSocket } from '../../hooks/useSocket'; // Import the useSocket hook
import { Room } from '../../../app/types';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { useUserStore } from '../../../stores/useUserStore';
import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

// Define the props that this component accepts
interface ChatWindowProps {
  room: Room;
}

export function ChatWindow({ room }: ChatWindowProps) {
  // Get the logged-in user's data from the global store
  const { user } = useUserStore();
  
  // Use our custom hook to manage all chat logic for the given room
  const { messages, sendMessage } = useChat(room.id);
  
  // --- FIX 1: Get connection status directly from the useSocket hook ---
  const { isConnected } = useSocket(room.id);

  // Create a ref to the end of the messages list for auto-scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // This effect will run whenever the messages array changes, scrolling to the bottom.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Guard clause in case user data hasn't loaded yet
  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        Authenticating...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-800 rounded-lg">
      {/* Chat Header */}
      <header className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold">{room.name}</h2>
        <span className={`text-xs transition-colors ${isConnected ? 'text-green-400' : 'text-yellow-400'}`}>
          {isConnected ? 'Connected' : 'Connecting...'}
        </span>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
            <div className="text-center text-gray-500 pt-8">
                Be the first to send a message!
            </div>
        )}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} isOwnMessage={msg.user.id === user.id} />
        ))}
        {/* This invisible div marks the end of the messages list for auto-scrolling */}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Area with Animation */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.3 }}>
        {/* --- FIX 2: Pass the disabled prop based on connection status --- */}
        <MessageInput onSendMessage={sendMessage} disabled={!isConnected} />
      </motion.div>
    </div>
  );
}

