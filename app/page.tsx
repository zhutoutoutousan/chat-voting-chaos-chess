import { Button } from "@/components/ui/button"
import { auth } from "@clerk/nextjs/server"
import ChessGame from "@/components/ChessGame"

export default async function Home() {
  const { userId } = await auth()

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 animate-gradient bg-[linear-gradient(-45deg,#ee7752,#e73c7e,#23a6d5,#23d5ab)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0),rgba(0,0,0,0.6))]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(0,0,0,0),rgba(0,0,0,0.6))]" />
      </div>

      {/* Hero and Game Container */}
      <div className="relative flex min-h-screen items-center justify-center px-4">
        <div className="container mx-auto flex flex-col lg:flex-row items-center gap-12">
          {/* Hero Text */}
          <div className="lg:w-5/12 text-center lg:text-left">
            <h1 className="text-6xl font-bold text-white mb-4">
              Chaos Chess
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Experience chess like never before. Challenge friends, improve your skills, and join our growing community of players.
            </p>
          </div>

          {/* Chess Game */}
          <div className="lg:w-7/12">
            <ChessGame />
          </div>
        </div>
      </div>
    </main>
  )
}

