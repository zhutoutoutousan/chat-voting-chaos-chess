"use client"

import { UserButton, SignInButton, useUser } from "@clerk/nextjs"
import { Button } from "./ui/button"
import Link from "next/link"

export default function Navbar() {
  const { isSignedIn } = useUser()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-white">
            ♟️ Chess
          </Link>

          {/* Navigation */}
          <div className="hidden md:flex md:gap-x-6">
            <Link href="/play" className="text-gray-300 hover:text-white">
              Play
            </Link>
            <Link href="/learn" className="text-gray-300 hover:text-white">
              Learn
            </Link>
            <Link href="/community" className="text-gray-300 hover:text-white">
              Community
            </Link>
          </div>

          {/* Auth */}
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
        </div>
      </div>

      {/* Glassmorphism effect */}
      <div className="absolute inset-0 -z-10 bg-black/20 backdrop-blur-sm" />
    </nav>
  )
} 