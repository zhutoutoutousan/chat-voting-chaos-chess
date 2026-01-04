'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';

interface VotingWebSocketOptions {
  gameId: string;
  token?: string;
  onVotingStarted?: (data: any) => void;
  onVoteUpdate?: (data: any) => void;
  onVotingEnded?: (data: any) => void;
}

export function useVotingWebSocket(options: VotingWebSocketOptions) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const optionsRef = useRef(options);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    const token = options.token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

    const newSocket = io(`${WS_URL}/voting`, {
      auth: {
        token,
      },
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      newSocket.emit('join-voting', { gameId: optionsRef.current.gameId });
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('voting-started', (data) => {
      optionsRef.current.onVotingStarted?.(data);
    });

    newSocket.on('vote-update', (data) => {
      optionsRef.current.onVoteUpdate?.(data);
    });

    newSocket.on('voting-ended', (data) => {
      optionsRef.current.onVotingEnded?.(data);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [options.gameId, options.token]);

  const submitVote = useCallback(
    (vote: string | number) => {
      if (socket && isConnected) {
        socket.emit('submit-vote', {
          gameId: optionsRef.current.gameId,
          vote,
        });
      }
    },
    [socket, isConnected]
  );

  return {
    socket,
    isConnected,
    submitVote,
  };
}
