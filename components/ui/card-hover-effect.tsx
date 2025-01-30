'use client'

import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import { useState } from "react"

export const HoverEffect = ({
  items,
  className,
}: {
  items: {
    title: string
    description: string
    icon: React.ReactNode
    link: string
  }[]
  className?: string
}) => {
  let [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 py-10 gap-4",
        className
      )}
    >
      {items.map((item, idx) => (
        <a
          href={item.link}
          key={idx}
          className="relative group block p-6 bg-white dark:bg-neutral-800 rounded-xl shadow-sm"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <div className="relative z-10">
            <div className="p-2 w-fit rounded-lg bg-amber-100 dark:bg-amber-800 mb-4">
              {item.icon}
            </div>
            <div className="font-bold text-xl mb-2 text-neutral-800 dark:text-neutral-100">
              {item.title}
            </div>
            <p className="text-sm text-neutral-700 dark:text-neutral-200">
              {item.description}
            </p>
          </div>
          
          <div
            className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-200 dark:from-amber-800/40 
            to-amber-100/50 dark:to-amber-700/20 opacity-0 group-hover:opacity-100 transform duration-200"
          />
        </a>
      ))}
    </div>
  )
} 