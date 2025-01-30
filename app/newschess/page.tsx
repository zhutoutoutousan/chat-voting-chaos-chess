"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import NewsChessGame from '@/components/NewsChessGame'

export default function NewsChessPage() {
  const [player1, setPlayer1] = useState('')
  const [player2, setPlayer2] = useState('')
  const [gameStarted, setGameStarted] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleNoNews = () => {
    setGameStarted(false)
    setError('No news found for these players. Please try different names.')
  }

  return gameStarted ? (
    <NewsChessGame 
      player1={player1} 
      player2={player2} 
      onNoNews={handleNoNews}
    />
  ) : (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-8">News Chess</h1>
        <p className="mb-6 text-gray-300">
          Enter two names to generate a chess game influenced by their news presence.
          The more news they share, the more chaos in the game!
        </p>
        
        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded text-red-200">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Player 1 Name</label>
            <input
              type="text"
              value={player1}
              onChange={(e) => setPlayer1(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 rounded border border-gray-700 focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Elon Musk"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Player 2 Name</label>
            <input
              type="text"
              value={player2}
              onChange={(e) => setPlayer2(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 rounded border border-gray-700 focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Mark Zuckerberg"
            />
          </div>

          <button
            onClick={() => setGameStarted(true)}
            disabled={!player1 || !player2}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded font-medium"
          >
            Start Game
          </button>
        </div>
      </div>
    </div>
  )
} 