import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@clerk/nextjs';
import { socketClient } from '@/lib/socket-client';
import { GameState } from '@/types/game';

export function useGameState(gameId: string) {
  const { userId } = useAuth();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId || !gameId) return;

    const channel = socketClient.supabase
      .channel(`game:${gameId}`)
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'games' },
        (payload: any) => {
          // Update game state when opponent joins
          setGameState(payload.new);
        }
      )
      .subscribe();

    // Initial fetch
    socketClient.getOrCreateGame(gameId, userId)
      .then(setGameState)
      .catch(err => setError(err.message))
      .finally(() => setIsLoading(false));

    return () => {
      channel.unsubscribe();
    };
  }, [gameId, userId]);

  const makeMove = async (move: any) => {
    try {
      await socketClient.makeMove(gameId, move);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to make move');
      throw err;
    }
  };

  // Determine player color safely
  const playerColor = useMemo(() => {
    if (!gameState?.players) return 'white'; // Default for new games
    const whitePlayer = gameState.players.find(p => p.color === 'white');
    return whitePlayer?.userId === userId ? 'white' : 'black';
  }, [gameState?.players, userId]);

  return {
    gameState,
    error,
    isLoading,
    makeMove,
    playerColor
  };
} 