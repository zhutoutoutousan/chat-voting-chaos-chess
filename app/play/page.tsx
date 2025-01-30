'use client'

import { SignInButton, SignUpButton, useUser } from "@clerk/nextjs"
import { Spotlight } from "@/components/ui/spotlight"
import { useState } from "react"
import { IconChessKing, IconPlus, IconUser } from "@tabler/icons-react"
import { ConstructionNotice } from "@/components/ui/construction-notice"

// Mock data for lobbies
const MOCK_LOBBIES = [
  {
    id: "1",
    host: "GrandMaster123",
    timeControl: "5+3",
    rating: 1800,
    mode: "Rated",
  },
  {
    id: "2",
    host: "ChessWizard",
    timeControl: "3+2",
    rating: 2100,
    mode: "Casual",
  },
  {
    id: "3",
    host: "KnightRider",
    timeControl: "10+5",
    rating: 1650,
    mode: "Rated",
  },
]

export default function PlayPage() {
  const { isSignedIn, user } = useUser()
  const [showCreateLobby, setShowCreateLobby] = useState(false)

  if (!isSignedIn) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <IconChessKing className="w-16 h-16 mx-auto mb-6 text-amber-500" />
          <h1 className="text-3xl font-bold mb-4 text-white dark:text-neutral-100">
            Ready to Play?
          </h1>
          <p className="text-neutral-200 dark:text-neutral-300 mb-8">
            Sign in to track your progress, join rated games, and compete in tournaments
          </p>
          <div className="space-y-4">
            <SignInButton mode="modal">
              <button className="w-full px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-medium transition-colors">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="w-full px-4 py-2 rounded-lg bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-800 dark:text-neutral-100 font-medium transition-colors">
                Create Account
              </button>
            </SignUpButton>
            <button 
              className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-800 dark:hover:bg-neutral-800 text-neutral-200 dark:text-neutral-200 font-medium transition-colors"
              onClick={() => {/* Handle guest play */}}
            >
              Play as Guest
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white dark:text-neutral-100">
          Chess Lobbies
        </h1>
        <button
          onClick={() => setShowCreateLobby(true)}
          className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-medium transition-colors flex items-center gap-2"
        >
          <IconPlus className="w-5 h-5" />
          Create Lobby
        </button>
      </div>

      <div className="grid gap-4 mb-16">
        {MOCK_LOBBIES.map((lobby) => (
          <Spotlight key={lobby.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                  <IconUser className="w-6 h-6 text-amber-700 dark:text-amber-300" />
                </div>
                <div>
                  <h3 className="font-medium text-neutral-800 dark:text-neutral-100">
                    {lobby.host}
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-300">
                    {lobby.timeControl} • {lobby.mode} • {lobby.rating} Rating
                  </p>
                </div>
              </div>
              <button className="px-4 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-800 dark:text-neutral-100 font-medium transition-colors">
                Join Game
              </button>
            </div>
          </Spotlight>
        ))}
      </div>

      <ConstructionNotice />

      {showCreateLobby && (
        <CreateLobbyModal onClose={() => setShowCreateLobby(false)} />
      )}
    </div>
  )
}

function CreateLobbyModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-neutral-800 dark:text-neutral-100">
          Create Lobby
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">
              Time Control
            </label>
            <select className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100">
              <option>5+3</option>
              <option>3+2</option>
              <option>10+5</option>
              <option>15+10</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">
              Game Mode
            </label>
            <select className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100">
              <option>Rated</option>
              <option>Casual</option>
            </select>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 font-medium transition-colors"
            >
              Cancel
            </button>
            <button className="flex-1 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-medium transition-colors">
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 