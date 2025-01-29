"use client"

import { useEffect, useState, useCallback, useRef } from 'react'
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import { Progress } from "@/components/ui/progress"
import type { Square, PieceSymbol, Color } from 'chess.js'

const CHAOS_INTERVAL = 5000 // 5 seconds
const RESET_DELAY = 3000 // 3 seconds delay before reset after win

type ChaosEffect = {
  name: string;
  description: string;
  execute: (game: Chess) => void;
}

// Helper function to check if a pawn should be promoted
function shouldPromotePawn(square: Square, color: Color) {
  return (color === 'w' && square[1] === '8') || (color === 'b' && square[1] === '1')
}

const chaosEffects: ChaosEffect[] = [
  {
    name: "Random Piece Swap",
    description: "Two random pieces swap positions",
    execute: (game) => {
      const board = game.board()
      const pieces = board.flat().filter((p): p is { type: PieceSymbol; color: Color; square: Square } => 
        p !== null && p.type !== 'k'
      )
      
      // Try up to 10 times to find valid moves
      for (let attempt = 0; attempt < 10; attempt++) {
        const piece1 = pieces[Math.floor(Math.random() * pieces.length)]
        const piece2 = pieces[Math.floor(Math.random() * pieces.length)]
        
        if (piece1 && piece2) {
          // Check if swap would create invalid pawn positions
          if (piece1.type === 'p' && !shouldPromotePawn(piece2.square, piece1.color) ||
              piece2.type === 'p' && !shouldPromotePawn(piece1.square, piece2.color)) {
            continue // Try another random pair
          }

          game.remove(piece1.square)
          game.remove(piece2.square)
          
          // Handle promotions
          if (piece1.type === 'p' && shouldPromotePawn(piece2.square, piece1.color)) {
            game.put({ type: 'q' as PieceSymbol, color: piece1.color }, piece2.square)
          } else {
            game.put({ type: piece1.type as PieceSymbol, color: piece1.color }, piece2.square)
          }
          
          if (piece2.type === 'p' && shouldPromotePawn(piece1.square, piece2.color)) {
            game.put({ type: 'q' as PieceSymbol, color: piece2.color }, piece1.square)
          } else {
            game.put({ type: piece2.type as PieceSymbol, color: piece2.color }, piece1.square)
          }
          return // Success
        }
      }
    }
  },
  {
    name: "Piece Promotion",
    description: "A random pawn gets promoted",
    execute: (game) => {
      const board = game.board()
      const pawns = board.flat().filter((p): p is { type: PieceSymbol; color: Color; square: Square } => p !== null && p.type === 'p')
      if (pawns.length > 0) {
        const pawn = pawns[Math.floor(Math.random() * pawns.length)]
        if (pawn) {
          const pieces: PieceSymbol[] = ['q', 'r', 'b', 'n'] as PieceSymbol[]
          const newPiece = pieces[Math.floor(Math.random() * pieces.length)]
          game.remove(pawn.square)
          game.put({ type: newPiece, color: pawn.color }, pawn.square)
        }
      }
    }
  },
  {
    name: "Piece Disappearance",
    description: "A random piece disappears",
    execute: (game) => {
      const board = game.board()
      const pieces = board.flat().filter((p): p is { type: PieceSymbol; color: Color; square: Square } => p !== null && p.type !== 'k')
      if (pieces.length > 0) {
        const piece = pieces[Math.floor(Math.random() * pieces.length)]
        if (piece) {
          game.remove(piece.square)
        }
      }
    }
  },
  {
    name: "Piece Duplication",
    description: "A random piece is duplicated",
    execute: (game) => {
      const board = game.board()
      const pieces = board.flat().filter((p): p is { type: PieceSymbol; color: Color; square: Square } => 
        p !== null && p.type !== 'k'
      )
      const emptySquares = board.flat().filter((p): p is null => p === null)
        .map((_, i) => {
          const file = String.fromCharCode('a'.charCodeAt(0) + (i % 8))
          const rank = Math.floor(i / 8) + 1
          return `${file}${rank}` as Square
        })

      // Try up to 10 times to find valid moves
      for (let attempt = 0; attempt < 10; attempt++) {
        const piece = pieces[Math.floor(Math.random() * pieces.length)]
        const square = emptySquares[Math.floor(Math.random() * emptySquares.length)]
        
        if (piece && square) {
          // Check if duplication would create invalid pawn position
          if (piece.type === 'p' && !shouldPromotePawn(square, piece.color)) {
            continue // Try another random combination
          }

          // Handle promotion
          if (piece.type === 'p' && shouldPromotePawn(square, piece.color)) {
            game.put({ type: 'q' as PieceSymbol, color: piece.color }, square)
          } else {
            game.put({ type: piece.type as PieceSymbol, color: piece.color }, square)
          }
          return // Success
        }
      }
    }
  },
  {
    name: "Knight's Leap",
    description: "All knights make a random move",
    execute: (game) => {
      const board = game.board()
      const knights = board.flat().filter((p): p is { type: PieceSymbol; color: Color; square: Square } => p !== null && p.type === 'n')
      knights.forEach(knight => {
        if (knight) {
          const moves = game.moves({ square: knight.square, verbose: true })
          if (moves.length > 0) {
            const move = moves[Math.floor(Math.random() * moves.length)]
            game.remove(knight.square)
            game.put({ type: 'n' as PieceSymbol, color: knight.color }, move.to)
          }
        }
      })
    }
  },
  {
    name: "Pawn March",
    description: "All pawns advance one square",
    execute: (game) => {
      const board = game.board()
      const pawns = board.flat().filter((p): p is { type: PieceSymbol; color: Color; square: Square } => p !== null && p.type === 'p')
      pawns.forEach(pawn => {
        if (pawn) {
          const targetRank = pawn.color === 'w' ? 
            parseInt(pawn.square[1]) + 1 : 
            parseInt(pawn.square[1]) - 1
          const targetSquare = (pawn.square[0] + targetRank) as Square

          if (targetRank > 0 && targetRank < 9) {
            game.remove(pawn.square)
            // Promote to queen if pawn reaches the end
            if ((pawn.color === 'w' && targetRank === 8) || 
                (pawn.color === 'b' && targetRank === 1)) {
              game.put({ type: 'q' as PieceSymbol, color: pawn.color }, targetSquare)
            } else {
              game.put({ type: 'p' as PieceSymbol, color: pawn.color }, targetSquare)
            }
          }
        }
      })
    }
  },
  {
    name: "Queen's Dance",
    description: "Queens make random legal moves",
    execute: (game) => {
      const board = game.board()
      const queens = board.flat().filter((p): p is { type: PieceSymbol; color: Color; square: Square } => p !== null && p.type === 'q')
      queens.forEach(queen => {
        if (queen) {
          const moves = game.moves({ square: queen.square, verbose: true })
          if (moves.length > 0) {
            const move = moves[Math.floor(Math.random() * moves.length)]
            game.remove(queen.square)
            game.put({ type: 'q' as PieceSymbol, color: queen.color }, move.to)
          }
        }
      })
    }
  },
  {
    name: "Piece Explosion",
    description: "A piece explodes, affecting adjacent squares",
    execute: (game) => {
      const board = game.board()
      const pieces = board.flat().filter((p): p is { type: PieceSymbol; color: Color; square: Square } => p !== null && p.type !== 'k')
      if (pieces.length > 0) {
        const piece = pieces[Math.floor(Math.random() * pieces.length)]
        if (piece) {
          const file = piece.square[0]
          const rank = parseInt(piece.square[1])
          const adjacentSquares = [
            `${String.fromCharCode(file.charCodeAt(0) - 1)}${rank}`,
            `${String.fromCharCode(file.charCodeAt(0) + 1)}${rank}`,
            `${file}${rank - 1}`,
            `${file}${rank + 1}`,
          ].filter(sq => sq.match(/^[a-h][1-8]$/)) as Square[]
          
          // Remove the exploding piece and adjacent pieces
          game.remove(piece.square)
          adjacentSquares.forEach(sq => game.remove(sq))
        }
      }
    }
  },
  {
    name: "Bishop's Diagonal",
    description: "All bishops slide to the edge of their diagonal",
    execute: (game) => {
      const board = game.board()
      const bishops = board.flat().filter((p): p is { type: PieceSymbol; color: Color; square: Square } => p !== null && p.type === 'b')
      bishops.forEach(bishop => {
        if (bishop) {
          const moves = game.moves({ square: bishop.square, verbose: true })
          const diagonalMoves = moves.filter(m => Math.abs(
            m.to.charCodeAt(0) - bishop.square.charCodeAt(0)
          ) === Math.abs(
            parseInt(m.to[1]) - parseInt(bishop.square[1])
          ))
          if (diagonalMoves.length > 0) {
            const lastMove = diagonalMoves[diagonalMoves.length - 1]
            game.remove(bishop.square)
            game.put({ type: 'b' as PieceSymbol, color: bishop.color }, lastMove.to)
          }
        }
      })
    }
  },
  {
    name: "Rook's Rampage",
    description: "Rooks move to random files",
    execute: (game) => {
      const board = game.board()
      const rooks = board.flat().filter((p): p is { type: PieceSymbol; color: Color; square: Square } => p !== null && p.type === 'r')
      rooks.forEach(rook => {
        if (rook) {
          const rank = rook.square[1]
          const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
          const newFile = files[Math.floor(Math.random() * files.length)]
          const newSquare = `${newFile}${rank}` as Square
          if (!board[8 - parseInt(rank)][newFile.charCodeAt(0) - 'a'.charCodeAt(0)]) {
            game.remove(rook.square)
            game.put({ type: 'r' as PieceSymbol, color: rook.color }, newSquare)
          }
        }
      })
    }
  },
  {
    name: "Pawn Revolution",
    description: "Pawns switch direction",
    execute: (game) => {
      const board = game.board()
      const pawns = board.flat().filter((p): p is { type: PieceSymbol; color: Color; square: Square } => p !== null && p.type === 'p')
      pawns.forEach(pawn => {
        if (pawn) {
          game.remove(pawn.square)
          game.put({ type: 'p' as PieceSymbol, color: pawn.color === 'w' ? 'b' : 'w' }, pawn.square)
        }
      })
    }
  },
  {
    name: "Royal Guard",
    description: "Pieces near kings become queens",
    execute: (game) => {
      const board = game.board()
      const kings = board.flat().filter((p): p is { type: PieceSymbol; color: Color; square: Square } => p !== null && p.type === 'k')
      kings.forEach(king => {
        if (king) {
          const file = king.square[0]
          const rank = parseInt(king.square[1])
          const adjacentSquares = [
            `${String.fromCharCode(file.charCodeAt(0) - 1)}${rank}`,
            `${String.fromCharCode(file.charCodeAt(0) + 1)}${rank}`,
            `${file}${rank - 1}`,
            `${file}${rank + 1}`,
          ].filter(sq => sq.match(/^[a-h][1-8]$/))
          
          adjacentSquares.forEach(sq => {
            const piece = board[8 - parseInt(sq[1])][sq.charCodeAt(0) - 'a'.charCodeAt(0)]
            if (piece && piece.type !== 'k' && piece.type !== 'q') {
              game.remove(sq as Square)
              game.put({ type: 'q' as PieceSymbol, color: piece.color }, sq as Square)
            }
          })
        }
      })
    }
  }
]

type VotingOption = {
  effect: ChaosEffect;
  votes: number;
}

// Add simple evaluation function
function evaluatePosition(game: Chess): number {
  const pieceValues = {
    p: 1,
    n: 3,
    b: 3,
    r: 5,
    q: 9,
    k: 0
  }
  
  let score = 0
  const board = game.board()
  
  board.forEach(row => {
    row.forEach(piece => {
      if (piece) {
        const value = pieceValues[piece.type] * (piece.color === 'w' ? 1 : -1)
        score += value
      }
    })
  })
  
  return score
}

// Add minimax function
function findBestMove(game: Chess, depth: number = 3): string {
  let bestMove = null
  let bestValue = -Infinity
  const moves = game.moves({ verbose: true })
  
  for (const move of moves) {
    game.move(move)
    const value = -minimax(game, depth - 1, -Infinity, Infinity, false)
    game.undo()
    
    if (value > bestValue) {
      bestValue = value
      bestMove = move
    }
  }
  
  return bestMove ? bestMove.san : moves[0].san
}

function minimax(game: Chess, depth: number, alpha: number, beta: number, isMaximizing: boolean): number {
  if (depth === 0) return evaluatePosition(game)
  
  const moves = game.moves()
  if (moves.length === 0) return -Infinity // Checkmate
  
  if (isMaximizing) {
    let maxEval = -Infinity
    for (const move of moves) {
      game.move(move)
      const evaluation = minimax(game, depth - 1, alpha, beta, false)
      game.undo()
      maxEval = Math.max(maxEval, evaluation)
      alpha = Math.max(alpha, evaluation)
      if (beta <= alpha) break
    }
    return maxEval
  } else {
    let minEval = Infinity
    for (const move of moves) {
      game.move(move)
      const evaluation = minimax(game, depth - 1, alpha, beta, true)
      game.undo()
      minEval = Math.min(minEval, evaluation)
      beta = Math.min(beta, evaluation)
      if (beta <= alpha) break
    }
    return minEval
  }
}

export default function ChessGame() {
  const [game, setGame] = useState(new Chess())
  const [lastEffect, setLastEffect] = useState<ChaosEffect | null>(null)
  const [winner, setWinner] = useState<'white' | 'black' | null>(null)
  const [progress, setProgress] = useState(100)
  const [votingOptions, setVotingOptions] = useState<VotingOption[]>([])
  const [totalVotes, setTotalVotes] = useState(0)

  function checkWinCondition(game: Chess) {
    // Check for missing kings first
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

    // Check for checkmate
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
    setLastEffect(null)
  }

  function makeMove(move: any) {
    const gameCopy = new Chess(game.fen())
    try {
      const result = gameCopy.move(move)
      if (result) {
        setGame(gameCopy)
        if (checkWinCondition(gameCopy)) {
          return true
        }
        return true
      }
    } catch (e) {
      return false
    }
    return false
  }

  const generateVotingOptions = useCallback(() => {
    const shuffled = [...chaosEffects].sort(() => 0.5 - Math.random())
    const selected = shuffled.slice(0, 4)
    const options = selected.map(effect => ({
      effect,
      votes: Math.floor(Math.random() * 50) + 1 // Random votes between 1-50
    }))
    const total = options.reduce((sum, option) => sum + option.votes, 0)
    setVotingOptions(options)
    setTotalVotes(total)
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    let progressInterval: NodeJS.Timeout
    
    if (!winner) {
      interval = setInterval(() => {
        if (votingOptions.length === 0) {
          generateVotingOptions()
          return
        }

        // Calculate probability based on vote proportions
        const random = Math.random()
        let selectedEffect = votingOptions[0].effect
        
        // Find effect based on probability ranges
        let cumulativeProbability = 0
        for (const option of votingOptions) {
          const probability = option.votes / totalVotes
          cumulativeProbability += probability
          if (random <= cumulativeProbability) {
            selectedEffect = option.effect
            break
          }
        }

        const gameCopy = new Chess(game.fen())
        selectedEffect.execute(gameCopy)
        setLastEffect(selectedEffect)
        setGame(gameCopy)
        setProgress(100)
        generateVotingOptions()
        
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
  }, [game, winner, votingOptions, totalVotes, generateVotingOptions])

  // Replace Stockfish initialization with AI move effect
  useEffect(() => {
    if (game.turn() === 'b' && !winner) {
      // Add small delay to show "AI thinking"
      setTimeout(() => {
        const bestMove = findBestMove(game)
        makeMove(bestMove)
      }, 500)
    }
  }, [game, winner])

  return (
    <div className="w-full max-w-[1200px] mx-auto mt-8">
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
        {/* Main Game Area */}
        <div className="flex-1 bg-white/5 backdrop-blur-md rounded-lg p-2 lg:p-4">
          <div className="text-center mb-2 lg:mb-4">
            <p className="text-base lg:text-lg font-semibold text-white">
              {game.turn() === 'w' ? 'Your turn' : 'AI thinking...'}
            </p>
          </div>

          <div className="relative z-50">
            <Chessboard 
              position={game.fen()}
              onPieceDrop={(source, target) => {
                if (game.turn() === 'w') {
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
          </div>

          {/* Game Status */}
          {winner ? (
            <div className="mt-2 lg:mt-4 text-center bg-black/50 rounded-lg p-2 lg:p-4">
              <h3 className="text-2xl lg:text-3xl font-bold text-white animate-bounce">
                {winner === 'white' ? 'White' : 'Black'} Wins!
              </h3>
            </div>
          ) : (
            <div className="mt-2 lg:mt-4 space-y-2">
              <Progress value={progress} className="h-2" />
              {lastEffect && (
                <div className="text-center bg-black/50 rounded-lg p-2 lg:p-4 space-y-1 lg:space-y-2">
                  <h3 className="text-lg lg:text-xl font-bold text-white">
                    {lastEffect.name}
                  </h3>
                  <p className="text-sm lg:text-base text-white/80">
                    {lastEffect.description}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Voting Panel */}
        <div className="w-full lg:w-64 bg-white/10 backdrop-blur-sm rounded-lg p-2 lg:p-4">
          <h3 className="text-lg lg:text-xl font-bold text-white mb-2 lg:mb-4 text-center">
            Next Chaos Effect
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 lg:gap-4">
            {votingOptions.map((option, index) => (
              <div key={index} className="bg-black/30 rounded-lg p-2 lg:p-3">
                <p className="text-sm lg:text-base text-white font-medium mb-1 lg:mb-2">{option.effect.name}</p>
                <div className="w-full bg-black/30 rounded-full h-1.5 lg:h-2">
                  <div 
                    className="bg-white/80 h-full rounded-full transition-all duration-300"
                    style={{ width: `${(option.votes / totalVotes) * 100}%` }}
                  />
                </div>
                <p className="text-xs lg:text-sm text-white/80 mt-1">{option.votes} votes</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 