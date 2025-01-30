import { Chess, Move, Square, PieceSymbol } from 'chess.js'

// Piece-square tables for positional evaluation
const PIECE_SQUARE_TABLES = {
  p: [ // pawns
    [0,  0,  0,  0,  0,  0,  0,  0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5,  5, 10, 25, 25, 10,  5,  5],
    [0,  0,  0, 20, 20,  0,  0,  0],
    [5, -5,-10,  0,  0,-10, -5,  5],
    [5, 10, 10,-20,-20, 10, 10,  5],
    [0,  0,  0,  0,  0,  0,  0,  0]
  ],
  n: [ // knights
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,  0,  0,  0,  0,-20,-40],
    [-30,  0, 10, 15, 15, 10,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30],
    [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 10, 15, 15, 10,  5,-30],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-50,-40,-30,-30,-30,-30,-40,-50]
  ],
  b: [ // bishops
    [-20,-10,-10,-10,-10,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5, 10, 10,  5,  0,-10],
    [-10,  5,  5, 10, 10,  5,  5,-10],
    [-10,  0, 10, 10, 10, 10,  0,-10],
    [-10, 10, 10, 10, 10, 10, 10,-10],
    [-10,  5,  0,  0,  0,  0,  5,-10],
    [-20,-10,-10,-10,-10,-10,-10,-20]
  ],
  r: [ // rooks
    [0,  0,  0,  0,  0,  0,  0,  0],
    [5, 10, 10, 10, 10, 10, 10,  5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [0,  0,  0,  5,  5,  0,  0,  0]
  ],
  q: [ // queen
    [-20,-10,-10, -5, -5,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5,  5,  5,  5,  0,-10],
    [-5,  0,  5,  5,  5,  5,  0, -5],
    [0,  0,  5,  5,  5,  5,  0, -5],
    [-10,  5,  5,  5,  5,  5,  0,-10],
    [-10,  0,  5,  0,  0,  0,  0,-10],
    [-20,-10,-10, -5, -5,-10,-10,-20]
  ],
  k: [ // king
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-20,-30,-30,-40,-40,-30,-30,-20],
    [-10,-20,-20,-20,-20,-20,-20,-10],
    [20, 20,  0,  0,  0,  0, 20, 20],
    [20, 30, 10,  0,  0, 10, 30, 20]
  ]
}

// Material values for pieces
const PIECE_VALUES = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000
}

export class ChessAI {
  private depth: number
  private maxDepth: number

  constructor(maxDepth: number = 3) {
    this.maxDepth = maxDepth
  }

  getBestMove(game: Chess): Move {
    const moves = game.moves({ verbose: true })
    let bestMove = moves[0]
    let bestScore = -Infinity
    let alpha = -Infinity
    let beta = Infinity

    for (const move of moves) {
      const newGame = new Chess(game.fen())
      newGame.move(move)
      const score = -this.minimax(newGame, this.maxDepth - 1, -beta, -alpha, false)
      
      if (score > bestScore) {
        bestScore = score
        bestMove = move
      }
      alpha = Math.max(alpha, score)
    }

    return bestMove
  }

  private minimax(
    game: Chess, 
    depth: number, 
    alpha: number, 
    beta: number, 
    isMaximizing: boolean
  ): number {
    if (depth === 0) {
      return this.evaluatePosition(game)
    }

    const moves = game.moves({ verbose: true })

    // Check for checkmate and stalemate
    if (moves.length === 0) {
      if (game.isCheckmate()) {
        return isMaximizing ? -100000 : 100000
      }
      return 0 // stalemate
    }

    if (isMaximizing) {
      let maxScore = -Infinity
      for (const move of moves) {
        const newGame = new Chess(game.fen())
        newGame.move(move)
        const score = this.minimax(newGame, depth - 1, alpha, beta, false)
        maxScore = Math.max(maxScore, score)
        alpha = Math.max(alpha, score)
        if (beta <= alpha) break // Alpha-beta pruning
      }
      return maxScore
    } else {
      let minScore = Infinity
      for (const move of moves) {
        const newGame = new Chess(game.fen())
        newGame.move(move)
        const score = this.minimax(newGame, depth - 1, alpha, beta, true)
        minScore = Math.min(minScore, score)
        beta = Math.min(beta, score)
        if (beta <= alpha) break // Alpha-beta pruning
      }
      return minScore
    }
  }

  private evaluatePosition(game: Chess): number {
    let score = 0

    // Evaluate material and position for each piece
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const square = String.fromCharCode(97 + i) + (j + 1) as Square
        const piece = game.get(square)
        if (piece) {
          // Material value
          const materialValue = PIECE_VALUES[piece.type] * (piece.color === 'w' ? 1 : -1)
          score += materialValue

          // Position value
          const positionValue = this.getPositionValue(piece.type, piece.color, i, j)
          score += positionValue
        }
      }
    }

    return score
  }

  private getPositionValue(piece: PieceSymbol, color: 'w' | 'b', x: number, y: number): number {
    const table = PIECE_SQUARE_TABLES[piece]
    const position = color === 'w' ? table[7 - y][x] : table[y][x]
    return position * (color === 'w' ? 1 : -1)
  }
} 