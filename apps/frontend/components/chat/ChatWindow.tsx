'use client';

import { useState, useEffect, useRef } from 'react';
import { useChatWebSocket } from '@/hooks/useChatWebSocket';

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: Date;
}

interface ChatWindowProps {
  gameId: string;
  token?: string;
}

export function ChatWindow({ gameId, token }: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { sendMessage, isConnected } = useChatWebSocket({
    gameId,
    token,
    onMessage: (data) => {
      setMessages((prev) => [
        ...prev,
        {
          id: data.id,
          userId: data.userId,
          username: data.username,
          message: data.message,
          timestamp: new Date(data.timestamp),
        },
      ]);
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && isConnected) {
      sendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full border border-gray-300 rounded-lg">
      <div className="p-2 bg-gray-100 border-b">
        <h3 className="font-semibold">Chat</h3>
        {!isConnected && <span className="text-xs text-gray-500">Connecting...</span>}
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-sm text-center">No messages yet</p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="text-sm">
              <span className="font-semibold">{msg.username}:</span>{' '}
              <span>{msg.message}</span>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-2 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded"
            disabled={!isConnected}
          />
          <button
            type="submit"
            disabled={!isConnected || !input.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
