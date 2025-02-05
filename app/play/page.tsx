'use client'

import { useState, useEffect } from 'react'
import { useAuth, SignIn } from "@clerk/nextjs"
import { motion, useAnimation } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { IconLogout, IconChessKnight } from "@tabler/icons-react"

const NaughtyButton = ({ children, ...props }) => {
  const [isHovered, setIsHovered] = useState(false)
  const controls = useAnimation()

  useEffect(() => {
    if (isHovered) {
      controls.start({
        x: Math.random() * 200 - 100,
        y: Math.random() * 200 - 100,
        transition: { duration: 0.3 }
      })
    } else {
      controls.start({ x: 0, y: 0, transition: { duration: 0.5 } })
    }
  }, [isHovered, controls])

  return (
    <motion.button
      animate={controls}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700
        transition-colors duration-200 font-medium"
      {...props}
    >
      {children}
    </motion.button>
  )
}

export default function PlayPage() {
  const { userId, signOut } = useAuth()
  const router = useRouter()
  const [showSignIn, setShowSignIn] = useState(false)

  const handleStartGame = () => {
    if (!userId) {
      setShowSignIn(true)
      return
    }
    router.push('/lobby')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-8">Start Playing</h1>
        
        {/* Add glitchy warning message */}
        <div className="mb-8 relative overflow-hidden">
          <div className="animate-glitch-1 absolute inset-0 text-red-500 opacity-80">
            ⚠️ Under Construction: You may run into bugs jajajajaja
          </div>
          <div className="animate-glitch-2 absolute inset-0 text-blue-500 opacity-80">
            ⚠️ Under Construction: You may run into bugs jajajajaja
          </div>
          <div className="animate-glitch-3 text-yellow-300">
            ⚠️ Under Construction: You may run into bugs jajajajaja
          </div>
        </div>

        {/* Header with logout */}
        {userId && (
          <div className="absolute top-4 right-4">
            <motion.button
              onClick={() => signOut()}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 
                rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <IconLogout size={20} />
              Log Out
            </motion.button>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto text-center"
        >
          <motion.div
            className="mb-8 inline-block"
            animate={{
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <IconChessKnight size={80} className="text-purple-500" />
          </motion.div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r 
            from-purple-400 to-pink-600 text-transparent bg-clip-text">
            Ready to Play?
          </h1>
          
          <p className="text-xl text-gray-300 mb-12">
            Challenge players from around the world in this unique chess experience
          </p>

          {!showSignIn ? (
            <div className="space-y-4">
              <NaughtyButton onClick={handleStartGame}>
                Start Playing
              </NaughtyButton>
              
              {!userId && (
                <p className="text-sm text-gray-400">
                  You'll need to sign in to play
                </p>
              )}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="backdrop-blur-lg bg-white/10 p-8 rounded-xl"
            >
              <SignIn 
                afterSignInUrl="/lobby"
                redirectUrl="/lobby"
              />
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
} 