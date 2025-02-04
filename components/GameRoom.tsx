import { useEffect, useState } from 'react';
import { useAuth } from "@clerk/nextjs";
import ChessGame from './ChessGame';
import { GameState } from '@/types/game';
import { apiClient } from '@/lib/api-client';
import { socketClient } from '@/lib/socket-client';

interface GameRoomProps {
  gameId: string;
}

export function GameRoom({ gameId }: GameRoomProps) {
  const { userId } = useAuth();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load initial game state
    const loadGame = async () => {
      try {
        const response = await apiClient.get(`/game/${gameId}`);
        setGameState(response.data);
      } catch (error) {
        setError('Failed to load game');
        console.error('Game load error:', error);
      }
    };

    loadGame();

    // Connect to game socket
    const socket = socketClient.connectToGame(gameId, userId!);

    socket.on('game_state', (state: GameState) => {
      setGameState(state);
    });

    socket.on('game_error', (error: { message: string }) => {
      setError(error.message);
    });

    return () => {
      socket.disconnect();
    };
  }, [gameId, userId]);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!gameState) {
    return <div>Loading game...</div>;
  }

  const playerColor = gameState.players.white.userId === userId ? 'white' : 'black';

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4">
        <h2>Game Room {gameId}</h2>
        <div>Time Control: {gameState.timeControl}</div>
        <div>Mode: {gameState.mode}</div>
      </div>

      <ChessGame
        gameState={gameState}
        playerColor={playerColor}
        onMove={(move) => {
          socket.emit('move', { move });
        }}
      />
    </div>
  );
} 