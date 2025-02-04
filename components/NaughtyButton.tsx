'use client'

import { motion } from 'framer-motion'
import { useNaughtyButton } from '@/hooks/useNaughtyButton'

interface NaughtyButtonProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

export function NaughtyButton({ 
  children, 
  onClick, 
  className = "" 
}: NaughtyButtonProps) {
  const { isHovered, setIsHovered, controls } = useNaughtyButton()

  return (
    <motion.button
      animate={controls}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className={`px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700
        transition-colors duration-200 font-medium ${className}`}
    >
      {children}
    </motion.button>
  )
} 