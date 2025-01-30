"use client"

import { UserButton, SignInButton, useUser } from "@clerk/nextjs"
import { Button } from "./ui/button"
import Link from "next/link"
import { Home, BookOpen, ChessKnight } from 'lucide-react'

export default function Navbar() {
  const { isSignedIn } = useUser()

  return (
    <nav className="fixed bottom-0 left-0 right-0 p-4 flex justify-center bg-gray-900/80 backdrop-blur-lg border-t border-gray-800">
      <div className="flex gap-8">
        <NavLink href="/" icon={<Home />} label="Home" />
        <NavLink href="/newschess" icon={<ChessKnight />} label="News Chess" />
        <NavLink href="/learn" icon={<BookOpen />} label="Learn" />
      </div>
    </nav>
  )
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link 
      href={href} 
      className="group flex flex-col items-center transition-all duration-300"
    >
      <div className="p-3 rounded-xl bg-gray-800 group-hover:bg-gray-700 
        transition-all duration-300
        shadow-[0_0_15px_rgba(212,175,55,0)] group-hover:shadow-[0_0_15px_rgba(212,175,55,0.5)]
        border border-transparent group-hover:border-yellow-500/30"
      >
        <div className="w-6 h-6 text-gray-400 group-hover:text-yellow-400 transition-colors">
          {icon}
        </div>
      </div>
      <span className="mt-1 text-sm text-gray-400 group-hover:text-yellow-400 font-medium transition-colors">
        {label}
      </span>
    </Link>
  )
}

function AuthButtons() {
  const { isSignedIn } = useUser()

  return (
    <div className="flex items-center gap-4">
      {isSignedIn ? (
        <UserButton afterSignOutUrl="/" />
      ) : (
        <SignInButton mode="modal">
          <Button variant="secondary">
            Sign In
          </Button>
        </SignInButton>
      )}
    </div>
  )
} 