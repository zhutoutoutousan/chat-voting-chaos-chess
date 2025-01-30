"use client"

import { useEffect, useState, useCallback } from 'react'
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import { Progress } from "@/components/ui/progress"
import type { Square, PieceSymbol, Color } from 'chess.js'
import WorldChessBoard from './WorldChessBoard'

const CHAOS_INTERVAL = 10000 // 10 seconds
const RESET_DELAY = 3000 // 3 seconds delay before reset

type Company = {
  name: string;
  marketCap: number;
  sector: string;
}

type EconomicEvent = {
  name: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  execute: (game: Chess) => void;
}

// Sample companies data (we'd fetch this from an API)
const companies: Record<string, Company> = {
  'q': { name: 'Apple', marketCap: 3000, sector: 'Technology' },
  'k': { name: 'Microsoft', marketCap: 2800, sector: 'Technology' },
  'r': { name: 'Amazon', marketCap: 1600, sector: 'E-commerce' },
  'b': { name: 'Google', marketCap: 1800, sector: 'Technology' },
  'n': { name: 'Meta', marketCap: 1000, sector: 'Social Media' },
  'p': { name: 'Tesla', marketCap: 800, sector: 'Automotive' },
}

const economicEvents: EconomicEvent[] = [
  {
    name: "Market Crash",
    description: "A sudden market downturn affects multiple sectors",
    impact: 'negative',
    execute: (game) => {
      const board = game.board()
      const pieces = board.flat().filter(p => p && p.type !== 'k')
      const removePieces = pieces.slice(0, 2) // Remove up to 2 pieces
      removePieces.forEach(piece => {
        if (piece) game.remove(piece.square)
      })
    }
  },
  {
    name: "Merger & Acquisition",
    description: "Companies join forces to increase market share",
    impact: 'positive',
    execute: (game) => {
      const board = game.board()
      const pieces = board.flat().filter(p => p && p.type !== 'k' && p.type !== 'q')
      if (pieces.length > 0) {
        const piece = pieces[Math.floor(Math.random() * pieces.length)]
        if (piece) {
          game.remove(piece.square)
          game.put({ type: 'q' as PieceSymbol, color: piece.color }, piece.square)
        }
      }
    }
  },
  {
    name: "Tech Bubble",
    description: "Tech sector experiences rapid growth",
    impact: 'positive',
    execute: (game) => {
      const board = game.board()
      const pawns = board.flat().filter(p => p && p.type === 'p')
      if (pawns.length > 0) {
        const pawn = pawns[Math.floor(Math.random() * pawns.length)]
        if (pawn) {
          game.remove(pawn.square)
          game.put({ type: 'b' as PieceSymbol, color: pawn.color }, pawn.square)
        }
      }
    }
  },
  {
    name: "Market Disruption",
    description: "New technology disrupts traditional business models",
    impact: 'neutral',
    execute: (game) => {
      const board = game.board()
      const pieces = board.flat().filter(p => p && p.type !== 'k')
      if (pieces.length > 0) {
        const piece1 = pieces[Math.floor(Math.random() * pieces.length)]
        const piece2 = pieces[Math.floor(Math.random() * pieces.length)]
        if (piece1 && piece2) {
          game.remove(piece1.square)
          game.remove(piece2.square)
          game.put({ type: piece2.type, color: piece2.color }, piece1.square)
          game.put({ type: piece1.type, color: piece1.color }, piece2.square)
        }
      }
    }
  },
  {
    name: "Startup Unicorn",
    description: "A startup achieves rapid growth and market dominance",
    impact: 'positive',
    execute: (game) => {
      const board = game.board()
      const pawns = board.flat().filter(p => p && p.type === 'p')
      if (pawns.length > 0) {
        const pawn = pawns[Math.floor(Math.random() * pawns.length)]
        if (pawn) {
          game.remove(pawn.square)
          game.put({ type: 'n' as PieceSymbol, color: pawn.color }, pawn.square)
        }
      }
    }
  }
]

export default function WorldChessGame() {
  const [game, setGame] = useState(new Chess())
  const [lastEvent, setLastEvent] = useState<EconomicEvent | null>(null)
  const [winner, setWinner] = useState<'white' | 'black' | null>(null)
  const [progress, setProgress] = useState(100)

  function checkWinCondition(game: Chess) {
    const board = game.board()
    const whiteKing = board.flat().find(p => p && p.type === 'k' && p.color === 'w')
    const blackKing = board.flat().find(p => p && p.type === 'k' && p.color === 'b')

    if (!whiteKing) {
      setWinner('black')
      setTimeout(resetGame, RESET_DELAY)
      return true
    }
    if (!blackKing) {
      setWinner('white')
      setTimeout(resetGame, RESET_DELAY)
      return true
    }

    if (game.isCheckmate()) {
      setWinner(game.turn() === 'w' ? 'black' : 'white')
      setTimeout(resetGame, RESET_DELAY)
      return true
    }

    return false
  }

  function resetGame() {
    setGame(new Chess())
    setWinner(null)
    setLastEvent(null)
  }

  useEffect(() => {
    let interval: NodeJS.Timeout
    let progressInterval: NodeJS.Timeout
    
    if (!winner) {
      interval = setInterval(() => {
        const event = economicEvents[Math.floor(Math.random() * economicEvents.length)]
        const gameCopy = new Chess(game.fen())
        event.execute(gameCopy)
        setLastEvent(event)
        setGame(gameCopy)
        setProgress(100)
        
        if (checkWinCondition(gameCopy)) {
          clearInterval(interval)
          clearInterval(progressInterval)
        }
      }, CHAOS_INTERVAL)

      progressInterval = setInterval(() => {
        setProgress((prev) => Math.max(0, prev - (100 / (CHAOS_INTERVAL / 100))))
      }, 100)
    }

    return () => {
      clearInterval(interval)
      clearInterval(progressInterval)
    }
  }, [game, winner])

  return (
    <div className="w-full max-w-[1200px] mx-auto">
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
        {/* Main Game Area */}
        <div className="flex-1 bg-white/5 backdrop-blur-md rounded-lg p-2 lg:p-4">
          <div className="text-center mb-2 lg:mb-4">
            <p className="text-base lg:text-lg font-semibold text-white">
              {game.turn() === 'w' ? 'Bull Market' : 'Bear Market'}
            </p>
          </div>

          <div className="relative z-50">
            <div className="rounded-lg overflow-hidden shadow-xl border-2 border-[#2d3748] bg-gradient-to-br from-[#1a365d] to-[#2a4365] p-2.5">
              <WorldChessBoard 
                game={game}
                onSquareClick={(square) => {
                  // Handle square clicks if needed
                }}
              />
            </div>
          </div>

          {/* Market Status */}
          {winner ? (
            <div className="mt-2 lg:mt-4 text-center bg-black/50 rounded-lg p-2 lg:p-4">
              <h3 className="text-2xl lg:text-3xl font-bold text-white animate-bounce">
                {winner === 'white' ? 'Bulls' : 'Bears'} Win the Market!
              </h3>
            </div>
          ) : (
            <div className="mt-2 lg:mt-4 space-y-2">
              <Progress value={progress} className="h-2" />
              {lastEvent && (
                <div className={`text-center rounded-lg p-2 lg:p-4 space-y-1 lg:space-y-2 ${
                  lastEvent.impact === 'positive' ? 'bg-green-900/50' :
                  lastEvent.impact === 'negative' ? 'bg-red-900/50' :
                  'bg-blue-900/50'
                }`}>
                  <h3 className="text-lg lg:text-xl font-bold text-white">
                    {lastEvent.name}
                  </h3>
                  <p className="text-sm lg:text-base text-white/80">
                    {lastEvent.description}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Market Info Panel */}
        <div className="w-full lg:w-64 bg-white/10 backdrop-blur-sm rounded-lg p-2 lg:p-4">
          <h3 className="text-lg lg:text-xl font-bold text-white mb-2 lg:mb-4 text-center">
            Market Leaders
          </h3>
          <div className="space-y-2">
            {Object.entries(companies).map(([piece, company]) => (
              <div key={piece} className="bg-black/30 rounded-lg p-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">
                      {company.name[0]}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{company.name}</p>
                    <p className="text-xs text-white/60">
                      {company.sector} • ${(company.marketCap / 1000).toFixed(1)}T
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 