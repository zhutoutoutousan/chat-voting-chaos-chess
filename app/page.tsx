'use client'

import { Scene3DWrapper } from '@/components/Scene3DWrapper'
import { Suspense } from 'react'
import { useAuth } from "@clerk/nextjs"
import dynamic from 'next/dynamic'
import { IconNews, IconBolt, IconTrophy } from "@tabler/icons-react"
import ChessGame from '@/components/ChessGame'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { motion } from 'framer-motion'
import { useScroll, useTransform, useSpring } from 'framer-motion'
import { useRef, useState, useEffect, useMemo, memo } from 'react'
import { Typewriter } from 'react-simple-typewriter'
import { ChaoticFooter } from '@/components/ChaoticFooter'
import { ChaosText } from '@/components/ChaosText'

// Import motion components dynamically to avoid SSR issues
const MotionSection = dynamic(() => 
  import('@/components/ui/motion-components').then((mod) => mod.MotionSection)
)
const MotionDiv = dynamic(() => 
  import('@/components/ui/motion-components').then((mod) => mod.MotionDiv)
)

// Expand the chaotic fonts array
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
]

// Add rainbow colors array
const rainbowColors = [
  '#FF0000', // Red
  '#FF7F00', // Orange
  '#FFFF00', // Yellow
  '#00FF00', // Green
  '#0000FF', // Blue
  '#4B0082', // Indigo
  '#8F00FF'  // Violet
]

// Add these helper functions at the top
function getRandomChar() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  return chars[Math.floor(Math.random() * chars.length)]
}

// Optimize ShufflingText with memo
const ShufflingText = memo(({ text, className = '' }) => {
  const [displayText, setDisplayText] = useState(text)
  const [isShuffling, setIsShuffling] = useState(false)
  
  useEffect(() => {
    // Random interval between 5 and 15 seconds
    const intervalTime = Math.random() * 10000 + 5000
    
    const startShuffle = () => {
      if (isShuffling) return
      setIsShuffling(true)
      
      let iterations = 0
      const maxIterations = 20
      const shuffleInterval = setInterval(() => {
        setDisplayText(prev => 
          prev.split('').map((char, i) => 
            iterations > maxIterations - 10 && text[i] === char ? char : getRandomChar()
          ).join('')
        )
        
        iterations++
        if (iterations >= maxIterations) {
          clearInterval(shuffleInterval)
          setDisplayText(text)
          setIsShuffling(false)
        }
      }, 50)
    }

    const interval = setInterval(startShuffle, intervalTime)
    return () => clearInterval(interval)
  }, [text, isShuffling])

  return (
    <ChaosText text={displayText} className={className} />
  )
})

ShufflingText.displayName = 'ShufflingText'

// Optimize feature components with memo
const FeatureCard = memo(({ feature, index }: { feature: any, index: number }) => (
  <motion.div
    key={feature.title}
    className="backdrop-blur-lg bg-white/10 rounded-2xl p-6 border border-white/20"
    initial={{ 
      x: index % 2 === 0 ? -100 : 100,
      opacity: 0,
      rotateY: 45
    }}
    whileInView={{ 
      x: 0,
      opacity: 1,
      rotateY: 0
    }}
    viewport={{ once: true }}
    transition={{ 
      delay: index * 0.2,
      duration: 0.8,
      type: "spring"
    }}
  >
    <h3 className="text-2xl font-bold mb-4 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
      <ChaosText text={feature.title} />
    </h3>
    <p className="text-white/90 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">
      {feature.description}
    </p>
  </motion.div>
))

FeatureCard.displayName = 'FeatureCard'

export default function Home() {
  const { userId } = useAuth()
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 1.2])
  const opacity = useTransform(scrollYProgress, [0.8, 1], [1, 0])
  const y = useTransform(scrollYProgress, [0, 1], [0, -100])

  // Add state for viewport dimensions
  const [viewport, setViewport] = useState({ width: 1000, height: 800 })

  // Update viewport dimensions on client side
  useEffect(() => {
    setViewport({
      width: window.innerWidth,
      height: window.innerHeight
    })

    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Memoize floating elements
  const floatingElements = useMemo(() => 
    Array.from({ length: 20 }).map((_, i) => ({
      x: [Math.random() * viewport.width, Math.random() * viewport.width],
      y: [Math.random() * viewport.height, Math.random() * viewport.height],
      duration: Math.random() * 10 + 10
    })),
    [viewport.width, viewport.height]
  )

  return (
    <div 
      className="relative h-screen overflow-y-auto snap-y snap-mandatory"
      ref={containerRef}
    >
      {/* Background with 3D effects */}
      <div className="fixed inset-0 -z-10">
        <ErrorBoundary>
          <Scene3DWrapper />
        </ErrorBoundary>
      </div>

      {/* Content sections with snap points */}
      <div className="relative z-10">
        {/* Hero Section */}
        <MotionSection 
          className="h-screen snap-start flex items-center justify-center p-4 pt-16 md:pt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="container mx-auto grid md:grid-cols-2 gap-8 items-center">
            {/* Hero Text */}
            <div className="text-center md:text-left mt-16 md:mt-0">
              <MotionDiv 
                className="relative mb-6 inline-block group"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                {/* Glassomorphic card */}
                <motion.div
                  className="absolute inset-0 -m-4 rounded-2xl backdrop-blur-sm bg-white/10 border border-white/20"
                  animate={{
                    scale: [1, 1.02, 0.98, 1],
                    rotate: [0, 1, -1, 0],
                    x: [0, 4, -4, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                  }}
                />

                {/* Title container */}
                <div className="relative p-4">
                  <h1 className="text-6xl md:text-7xl font-bold relative">
                    <ShufflingText 
                      text="Chaos"
                      className="bg-clip-text text-gray-900 font-extrabold"
                    />
                    <span className="mx-2" />
                    <ShufflingText 
                      text="Chess"
                      className="bg-clip-text text-gray-900 font-extrabold"
                    />
                  </h1>
                  
                  {/* Add typewriter effect for subtitle */}
                  <div className="mt-4 text-2xl text-gray-800 font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                    <Typewriter
                      words={[
                        'Where Chaos Meets Strategy',
                        'Unpredictable. Unstoppable.',
                        'Redefining Chess',
                        'Are You Ready?'
                      ]}
                      loop={true}
                      cursor
                      cursorStyle='_'
                      typeSpeed={70}
                      deleteSpeed={50}
                      delaySpeed={2000}
                    />
                  </div>
                </div>

                {/* Interactive hover effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-purple-500/20 blur-xl" />
                </div>
              </MotionDiv>

              <MotionDiv 
                className="relative mb-8 backdrop-blur-sm bg-white/10 rounded-xl p-6 border border-white/20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <p className="text-xl md:text-2xl text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                  Experience chess like never before with real-time news effects and dynamic gameplay
                </p>
                {/* Subtle glow */}
                <div className="absolute inset-0 blur-md bg-blue-500/10 -z-10 rounded-xl" />
              </MotionDiv>

              <MotionDiv
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <a 
                  href="/play"
                  className="inline-block px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-xl font-medium
                    hover:from-blue-600 hover:to-purple-600 transition-all duration-300
                    shadow-[0_0_20px_rgba(59,130,246,0.5)]
                    hover:shadow-[0_0_30px_rgba(59,130,246,0.8)]"
                >
                  Start Playing
                </a>
              </MotionDiv>
            </div>

            {/* Chess Game */}
            <MotionDiv
              className="aspect-square w-full max-w-[800px] mx-auto backdrop-blur-sm bg-white/5 rounded-2xl p-4 border border-white/10 hidden md:block"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="relative">
                <ChessGame />
                {/* Glow effect */}
                <div className="absolute inset-0 blur-xl bg-blue-500/10 -z-10 rounded-2xl" />
              </div>
            </MotionDiv>
          </div>
        </MotionSection>

        {/* Gameplay Preview Section */}
        <MotionSection 
          className="h-screen snap-start flex items-center relative overflow-hidden"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <motion.div 
            className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent"
            style={{ scale, opacity }}
          />
          <div className="container mx-auto px-4">
            <motion.h2 
              className="text-5xl md:text-6xl font-bold text-center mb-12
                bg-gradient-to-r from-purple-900 to-red-900 text-transparent bg-clip-text
                drop-shadow-[0_0_15px_rgba(0,0,0,0.6)]"
              initial={{ y: 100, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, type: "spring" }}
            >
              <ChaosText text="Gameplay Like Never Before" />
            </motion.h2>
            <div className="grid md:grid-cols-3 gap-8">
              {gameplayFeatures.map((feature, index) => (
                <FeatureCard key={feature.title} feature={feature} index={index} />
              ))}
            </div>
          </div>
        </MotionSection>

        {/* Experience Section */}
        <MotionSection 
          className="h-screen snap-start flex items-center justify-center relative"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="absolute inset-0 backdrop-blur-sm bg-white/5"
            style={{ y }}
          />
          <div className="container mx-auto px-4">
            <motion.div
              className="max-w-4xl mx-auto text-center"
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="backdrop-blur-md bg-white/10 p-8 rounded-2xl border border-white/20">
                <ChaosText 
                  text="Experience the Chaos"
                  className="text-5xl md:text-6xl font-bold mb-8"
                />
                <ChaosText 
                  text="Every move counts in a game where the rules can change at any moment"
                  className="text-xl mb-12"
                />
              </div>
            </motion.div>
          </div>
        </MotionSection>

        {/* Ready for Chaos Section */}
        <MotionSection
          className="h-screen snap-start flex items-center justify-center relative"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="absolute inset-0 backdrop-blur-sm bg-black/30"
            style={{ opacity: useTransform(scrollYProgress, [0.8, 1], [0, 1]) }}
          />
          <div className="container mx-auto px-4 text-center">
            <motion.div
              className="backdrop-blur-md bg-white/10 p-8 rounded-2xl border border-white/20"
              initial={{ scale: 0.5, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, type: "spring" }}
            >
              <ChaosText 
                text="Ready for Chaos?"
                className="text-6xl md:text-7xl font-bold mb-8"
              />
              <ChaosText 
                text="Join thousands of players redefining the boundaries of chess"
                className="text-2xl mb-12"
              />
              <motion.a
                href="/play"
                className="inline-block px-12 py-6 bg-gradient-to-r from-red-500 to-purple-500 text-white rounded-xl text-2xl font-bold
                  shadow-[0_0_30px_rgba(239,68,68,0.5)]
                  hover:shadow-[0_0_50px_rgba(239,68,68,0.8)]
                  transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChaosText text="Play Now" />
              </motion.a>
            </motion.div>
          </div>
        </MotionSection>

        {/* Features Section */}
        <MotionSection 
          className="min-h-screen snap-start flex items-center relative"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="max-w-6xl mx-auto">
            <ChaosText 
              text="Features"
              className="text-4xl md:text-5xl font-bold text-center mb-16"
            />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <MotionDiv
                  key={feature.title}
                  className="backdrop-blur-sm bg-white/10 rounded-xl p-6 border border-white/20"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                >
                  <feature.icon className="w-12 h-12 text-red-400 mb-4" />
                  <ChaosText 
                    text={feature.title}
                    className="text-xl font-semibold mb-2"
                  />
                  <ChaosText 
                    text={feature.description}
                    className="text-sm"
                  />
                </MotionDiv>
              ))}
            </div>
          </div>
        </MotionSection>

        {/* Footer Section */}
        <MotionSection 
          className="h-screen snap-start flex items-center justify-center relative overflow-hidden"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="absolute inset-0 backdrop-blur-sm bg-black/30"
            style={{ opacity: useTransform(scrollYProgress, [0.8, 1], [0, 1]) }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <ChaoticFooter />
          </div>
        </MotionSection>
      </div>

      {/* Add scroll indicator */}
      <motion.div 
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
        animate={{
          y: [0, 10, 0],
          opacity: [1, 0.5, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="w-8 h-12 rounded-full border-2 border-white/50 flex items-center justify-center">
          <motion.div 
            className="w-2 h-2 bg-white rounded-full"
            animate={{
              y: [0, 16, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
      </motion.div>
    </div>
  )
}

const gameplayFeatures = [
  {
    title: "Real-time Events",
    description: "News headlines trigger special effects that transform the game board"
  },
  {
    title: "Adaptive Strategy",
    description: "React to changing conditions and evolve your gameplay"
  },
  {
    title: "Dynamic Rules",
    description: "Experience chess where the rules shift based on world events"
  }
]

const demoFeatures = [
  {
    title: "Global Rankings",
    description: "Compete with players worldwide and climb the chaos ladder",
    icon: IconTrophy
  },
  {
    title: "Live Effects",
    description: "Watch as news events create ripples across your game",
    icon: IconBolt
  }
]

const features = [
  {
    title: 'News-Driven Chaos',
    description: 'Real-time news events affect your game with unique chess effects',
    icon: IconNews
  },
  {
    title: 'Dynamic Gameplay',
    description: 'Experience chess with unpredictable twists and turns',
    icon: IconBolt
  },
  {
    title: 'Competitive Ranking',
    description: 'Climb the leaderboard and prove your adaptability',
    icon: IconTrophy
  }
]

