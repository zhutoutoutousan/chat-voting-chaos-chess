'use client'

import { motion, useAnimation } from 'framer-motion'
import { useState, useEffect, useMemo, memo } from 'react'

interface ChaosTextProps {
  text: string
  className?: string
}

const chaosFonts = [
  'font-serif',
  'font-mono',
  'font-sans',
  'font-bold',
  'italic',
  'tracking-wider',
  'tracking-tight',
  'font-extrabold',
  'uppercase',
  'lowercase',
  'font-light',
  'tracking-widest',
  'font-medium',
  'small-caps',
  'antialiased'
] as const

const rainbowColors = [
  '#FF0000', // Red
  '#FF7F00', // Orange
  '#FFFF00', // Yellow
  '#00FF00', // Green
  '#0000FF', // Blue
  '#4B0082', // Indigo
  '#8F00FF'  // Violet
] as const

const ChaosLetter = memo(({ char, fontClass, colorIndex }: {
  char: string
  fontClass: string
  colorIndex: number
}) => {
  const colors = useMemo(() => [
    '#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#8F00FF'
  ], [])

  return (
    <motion.span
      className={`inline-block ${fontClass}`}
      style={{ 
        textShadow: '0 0 10px rgba(0,0,0,0.3)',
      }}
      animate={{
        color: colors,
        textShadow: colors.map(color => `0 0 20px ${color}40`),
      }}
      transition={{
        color: {
          duration: 5 + colorIndex,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        },
        textShadow: {
          duration: 5 + colorIndex,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }
      }}
    >
      {char}
    </motion.span>
  )
})

ChaosLetter.displayName = 'ChaosLetter'

export const ChaosText = memo(({ text, className = '' }: ChaosTextProps) => {
  const [fontIndices, setFontIndices] = useState(() => 
    Array(text.length).fill(0).map(() => Math.floor(Math.random() * chaosFonts.length))
  )
  const controls = useAnimation()

  useEffect(() => {
    const interval = setInterval(() => {
      setFontIndices(prev => 
        prev.map(() => Math.floor(Math.random() * chaosFonts.length))
      )
    }, 5000) // Change fonts every 5 seconds for all letters at once

    return () => clearInterval(interval)
  }, [text.length])

  const letters = useMemo(() => 
    text.split('').map((char, i) => ({
      char,
      fontClass: chaosFonts[fontIndices[i]],
      colorIndex: i % 7
    })),
    [text, fontIndices]
  )

  return (
    <div className={`relative inline-block ${className}`}>
      <div className="relative z-20">
        {letters.map((letter, i) => (
          <ChaosLetter key={i} {...letter} />
        ))}
      </div>
      
      <motion.div
        className="absolute inset-0 -z-10 blur-2xl mix-blend-overlay opacity-50"
        animate={controls}
        transition={{
          duration: 5,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
      />
    </div>
  )
})

ChaosText.displayName = 'ChaosText' 