"use client"

import { useEffect, useState, useRef } from 'react'
import { Chess } from 'chess.js'
import { fetchNewsForPlayers, generateEffectsFromNews, type NewsEffect } from '@/lib/newsApi'
import { NewsChessEngine } from '@/lib/newsChessEngine'
import { Chessboard } from 'react-chessboard'
import { Square } from 'chess.js'
import { ChessAI } from '@/lib/chessAI'
import { NewsDrawer } from './NewsDrawer'

interface NewsChessGameProps {
  player1: string
  player2: string
  onNoNews?: () => void
}

function ChaosIndicator({ progress }: { progress: number }) {
  return (
    <div className="relative w-full h-2 bg-gray-700 rounded overflow-hidden">
      <div 
        className="absolute top-0 left-0 h-full bg-red-500 transition-all duration-100"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

export default function NewsChessGame({ player1, player2, onNoNews }: NewsChessGameProps) {
  const [game, setGame] = useState(new Chess())
  const [newsEffects, setNewsEffects] = useState<NewsEffect[]>([])
  const [loading, setLoading] = useState(true)
  const [engine, setEngine] = useState<NewsChessEngine | null>(null)
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null)
  const [chaosProgress, setChaosProgress] = useState(100)
  const [currentEffect, setCurrentEffect] = useState<NewsEffect | null>(null)
  const progressInterval = useRef<NodeJS.Timeout | null>(null)
  const ai = useRef(new ChessAI(3))
  const [selectedNews, setSelectedNews] = useState<any>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [gameStatus, setGameStatus] = useState<'playing' | 'checkmate' | 'missing_king' | 'stalemate'>('playing')

  useEffect(() => {
    // Start progress countdown
    if (progressInterval.current) {
      clearInterval(progressInterval.current)
    }

    progressInterval.current = setInterval(() => {
      setChaosProgress(prev => {
        if (prev <= 0) return 100
        return prev - 1
      })
    }, 100) // Update every 100ms for smooth animation

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current)
      }
    }
  }, [])

  useEffect(() => {
    async function loadNewsEffects() {
      const news = await fetchNewsForPlayers(player1, player2)
      console.log(news)
      
      if (!news.length) {
        onNoNews?.()
        return
      }

      const initialNews = news.slice(0, 5)
      const remainingNews = news.slice(5)
      const effects = await generateEffectsFromNews(initialNews)
      
      setNewsEffects(effects)
      
      const newEngine = new NewsChessEngine(
        effects,
        remainingNews,
        (updatedGame) => {
          setGame(new Chess(updatedGame.fen()))
          updateGameStatus(updatedGame)
        },
        (effect) => {
          setCurrentEffect(effect)
          setChaosProgress(100)
        }
      )
      setEngine(newEngine)
      newEngine.start()
      setLoading(false)
    }

    loadNewsEffects()
    
    return () => {
      engine?.stop()
      if (progressInterval.current) {
        clearInterval(progressInterval.current)
      }
    }
  }, [player1, player2, onNoNews])

  function handleMove(from: string, to: string) {
    if (!engine) return
    
    try {
      const newGame = new Chess(game.fen())
      newGame.move({ from, to })
      setGame(newGame)
      engine.onMove(newGame)
    } catch (e) {
      // Invalid move
    }
  }

  function handleSquareClick(square: Square) {
    if (selectedSquare) {
      handleMove(selectedSquare, square)
      setSelectedSquare(null)
    } else {
      const piece = game.get(square)
      if (piece && piece.color === game.turn()) {
        setSelectedSquare(square)
      }
    }
  }

  function checkForMissingKings(game: Chess): boolean {
    let whiteKing = false
    let blackKing = false

    // Check all squares for kings
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const square = String.fromCharCode(97 + i) + (j + 1) as Square
        const piece = game.get(square)
        if (piece?.type === 'k') {
          if (piece.color === 'w') whiteKing = true
          if (piece.color === 'b') blackKing = true
        }
      }
    }

    return !whiteKing || !blackKing
  }

  function updateGameStatus(game: Chess) {
    if (checkForMissingKings(game)) {
      setGameStatus('missing_king')
      return
    }

    if (game.isCheckmate()) {
      setGameStatus('checkmate')
      return
    }

    if (game.isStalemate()) {
      setGameStatus('stalemate')
      return
    }

    setGameStatus('playing')
  }

  function makeMove(move: { from: string; to: string; promotion?: string }) {
    if (!engine || gameStatus !== 'playing') return false
    
    try {
      const newGame = new Chess(game.fen())
      newGame.move(move)
      setGame(newGame)
      engine.onMove(newGame)
      updateGameStatus(newGame)

      // AI move after delay
      setTimeout(() => {
        if (newGame.turn() === 'b' && !newGame.isGameOver()) {
          const aiMove = ai.current.getBestMove(newGame)
          const finalGame = new Chess(newGame.fen())
          finalGame.move(aiMove)
          setGame(finalGame)
          engine.onMove(finalGame)
          updateGameStatus(finalGame)
        }
      }, 500)

      return true
    } catch (e) {
      return false
    }
  }

  function GameOverOverlay() {
    if (gameStatus === 'playing') return null

    let message = ''
    switch (gameStatus) {
      case 'checkmate':
        message = `Checkmate! ${game.turn() === 'w' ? 'Black' : 'White'} wins!`
        break
      case 'missing_king':
        message = 'Game Over! A king has vanished!'
        break
      case 'stalemate':
        message = 'Stalemate! The game is a draw.'
        break
    }

    return (
      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
        <div className="bg-gray-800 p-6 rounded-lg text-center">
          <h2 className="text-2xl font-bold mb-4">{message}</h2>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Play Again
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4 mx-auto"></div>
          <p>Analyzing news between {player1} and {player2}...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <div className="aspect-square relative">
              <Chessboard 
                position={game.fen()}
                onPieceDrop={(source, target) => {
                  if (game.turn() === 'w' && gameStatus === 'playing') {
                    return makeMove({
                      from: source,
                      to: target,
                      promotion: 'q'
                    })
                  }
                  return false
                }}
                customDarkSquareStyle={{ 
                  backgroundColor: '#B58863'
                }}
                customLightSquareStyle={{ 
                  backgroundColor: '#F0D9B5'
                }}
                boardStyle={{
                  borderRadius: '8px',
                  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.2)',
                  border: '2px solid #8B4513',
                  background: 'linear-gradient(45deg, #8B4513, #A0522D)',
                  padding: '10px',
                  width: '100%', // Make board responsive
                  maxWidth: '600px', // Limit maximum size
                  margin: '0 auto' // Center the board
                }}
              />
              <GameOverOverlay />
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-400">
                <p>Next chaos effect in:</p>
                <p>{Math.ceil(chaosProgress / 10)}s</p>
              </div>
              <ChaosIndicator progress={chaosProgress} />
              {currentEffect && (
                <div className="text-sm font-medium text-red-400">
                  Current effect: {currentEffect.type.replace('_', ' ').toUpperCase()}
                </div>
              )}
              <p className="text-sm text-gray-400">
                Turn: {game.turn() === 'w' ? 'White' : 'Black'}
              </p>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4">News Effects</h2>
            <div className="space-y-4">
              {currentEffect && (
                <div className="bg-red-500/20 border border-red-500 p-4 rounded animate-pulse">
                  <div className="font-medium mb-2">ACTIVE EFFECT</div>
                  <p className="text-sm">{currentEffect.description}</p>
                </div>
              )}
              {newsEffects.map((effect, i) => (
                <div 
                  key={i}
                  onClick={() => {
                    setSelectedNews(newsEffects[i])
                    setIsDrawerOpen(true)
                  }}
                  className={`
                    bg-gray-800 p-4 rounded transition-all duration-200 cursor-pointer
                    hover:bg-gray-700
                    ${currentEffect === effect ? 'border border-red-500' : ''}
                  `}
                >
                  <div className="font-medium mb-2">{effect.type.replace('_', ' ').toUpperCase()}</div>
                  <p className="text-gray-300 text-sm">{effect.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedNews && (
        <NewsDrawer
          news={selectedNews}
          isOpen={isDrawerOpen}
          onClose={() => {
            setIsDrawerOpen(false)
            setSelectedNews(null)
          }}
        />
      )}
    </div>
  )
} 