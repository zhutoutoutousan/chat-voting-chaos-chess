'use client'

import { useState, useEffect } from 'react'
import { useAuth } from "@clerk/nextjs"
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { IconUsers, IconClock, IconChess } from "@tabler/icons-react"
import { useLobbySocket } from '@/hooks/useLobbySocket'
import { socketClient } from '@/lib/socket-client'

export default function LobbyPage() {
  const { userId, signOut } = useAuth()
  const router = useRouter()
  const [timeControl, setTimeControl] = useState('5+0')
  const [mode, setMode] = useState('standard')
  const [isCreatingLobby, setIsCreatingLobby] = useState(false)
  
  const { lobbies = [], isLoading, error, isConnected, refresh, createLobby, joinLobby, terminateLobby, isOwnLobby } = useLobbySocket()

  const handleCreateLobby = async () => {
    try {
      setIsCreatingLobby(true)
      await createLobby({ timeControl, mode })
    } catch (error) {
      console.error('Error creating lobby:', error)
    } finally {
      setIsCreatingLobby(false)
    }
  }

  const handleJoinLobby = async (lobbyId: string) => {
    try {
      await joinLobby(lobbyId)
      // Navigation is handled by onGameCreated callback in useLobbySocket
    } catch (error) {
      console.error('Failed to join lobby:', error)
    }
  }

  const handleSpectateGame = (gameId: string) => {
    try {
      router.push(`/game/${gameId}?spectate=true`)
    } catch (error) {
      console.error('Failed to spectate game:', error)
    }
  }

  const handleStartGame = async (lobbyId: string) => {
    try {
      await socketClient.initiateGame(lobbyId);
      // Navigation will be handled by the game_created event
    } catch (error) {
      console.error('Failed to start game:', error);
    }
  };

  if (!userId) {
    router.push('/play');
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4">Loading lobbies...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500">Error: {error}</p>
          <button 
            onClick={refresh}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with connection status and logout */}
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-bold">Game Lobby</h1>
            <span className={`inline-block w-3 h-3 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`} />
          </div>
          <button
            onClick={() => signOut()}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Log Out
          </button>
        </div>

        {/* Create Game Form */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Create Game</h2>
          <div className="flex flex-wrap gap-6">
            <div className="flex-1 min-w-[200px]">
              <label className="block mb-2">Time Control</label>
              <select
                value={timeControl}
                onChange={(e) => setTimeControl(e.target.value)}
                className="w-full bg-gray-700 rounded p-2"
              >
                <option value="1+0">1 min</option>
                <option value="3+0">3 min</option>
                <option value="5+0">5 min</option>
                <option value="10+0">10 min</option>
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block mb-2">Mode</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full bg-gray-700 rounded p-2"
              >
                <option value="standard">Standard</option>
                <option value="chaos">Chaos</option>
              </select>
            </div>
          </div>
          <motion.button
            onClick={handleCreateLobby}
            className={`mt-6 w-full py-3 rounded-lg font-semibold ${
              isCreatingLobby 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
            whileHover={{ scale: isCreatingLobby ? 1 : 1.02 }}
            whileTap={{ scale: isCreatingLobby ? 1 : 0.98 }}
            disabled={isCreatingLobby}
          >
            {isCreatingLobby ? 'Creating...' : 'Create Game'}
          </motion.button>
        </div>

        {/* Active Lobbies */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">All Games</h2>
            <button
              onClick={refresh}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
            >
              Refresh
            </button>
          </div>
          {lobbies.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No games available</p>
          ) : (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              {lobbies.map((lobby) => (
                <div
                  key={lobby.id}
                  className={`bg-gray-800 rounded-lg p-4 flex justify-between items-center ${
                    isOwnLobby(lobby) ? 'border-2 border-blue-500' : ''
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{lobby.mode} - {lobby.timeControl}</p>
                      <span 
                        className={`inline-block w-2 h-2 rounded-full ${
                          lobby.status === 'waiting' 
                            ? 'bg-green-500' 
                            : lobby.status === 'active'
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                      />
                      {isOwnLobby(lobby) && (
                        <span className="text-xs text-blue-400 font-medium">
                          Your Lobby
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400">Host: {lobby.hostName || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">
                      {lobby.status === 'waiting' 
                        ? `Expires in ${formatTimeLeft(lobby.expiresAt)}`
                        : `Game in progress`
                      }
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {lobby.status === 'active' && lobby.gameId && (
                      <button
                        onClick={() => handleSpectateGame(lobby.gameId!)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
                      >
                        Spectate
                      </button>
                    )}
                    {lobby.status === 'waiting' && !isOwnLobby(lobby) && (
                      <button
                        onClick={() => handleJoinLobby(lobby.id)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
                      >
                        Join
                      </button>
                    )}
                    {isOwnLobby(lobby) && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => router.push(`/game/${lobby.id}?wait=true`)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
                        >
                          Wait
                        </button>
                        <button
                          onClick={() => terminateLobby(lobby.id)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
                        >
                          Terminate
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function formatTimeLeft(expiresAt: string) {
  const timeLeft = new Date(expiresAt).getTime() - Date.now();
  const minutes = Math.floor(timeLeft / 60000);
  return `${minutes}m`;
} 