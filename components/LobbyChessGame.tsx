'use client'

import { useEffect, useState } from 'react'
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import { useAuth } from "@clerk/nextjs"
import { motion } from 'framer-motion'
import { apiClient } from '@/lib/api-client'

interface GameState {
  fen: string
  turn: 'w' | 'b'
  status: 'active' | 'completed'
  winner?: string
  timeControl: string
  mode: string
  players: {
    white: { userId: string }
    black: { userId: string }
  }
}

export default function LobbyChessGame({ gameId }: { gameId: string }) {
  const { userId } = useAuth()
  const [game, setGame] = useState<Chess>(new Chess())
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [orientation, setOrientation] = useState<'white' | 'black'>('white')

  useEffect(() => {
    // Connect to game via WebSocket
    const ws = new WebSocket(`${apiClient.getWsUrl()}/game/${gameId}`)
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      
      if (data.type === 'game_state') {
        setGameState(data.state)
        game.load(data.state.fen)
        
        // Set orientation based on player color
        if (userId === data.state.players.white.userId) {
          setOrientation('white')
        } else if (userId === data.state.players.black.userId) {
          setOrientation('black')
        }
      }
      
      if (data.type === 'move') {
        game.move(data.move)
        setGame(new Chess(game.fen()))
      }
    }

    return () => {
      ws.close()
    }
  }, [gameId, userId])

  function onDrop(sourceSquare: string, targetSquare: string) {
    // Don't allow moves if it's not player's turn
    if (!gameState || 
        (game.turn() === 'w' && gameState.players.white.userId !== userId) ||
        (game.turn() === 'b' && gameState.players.black.userId !== userId)) {
      return false
    }

    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q', // Always promote to queen for simplicity
      })

      if (move === null) return false

      // Send move to server using API client
      apiClient.makeMove(gameId, { move })
        .catch(error => console.error('Failed to make move:', error))

      setGame(new Chess(game.fen()))
      return true
    } catch (error) {
      return false
    }
  }

  if (!gameState) return <div>Loading...</div>

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-full"
    >
      <Chessboard
        position={game.fen()}
        onPieceDrop={onDrop}
        boardOrientation={orientation}
        customBoardStyle={{
          borderRadius: '4px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
        }}
      />
    </motion.div>
  )
} 