import { useEffect, useState } from 'react';
import { useAuth } from "@clerk/nextjs";
import ChessGame from './ChessGame';
import { GameState } from '@/types/game';
import { socketClient } from '@/lib/socket-client';

interface GameRoomProps {
  gameId: string;
}

export function GameRoom({ gameId }: GameRoomProps) {
  const { userId } = useAuth();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || !gameId) return;

    const channel = socketClient.supabase
      .channel(`game:${gameId}`)
      .on('broadcast', { event: 'game_update' }, (payload: any) => {
        setGameState(payload);
      })
      .subscribe();

    // Initial game state fetch
    socketClient.getGame(gameId)
      .then(setGameState)
      .catch(err => setError(err.message));

    return () => {
      channel.unsubscribe();
    };
  }, [gameId, userId]);

  const playerColor = gameState?.players.white.userId === userId ? 'white' : 'black';

  if (error) return <div>Error: {error}</div>;
  if (!gameState) return <div>Loading...</div>;

  return (
    <div className="game-room">
      <div className="game-info">
        <div>Time Control: {gameState.timeControl}</div>
        <div>Mode: {gameState.mode}</div>
      </div>

      <ChessGame
        gameState={gameState}
        playerColor={playerColor}
        onMove={async (move) => {
          try {
            await socketClient.makeMove(gameId, move);
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to make move');
          }
        }}
      />
    </div>
  );
} 