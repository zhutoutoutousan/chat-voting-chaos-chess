"use client"

import { UserButton, SignInButton, useUser } from "@clerk/nextjs"
import { Button } from "./ui/button"
import { FloatingDock } from "./ui/floating-dock"
import { Home, Swords, BookOpen, Users } from "lucide-react"

export default function Dock() {
  const { isSignedIn } = useUser()

  const items = [
    {
      title: "Home",
      href: "/",
      icon: <Home className="h-4 w-4" />,
    },
    {
      title: "Play",
      href: "/play",
      icon: <Swords className="h-4 w-4" />,
    },
    {
      title: "Learn",
      href: "/learn",
      icon: <BookOpen className="h-4 w-4" />,
    },
    {
      title: "Community",
      href: "/community",
      icon: <Users className="h-4 w-4" />,
    },
  ]

  return (
    <div className="fixed bottom-4 left-0 right-0 flex justify-center">
      <FloatingDock
        items={items}
        desktopClassName="border border-black/[0.2] dark:border-white/[0.2] bg-black/[0.8]"
        mobileClassName="border border-black/[0.2] dark:border-white/[0.2] bg-black/[0.8]"
      />
    </div>
  )
} 