'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ChessBoard } from '@/components/chess/ChessBoard';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { VotingPanel } from '@/components/voting/VotingPanel';
import { GameControls } from '@/components/game/GameControls';
import { GameClock } from '@/components/game/GameClock';
import { gamesApi } from '@/lib/api';
import { useGameWebSocket } from '@/hooks/useGameWebSocket';

export default function GamePage() {
  const params = useParams();
  const gameId = params.id as string;
  const [game, setGame] = useState<any>(null);
  const [legalMoves, setLegalMoves] = useState<Array<{ from: string; to: string }>>([]);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [votingActive] = useState(false);
  const [isWhiteTurn, setIsWhiteTurn] = useState(true);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // Load game data
  useEffect(() => {
    if (gameId) {
      gamesApi.getGame(gameId).then(setGame);
    }
  }, [gameId]);

  // WebSocket connection for real-time updates
  useGameWebSocket({
    gameId,
    token: token || undefined,
    onMove: (data) => {
      setGame((prev: any) => ({
        ...prev,
        currentFen: data.gameState.currentFen,
        moves: [...(prev?.moves || []), data.move],
      }));
    },
    onGameUpdate: (data) => {
      setGame(data.game);
    },
    onGameFinished: (data) => {
      setGame(data.game);
    },
  });

  // Get legal moves when position changes
  useEffect(() => {
    if (game?.currentFen) {
      // Parse FEN to determine turn
      const turn = game.currentFen.split(' ')[1];
      setIsWhiteTurn(turn === 'w');

      // Get legal moves - in production, this would come from backend
      // For now, we'll calculate client-side if chess.js is available
      try {
        // This would require chess.js on frontend
        // For MVP, we'll leave it empty and let backend validate
        setLegalMoves([]);
      } catch {
        setLegalMoves([]);
      }
    }
  }, [game?.currentFen]);

  const handleMove = async (from: string, to: string) => {
    if (!game || !token) return;

    try {
      const move = from + to;
      const result = await gamesApi.makeMove(gameId, move);
      setGame(result.game);
      setSelectedSquare(null);
    } catch (error) {
      console.error('Move failed:', error);
    }
  };

  if (!game) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading game...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main game area */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h1 className="text-2xl font-bold mb-4">Game {gameId}</h1>
            <div className="mb-4">
              <p>
                {game.whitePlayer?.username} vs {game.blackPlayer?.username}
              </p>
              <p>Status: {game.status}</p>
            </div>
            <ChessBoard
              fen={game.currentFen}
              onMove={handleMove}
              legalMoves={legalMoves}
              selectedSquare={selectedSquare}
              onSquareClick={setSelectedSquare}
            />

            <div className="mt-4">
              <GameClock
                whiteTime={game.whiteTimeLeft}
                blackTime={game.blackTimeLeft}
                isWhiteTurn={isWhiteTurn}
                isActive={game.status === 'IN_PROGRESS'}
              />
            </div>

            <div className="mt-4">
              <GameControls
                gameId={gameId}
                gameStatus={game.status}
                onGameUpdate={() => gamesApi.getGame(gameId).then(setGame)}
              />
            </div>
          </div>

          {/* Voting panel for chaos mode */}
          {game.isChaosMode && (
            <VotingPanel gameId={gameId} token={token || undefined} isActive={votingActive} />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <ChatWindow gameId={gameId} token={token || undefined} />

          {/* Move history */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2">Move History</h3>
            <div className="space-y-1 text-sm font-mono">
              {game.moves?.map((move: any, index: number) => (
                <div key={move.id}>
                  {Math.ceil((index + 1) / 2)}. {move.san || move.move}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
