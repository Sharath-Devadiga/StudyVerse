'use client';

import { useEffect, useState } from 'react';
import * as api from '../../../app/lib/api';
import { Room } from '../../../app/types';
import { AnimatePresence, motion } from 'framer-motion';
import { ChatWindow } from './ChatWindow'; // Import the main ChatWindow component

interface ChatContainerProps {
  semesterId: string | null;
}

export function ChatContainer({ semesterId }: ChatContainerProps) {
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // When semesterId changes, reset the state
    if (!semesterId) {
      setCurrentRoom(null);
      return;
    }

    const join = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const room = await api.joinSemesterRoom(semesterId);
        setCurrentRoom(room);
      } catch (err) {
        console.error("Failed to join room", err);
        setError("Could not join or load the chat room. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    join();
  }, [semesterId]); // This effect runs whenever the selected semester changes

  return (
    <div className="flex flex-col h-full">
      <AnimatePresence mode="wait">
        {!semesterId && (
          <motion.div
            key="prompt"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-center h-full text-gray-400"
          >
            Please select a semester from the right to begin chatting.
          </motion.div>
        )}

        {isLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center h-full text-gray-400"
          >
            Joining room...
          </motion.div>
        )}

        {error && (
           <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center h-full text-red-400"
          >
            {error}
          </motion.div>
        )}
        
        {currentRoom && !isLoading && !error && (
            <motion.div
                key={currentRoom.id} // Use room ID as key to force re-render on room change
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full"
            >
                {/* This is the key change: render the ChatWindow component */}
                <ChatWindow room={currentRoom} />
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

