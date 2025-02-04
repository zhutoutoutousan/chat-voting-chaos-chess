'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from "@clerk/nextjs"
import ChessGame from '@/components/ChessGame'
import { motion } from 'framer-motion'
import { IconClock, IconMessage } from "@tabler/icons-react"
import LobbyChessGame from '@/components/LobbyChessGame'
import { GameState, ChatMessage } from '@/types/game'
import { apiClient } from '@/lib/api-client'

export default function GameRoom() {
  const { id } = useParams()
  const { userId } = useAuth()
  const router = useRouter()
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')

  useEffect(() => {
    const connectToGame = async () => {
      try {
        const data = await apiClient.getGame(id as string)
        setGameState(data)
      } catch (error) {
        console.error('Failed to connect to game:', error)
        router.push('/lobby')
      }
    }

    connectToGame()
  }, [id])

  const handleSendMessage = () => {
    if (!newMessage.trim()) return
    // Implement chat functionality
    setMessages([...messages, { text: newMessage, userId }])
    setNewMessage('')
  }

  if (!gameState) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Game Board */}
        <div className="lg:col-span-2">
          <div className="aspect-square w-full backdrop-blur-sm bg-white/5 rounded-xl p-4">
            <LobbyChessGame gameId={id as string} />
          </div>
        </div>

        {/* Game Info & Chat */}
        <div className="space-y-4">
          {/* Game Info */}
          <div className="backdrop-blur-sm bg-white/10 rounded-xl p-4">
            <h2 className="text-xl font-semibold mb-4">Game Info</h2>
            <div className="flex items-center mb-2">
              <IconClock className="mr-2" />
              <span>{gameState.timeControl}</span>
            </div>
            {/* Add more game info here */}
          </div>

          {/* Chat */}
          <div className="backdrop-blur-sm bg-white/10 rounded-xl p-4 flex flex-col h-[400px]">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <IconMessage className="mr-2" />
              Chat
            </h2>
            
            <div className="flex-1 overflow-y-auto mb-4 space-y-2">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-2 rounded ${
                    msg.userId === userId
                      ? 'bg-blue-600 ml-auto'
                      : 'bg-gray-700'
                  } max-w-[80%]`}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 p-2 rounded bg-gray-800 border border-gray-700"
                placeholder="Type a message..."
              />
              <motion.button
                onClick={handleSendMessage}
                className="px-4 py-2 bg-blue-600 rounded"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Send
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 