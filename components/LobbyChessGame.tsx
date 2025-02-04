'use client'

import { useEffect, useState } from 'react'
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import { useAuth } from "@clerk/nextjs"
import { motion } from 'framer-motion'
import { apiClient } from '@/lib/api-client'

type GameState = {
  fen: string;
  players: { white: string; black: string };
  status: 'waiting' | 'playing' | 'finished';
  turn: 'w' | 'b';
  lastMove?: string;
};

interface Props {
  gameState: GameState;
  userId: string;
  onMove: (move: { from: string; to: string; promotion?: string }) => void;
  isSpectator?: boolean;
}

export default function LobbyChessGame({ gameState, userId, onMove, isSpectator = false }: Props) {
  const { userId: clerkUserId } = useAuth()
  const [game, setGame] = useState(new Chess())
  const [orientation, setOrientation] = useState<'white' | 'black'>('white')

  useEffect(() => {
    if (gameState.fen) {
      const newGame = new Chess()
      newGame.load(gameState.fen)
      setGame(newGame)
    }

    // Set orientation based on player's color
    if (gameState.players.white === userId) {
      setOrientation('white')
    } else if (gameState.players.black === userId) {
      setOrientation('black')
    }
  }, [gameState.fen, gameState.players, userId])

  const onDrop = (sourceSquare: string, targetSquare: string) => {
    // Don't allow moves if spectating or game is not in playing state
    if (isSpectator || gameState.status !== 'playing') {
      return false
    }

    // Don't allow moves if it's not the player's turn
    const playerColor = gameState.players.white === userId ? 'w' : 'b'
    if (gameState.turn !== playerColor) {
      return false
    }

    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q' // always promote to queen for simplicity
      })

      if (move === null) return false

      onMove({
        from: sourceSquare,
        to: targetSquare,
        promotion: move.promotion
      })

      return true
    } catch (error) {
      return false
    }
  }

  return (
    <div className="relative">
      <Chessboard
        position={game.fen()}
        onPieceDrop={onDrop}
        boardOrientation={orientation}
        customBoardStyle={{
          borderRadius: '4px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
        }}
        customDarkSquareStyle={{ backgroundColor: '#779952' }}
        customLightSquareStyle={{ backgroundColor: '#edeed1' }}
      />
      {gameState.status === 'waiting' && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-white text-center p-4 rounded bg-gray-800">
            <p className="text-xl font-semibold">Waiting for opponent</p>
            <p className="text-sm mt-2">The game will start when both players join</p>
          </div>
        </div>
      )}
    </div>
  )
} 