import { Message } from '../../../app/types';
import { motion } from 'framer-motion';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
}

export function MessageBubble({ message, isOwnMessage }: MessageBubbleProps) {
  const alignment = isOwnMessage ? 'justify-end' : 'justify-start';
  const colors = isOwnMessage 
    ? 'bg-blue-600 text-white' 
    : 'bg-gray-700 text-gray-200';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`flex items-end gap-2 ${alignment}`}
    >
      {!isOwnMessage && (
        <img
          src={message.user.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${message.user.name}`}
          alt={message.user.name}
          className="w-8 h-8 rounded-full"
        />
      )}
      <div className="flex flex-col">
        {!isOwnMessage && (
            <span className="text-xs text-gray-400 ml-2 mb-1">{message.user.name}</span>
        )}
        <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${colors}`}>
          <p>{message.content}</p>
        </div>
      </div>
    </motion.div>
  );
}
