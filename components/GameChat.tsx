import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { socketClient } from '@/lib/socket-client';
import { ChatMessage } from '@/types/game';

interface GameChatProps {
  gameId: string;
}

export function GameChat({ gameId }: GameChatProps) {
  const { userId } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const channel = socketClient.supabase
      .channel(`game:${gameId}:chat`)
      .on('broadcast', { event: 'new_message' }, (payload: any) => {
        setMessages(prev => [...prev, payload.message]);
      })
      .subscribe();

    // Load existing messages
    socketClient.getGameMessages(gameId)
      .then(setMessages)
      .catch(console.error);

    return () => {
      channel.unsubscribe();
    };
  }, [gameId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !userId) return;

    try {
      await socketClient.sendGameMessage(gameId, {
        text: newMessage.trim(),
        userId,
        timestamp: Date.now()
      });
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-800 rounded-lg p-4">
      <div className="flex-1 overflow-y-auto mb-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`mb-2 ${msg.userId === userId ? 'text-right' : 'text-left'}`}
          >
            <div
              className={`inline-block px-3 py-2 rounded-lg ${
                msg.userId === userId ? 'bg-blue-600' : 'bg-gray-700'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 bg-gray-700 rounded px-3 py-2 text-white"
          placeholder="Type a message..."
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
        >
          Send
        </button>
      </form>
    </div>
  );
} 