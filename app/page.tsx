import { Button } from "@/components/ui/button"
import { auth } from "@clerk/nextjs/server"
import ChessGame from "@/components/ChessGame"

export default async function Home() {
  const { userId } = await auth()

  return (
    <main className="min-h-screen relative overflow-y-auto overflow-x-hidden scroll-container">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 animate-gradient bg-[linear-gradient(-45deg,#ee7752,#e73c7e,#23a6d5,#23d5ab)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0),rgba(0,0,0,0.6))]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(0,0,0,0),rgba(0,0,0,0.6))]" />
      </div>

      {/* Hero and Game Container */}
      <div className="relative flex min-h-screen items-start sm:items-center justify-center px-4 pt-20 sm:pt-0">
        <div className="container mx-auto flex flex-col lg:flex-row items-center gap-6 sm:gap-8 lg:gap-12">
          {/* Hero Text */}
          <div className="w-full lg:w-5/12 text-center lg:text-left mt-0 sm:mt-8 lg:mt-0">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4">
              Chaos Chess
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 mb-6 sm:mb-8 max-w-xl mx-auto lg:mx-0">
              Experience chess like never before. Challenge friends, improve your skills, and join our growing community of players.
            </p>
          </div>

          {/* Chess Game */}
          <div className="w-full lg:w-7/12">
            <ChessGame />
          </div>
        </div>
      </div>
    </main>
  )
}

