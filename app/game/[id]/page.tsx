'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { socketClient } from '@/lib/socket-client'
import LobbyChessGame from '@/components/LobbyChessGame'
import { IconCopy, IconArrowLeft } from '@tabler/icons-react'
import { GameRoom } from '@/components/GameRoom'
import { useGameState } from '@/hooks/useGameState'
import { useAuth as useClerkAuth } from '@clerk/nextjs'

type GameState = {
  fen: string;
  players: { white: string; black: string };
  status: 'waiting' | 'playing' | 'finished';
  turn: 'w' | 'b';
  lastMove?: string;
  whiteId?: string;
  blackId?: string;
};

export default function GamePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { id: gameId } = useParams()
  const searchParams = useSearchParams()
  const isSpectator = searchParams.get('spectate') === 'true'
  const { userId } = useAuth()
  const { gameState, isLoading, error } = useGameState(params.id)
  const [copySuccess, setCopySuccess] = useState(false)
  const { userId: clerkUserId } = useClerkAuth()

  // Check for self-play
  const isSelfPlay = gameState?.whiteId === gameState?.blackId && gameState?.whiteId === clerkUserId

  const handleMove = async (move: { from: string; to: string; promotion?: string }) => {
    if (!gameId || !clerkUserId || isSpectator) return;
    try {
      await socketClient.makeMove(gameId as string, clerkUserId, move);
    } catch (err) {
      console.error('Failed to make move:', err);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleBackToLobby = () => {
    router.push('/lobby');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-black">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto"></div>
          <p className="mt-4">Loading game...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-black">
        <div className="text-center text-white">
          <p className="text-red-500">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (searchParams.get('wait') === 'true' && gameState?.status === 'waiting') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        <h1 className="text-2xl font-bold mb-4">Waiting for Opponent</h1>
        <div className="animate-pulse text-gray-400">
          Share your lobby link or wait for someone to join...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8">
      {isSelfPlay && (
        <div className="bg-yellow-500/20 text-yellow-200 px-4 py-2 text-center">
          ⚠️ You are playing against yourself in another window
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Back to Lobby Button */}
        <button
          onClick={handleBackToLobby}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8"
        >
          <IconArrowLeft size={20} />
          Back to Lobby
        </button>

        {/* Game Status Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-4">
            {isSpectator ? 'Spectating Game' : 'Chess Game'}
          </h1>
          <div className="flex items-center justify-center gap-4">
            <span className={`inline-block w-3 h-3 rounded-full ${
              !gameState ? 'bg-gray-500' :
              gameState.status === 'waiting' ? 'bg-yellow-500' :
              gameState.status === 'playing' ? 'bg-green-500' :
              'bg-red-500'
            }`} />
            <span className="text-lg">
              {!gameState ? 'Connecting...' :
               gameState.status === 'waiting' ? 'Waiting for opponent' :
               gameState.status === 'playing' ? 'Game in progress' :
               'Game finished'}
            </span>
          </div>
        </div>

        {/* Waiting Room UI */}
        {gameState?.status === 'waiting' && gameState.players.white === clerkUserId && (
          <div className="mb-8 bg-gray-800 rounded-lg p-6 max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold mb-4">Waiting Room</h2>
            <p className="text-gray-300 mb-4">
              Share this link with your opponent to start the game:
            </p>
            <div className="flex items-center gap-2 mb-6">
              <input
                type="text"
                value={window.location.href}
                readOnly
                className="flex-1 bg-gray-700 rounded px-3 py-2 text-sm"
              />
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
              >
                <IconCopy size={16} />
                {copySuccess ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="border-t border-gray-700 pt-4">
              <h3 className="font-medium mb-2">Players:</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>You (White)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                  <span className="text-gray-400">Waiting for Black...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Players Info and Chessboard */}
        <div className="max-w-2xl mx-auto">
          {gameState && (
            <div className="mb-8 grid grid-cols-2 gap-4">
              <div className="text-center">
                <h2 className="font-semibold mb-2">White</h2>
                <p>{gameState.players.white || 'Waiting...'}</p>
              </div>
              <div className="text-center">
                <h2 className="font-semibold mb-2">Black</h2>
                <p>{gameState.players.black || 'Waiting...'}</p>
              </div>
            </div>
          )}

          <LobbyChessGame
            gameState={gameState || {
              fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
              players: { white: '', black: '' },
              status: 'waiting',
              turn: 'w'
            }}
            userId={clerkUserId!}
            onMove={handleMove}
            isSpectator={isSpectator}
          />
        </div>
      </div>
    </div>
  );
} 