'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';

interface GameWebSocketOptions {
  gameId: string;
  token?: string;
  onMove?: (data: any) => void;
  onGameUpdate?: (data: any) => void;
  onGameFinished?: (data: any) => void;
  onUserJoined?: (data: any) => void;
  onUserLeft?: (data: any) => void;
}

export function useGameWebSocket(options: GameWebSocketOptions) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const optionsRef = useRef(options);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    const token = options.token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

    const newSocket = io(`${WS_URL}/games`, {
      auth: {
        token,
      },
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      newSocket.emit('join-game', { gameId: optionsRef.current.gameId });
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('move-made', (data) => {
      optionsRef.current.onMove?.(data);
    });

    newSocket.on('game-update', (data) => {
      optionsRef.current.onGameUpdate?.(data);
    });

    newSocket.on('game-finished', (data) => {
      optionsRef.current.onGameFinished?.(data);
    });

    newSocket.on('user-joined', (data) => {
      optionsRef.current.onUserJoined?.(data);
    });

    newSocket.on('user-left', (data) => {
      optionsRef.current.onUserLeft?.(data);
    });

    setSocket(newSocket);

    return () => {
      newSocket.emit('leave-game', { gameId: optionsRef.current.gameId });
      newSocket.close();
    };
  }, [options.gameId, options.token]);

  return {
    socket,
    isConnected,
  };
}
