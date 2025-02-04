'use client'

import { useState, useEffect } from 'react'
import { useAuth } from "@clerk/nextjs"
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { IconUsers, IconClock, IconChess } from "@tabler/icons-react"
import { useLobbySocket } from '@/hooks/useLobbySocket'

export default function LobbyPage() {
  const { userId, signOut } = useAuth()
  const router = useRouter()
  const [timeControl, setTimeControl] = useState('5+0')
  const [mode, setMode] = useState('standard')
  
  const { lobbies, error, isCreatingLobby, createLobby, joinLobby } = useLobbySocket(userId!)

  const handleCreateLobby = () => {
    try {
      console.log('Creating lobby with:', { timeControl, mode }) // Debug log
      createLobby({ timeControl, mode })
    } catch (error) {
      console.error('Error creating lobby:', error)
    }
  }

  const handleJoinLobby = (lobbyId: string) => {
    joinLobby(lobbyId)
  }

  // Listen for game creation
  useEffect(() => {
    const handleGameCreated = (event: CustomEvent<string>) => {
      const gameId = event.detail;
      router.push(`/game/${gameId}`);
    };

    window.addEventListener('game_created', handleGameCreated as EventListener);
    return () => {
      window.removeEventListener('game_created', handleGameCreated as EventListener);
    };
  }, [router]);

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with logout */}
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold">Game Lobby</h1>
          <button
            onClick={() => signOut()}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Log Out
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500">
            {error}
          </div>
        )}

        {/* Create Game Section */}
        <div className="backdrop-blur-sm bg-white/10 rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-6">Create Game</h2>
          
          {/* Time Control Selection */}
          <div className="mb-6">
            <label className="block mb-2 flex items-center">
              <IconClock className="mr-2" />
              Time Control
            </label>
            <select
              value={timeControl}
              onChange={(e) => setTimeControl(e.target.value)}
              className="w-full p-2 rounded bg-gray-800 border border-gray-700"
            >
              <option value="1+0">1 min</option>
              <option value="3+0">3 min</option>
              <option value="5+0">5 min</option>
              <option value="10+0">10 min</option>
            </select>
          </div>

          {/* Game Mode Selection */}
          <div className="mb-6">
            <label className="block mb-2 flex items-center">
              <IconChess className="mr-2" />
              Game Mode
            </label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full p-2 rounded bg-gray-800 border border-gray-700"
            >
              <option value="standard">Standard</option>
              <option value="chaos">Chaos</option>
            </select>
          </div>

          <motion.button
            onClick={handleCreateLobby}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isCreatingLobby}
          >
            {isCreatingLobby ? 'Creating...' : 'Create Game'}
          </motion.button>
        </div>

        {/* Active Games List */}
        <div className="backdrop-blur-sm bg-white/10 rounded-xl p-6">
          <h2 className="text-2xl font-semibold mb-6 flex items-center">
            <IconUsers className="mr-2" />
            Active Games
          </h2>
          <div className="space-y-4">
            {lobbies.length === 0 ? (
              <p className="text-gray-400">No active games available</p>
            ) : (
              lobbies.map(lobby => (
                <motion.div
                  key={lobby.id}
                  className="p-4 bg-white/5 rounded-lg flex justify-between items-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div>
                    <p className="font-medium">{lobby.mode}</p>
                    <p className="text-sm text-gray-400">{lobby.timeControl}</p>
                  </div>
                  <motion.button
                    onClick={() => handleJoinLobby(lobby.id)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Join
                  </motion.button>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 