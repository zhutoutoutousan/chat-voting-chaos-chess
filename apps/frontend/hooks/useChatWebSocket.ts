'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';

interface ChatWebSocketOptions {
  gameId: string;
  token?: string;
  onMessage?: (data: any) => void;
}

export function useChatWebSocket(options: ChatWebSocketOptions) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const optionsRef = useRef(options);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    const token = options.token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

    const newSocket = io(`${WS_URL}/chat`, {
      auth: {
        token,
      },
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      newSocket.emit('join-chat', { gameId: optionsRef.current.gameId });
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('new-message', (data) => {
      optionsRef.current.onMessage?.(data);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [options.gameId, options.token]);

  const sendMessage = useCallback(
    (message: string) => {
      if (socket && isConnected) {
        socket.emit('send-message', {
          gameId: optionsRef.current.gameId,
          message,
        });
      }
    },
    [socket, isConnected]
  );

  return {
    socket,
    isConnected,
    sendMessage,
  };
}
