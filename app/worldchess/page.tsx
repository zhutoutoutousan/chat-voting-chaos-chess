import dynamic from 'next/dynamic'
import { IconTrophy, IconChartBar, IconUsers } from "@tabler/icons-react"
import { Spotlight } from "@/components/ui/spotlight"
import { ConstructionNotice } from "@/components/ui/construction-notice"

// Use dynamic import to avoid canvas SSR issues
const WorldChessGame = dynamic(() => import('@/components/WorldChessGame'), {
  ssr: false
})

const MOCK_TOURNAMENTS = [
  {
    id: 1,
    name: "World Chess Championship 2024",
    date: "Dec 2024",
    location: "Dubai, UAE",
    prize: "$2,000,000",
    status: "Upcoming"
  },
  {
    id: 2,
    name: "Candidates Tournament",
    date: "Apr 2024",
    location: "Toronto, Canada",
    prize: "$500,000",
    status: "Registration Open"
  },
  {
    id: 3,
    name: "Grand Swiss Tournament",
    date: "Oct 2024",
    location: "Isle of Man",
    prize: "$425,000",
    status: "Announced"
  }
]

const MOCK_RANKINGS = [
  { rank: 1, name: "Magnus Carlsen", rating: 2830, country: "NOR" },
  { rank: 2, name: "Fabiano Caruana", rating: 2804, country: "USA" },
  { rank: 3, name: "Ding Liren", rating: 2799, country: "CHN" },
]

export const metadata = {
  title: 'World Chess - Companies as Chess Pieces',
  description: 'Watch companies battle it out on a global chess board, with real economic events as chaos effects.',
}

export default function WorldChessPage() {
  return (
    <main className="min-h-screen relative overflow-y-auto overflow-x-hidden scroll-container">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 animate-gradient bg-[linear-gradient(-45deg,#1a2a6c,#b21f1f,#fdbb2d)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0),rgba(0,0,0,0.6))]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(0,0,0,0),rgba(0,0,0,0.6))]" />
      </div>

      <div className="relative container mx-auto px-4 py-20">
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
            World Chess
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto">
            Watch the world's biggest companies battle for market dominance in a global game of chess. Economic events create chaos effects that reshape the board.
          </p>
        </div>

        <div className="mb-24">
          <WorldChessGame />
        </div>

        {/* Major Tournaments */}
        <Spotlight className="p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <IconTrophy className="w-6 h-6 text-amber-500" />
            <h2 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-100">
              Major Tournaments
            </h2>
          </div>
          <div className="grid gap-4">
            {MOCK_TOURNAMENTS.map((tournament) => (
              <div 
                key={tournament.id}
                className="flex items-center justify-between p-4 rounded-lg bg-neutral-100 dark:bg-neutral-700"
              >
                <div>
                  <h3 className="font-medium text-neutral-800 dark:text-neutral-100">
                    {tournament.name}
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-300">
                    {tournament.date} • {tournament.location}
                  </p>
                  <p className="text-sm text-amber-600 dark:text-amber-400">
                    Prize Pool: {tournament.prize}
                  </p>
                </div>
                <div className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 text-sm">
                  {tournament.status}
                </div>
              </div>
            ))}
          </div>
        </Spotlight>

        {/* World Rankings */}
        <Spotlight className="p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <IconChartBar className="w-6 h-6 text-amber-500" />
            <h2 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-100">
              World Rankings
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-neutral-200 dark:border-neutral-700">
                  <th className="pb-3 text-neutral-600 dark:text-neutral-400 font-medium">Rank</th>
                  <th className="pb-3 text-neutral-600 dark:text-neutral-400 font-medium">Player</th>
                  <th className="pb-3 text-neutral-600 dark:text-neutral-400 font-medium">Rating</th>
                  <th className="pb-3 text-neutral-600 dark:text-neutral-400 font-medium">Country</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_RANKINGS.map((player) => (
                  <tr key={player.rank} className="border-b border-neutral-200 dark:border-neutral-700">
                    <td className="py-3 text-neutral-800 dark:text-neutral-200">#{player.rank}</td>
                    <td className="py-3 text-neutral-800 dark:text-neutral-200 font-medium">{player.name}</td>
                    <td className="py-3 text-amber-600 dark:text-amber-400">{player.rating}</td>
                    <td className="py-3 text-neutral-800 dark:text-neutral-200">{player.country}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Spotlight>

        {/* News Feed */}
        <Spotlight className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <IconUsers className="w-6 h-6 text-amber-500" />
            <h2 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-100">
              Latest News
            </h2>
          </div>
          <div className="space-y-4">
            {[
              "Magnus Carlsen wins Norway Chess 2024",
              "FIDE announces new tournament format for 2025",
              "Young prodigy breaks record in junior championship",
              "Chess.com partners with World Chess for online events",
            ].map((news, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-neutral-100 dark:bg-neutral-700">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <div className="text-neutral-700 dark:text-neutral-200">{news}</div>
              </div>
            ))}
          </div>
        </Spotlight>

        <ConstructionNotice />
      </div>
    </main>
  )
} 