import { useState, useEffect } from 'react'
import { useAnimation } from 'framer-motion'

export function useNaughtyButton() {
  const [isHovered, setIsHovered] = useState(false)
  const controls = useAnimation()

  useEffect(() => {
    if (isHovered) {
      const randomMove = () => {
        controls.start({
          x: Math.random() * 200 - 100,
          y: Math.random() * 200 - 100,
          transition: { duration: 0.3 }
        })
      }

      randomMove()
      const interval = setInterval(randomMove, 300)
      return () => clearInterval(interval)
    } else {
      controls.start({ x: 0, y: 0, transition: { duration: 0.5 } })
    }
  }, [isHovered, controls])

  return {
    isHovered,
    setIsHovered,
    controls
  }
} 