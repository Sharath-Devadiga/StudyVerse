'use client';

import { useState } from 'react';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  disabled: boolean;
}

export function MessageInput({ onSendMessage, disabled }: MessageInputProps) {
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSendMessage(content);
      setContent('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
      <div className="flex items-center bg-gray-700 rounded-lg">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a message..."
          disabled={disabled}
          className="flex-1 p-3 bg-transparent text-white placeholder-gray-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={disabled || !content.trim()}
          className="p-3 text-blue-400 hover:text-blue-300 disabled:text-gray-500 transition-colors"
        >
          Send
        </button>
      </div>
    </form>
  );
}
