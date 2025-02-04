'use client'

import { SignIn } from "@clerk/nextjs"
import { motion } from 'framer-motion'

export function StyledSignIn() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="backdrop-blur-lg bg-white/10 p-8 rounded-xl"
    >
      <SignIn 
        appearance={{
          elements: {
            rootBox: "w-full",
            card: "bg-transparent shadow-none",
            headerTitle: "text-white",
            headerSubtitle: "text-gray-300",
            formButtonPrimary: "bg-purple-600 hover:bg-purple-700",
            formFieldInput: "bg-gray-800 border-gray-700 text-white",
            formFieldLabel: "text-gray-300",
            footerAction: "text-gray-300",
            footerActionLink: "text-purple-400 hover:text-purple-300",
          },
        }}
        afterSignInUrl="/lobby"
        redirectUrl="/lobby"
      />
    </motion.div>
  )
} 