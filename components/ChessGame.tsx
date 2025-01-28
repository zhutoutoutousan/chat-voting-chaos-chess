"use client"

import { useEffect, useState, useCallback } from 'react'
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

const chaosEffects: ChaosEffect[] = [
  {
    name: "Random Piece Swap",
    description: "Two random pieces swap positions",
    execute: (game) => {
      const board = game.board()
      const pieces = board.flat().filter((p): p is { type: PieceSymbol; color: Color; square: Square } => 
        p !== null && p.type !== 'k'
      )
      if (pieces.length >= 2) {
        const piece1 = pieces[Math.floor(Math.random() * pieces.length)]
        const piece2 = pieces[Math.floor(Math.random() * pieces.length)]
        if (piece1 && piece2) {
          game.remove(piece1.square)
          game.remove(piece2.square)
          
          // Check for pawn promotion on piece1's new position
          if (piece1.type === 'p' && 
              ((piece1.color === 'w' && piece2.square[1] === '8') || 
               (piece1.color === 'b' && piece2.square[1] === '1'))) {
            game.put({ type: 'q' as PieceSymbol, color: piece1.color }, piece2.square)
          } else {
            game.put({ type: piece1.type as PieceSymbol, color: piece1.color }, piece2.square)
          }
          
          // Check for pawn promotion on piece2's new position
          if (piece2.type === 'p' && 
              ((piece2.color === 'w' && piece1.square[1] === '8') || 
               (piece2.color === 'b' && piece1.square[1] === '1'))) {
            game.put({ type: 'q' as PieceSymbol, color: piece2.color }, piece1.square)
          } else {
            game.put({ type: piece2.type as PieceSymbol, color: piece2.color }, piece1.square)
          }
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
      const pieces = board.flat().filter((p): p is { type: PieceSymbol; color: Color; square: Square } => p !== null && p.type !== 'k')
      const emptySquares = board.flat().filter((p): p is null => p === null)
        .map((_, i) => {
          const file = String.fromCharCode('a'.charCodeAt(0) + (i % 8))
          const rank = Math.floor(i / 8) + 1
          return `${file}${rank}` as Square
        })
      if (pieces.length > 0 && emptySquares.length > 0) {
        const piece = pieces[Math.floor(Math.random() * pieces.length)]
        const square = emptySquares[Math.floor(Math.random() * emptySquares.length)]
        if (piece && square) {
          game.put({ type: piece.type as PieceSymbol, color: piece.color }, square)
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

export default function ChessGame() {
  const [game, setGame] = useState(new Chess())
  const [lastEffect, setLastEffect] = useState<ChaosEffect | null>(null)
  const [winner, setWinner] = useState<'white' | 'black' | null>(null)
  const [progress, setProgress] = useState(100)
  const [votingOptions, setVotingOptions] = useState<VotingOption[]>([])
  const [totalVotes, setTotalVotes] = useState(0)

  function checkWinCondition(game: Chess) {
    const board = game.board()
    const whiteKing = board.flat().find(p => p && p.type === 'k' && p.color === 'w')
    const blackKing = board.flat().find(p => p && p.type === 'k' && p.color === 'b')

    if (!whiteKing) {
      setWinner('black')
      return true
    }
    if (!blackKing) {
      setWinner('white')
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
        checkWinCondition(gameCopy)
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
          setTimeout(resetGame, RESET_DELAY)
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

  return (
    <div className="w-full max-w-[1200px] mx-auto mt-8">
      <div className="flex gap-8">
        <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div className="text-center mb-4">
            <p className="text-lg font-semibold text-white">
              {game.turn() === 'w' ? 'White' : 'Black'} to move
            </p>
          </div>

          <Chessboard 
            position={game.fen()}
            onPieceDrop={(source, target) => {
              return makeMove({
                from: source,
                to: target,
                promotion: 'q'
              })
            }}
          />
          {winner ? (
            <div className="mt-4 text-center bg-black/50 rounded-lg p-4">
              <h3 className="text-3xl font-bold text-white animate-bounce">
                {winner === 'white' ? 'White' : 'Black'} Wins!
              </h3>
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              <Progress value={progress} className="h-2" />
              {lastEffect && (
                <div className="text-center bg-black/50 rounded-lg p-4 space-y-2">
                  <h3 className="text-xl font-bold text-white">
                    {lastEffect.name}
                  </h3>
                  <p className="text-white/80">
                    {lastEffect.description}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="w-64 bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <h3 className="text-xl font-bold text-white mb-4 text-center">
            Next Chaos Effect
          </h3>
          <div className="space-y-4">
            {votingOptions.map((option, index) => (
              <div key={index} className="bg-black/30 rounded-lg p-3">
                <p className="text-white font-medium mb-2">{option.effect.name}</p>
                <div className="w-full bg-black/30 rounded-full h-2">
                  <div 
                    className="bg-white/80 h-full rounded-full transition-all duration-300"
                    style={{ width: `${(option.votes / totalVotes) * 100}%` }}
                  />
                </div>
                <p className="text-white/80 text-sm mt-1">{option.votes} votes</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 