import { Chess, Square } from 'chess.js'
import { NewsEffect } from './newsApi'

export class NewsChessEngine {
  private game: Chess
  private effects: NewsEffect[]
  private effectUsageCounts: Map<NewsEffect, number> = new Map()
  private currentEffectIndex: number = 0
  private chaosInterval: NodeJS.Timeout | null = null
  private onGameUpdate: (game: Chess) => void
  private newsQueue: any[] = []
  private analyzing: boolean = false
  private onEffectApplied: (effect: NewsEffect) => void

  constructor(
    initialEffects: NewsEffect[], 
    newsQueue: any[],
    onGameUpdate: (game: Chess) => void,
    onEffectApplied: (effect: NewsEffect) => void
  ) {
    this.game = new Chess()
    this.effects = initialEffects
    this.newsQueue = newsQueue
    this.onGameUpdate = onGameUpdate
    this.onEffectApplied = onEffectApplied
    
    // Initialize usage counts
    initialEffects.forEach(effect => this.effectUsageCounts.set(effect, 0))
  }

  start() {
    if (this.effects.length < 3) {
      throw new Error('Need at least 3 news effects to start the game')
    }

    this.startChaosInterval()
  }

  stop() {
    if (this.chaosInterval) {
      clearInterval(this.chaosInterval)
      this.chaosInterval = null
    }
  }

  private startChaosInterval() {
    this.chaosInterval = setInterval(() => {
      this.applyChaosEffect()
    }, 10000) // Every 10 seconds
  }

  private async applyChaosEffect() {
    const effect = this.effects[this.currentEffectIndex]
    const usageCount = this.effectUsageCounts.get(effect) || 0
    
    if (usageCount >= 2) {
      // Replace this effect with a new one from the queue
      if (this.newsQueue.length > 0) {
        const nextNews = this.newsQueue.shift()
        try {
          const newEffect = await this.analyzeNews(nextNews)
          this.effects[this.currentEffectIndex] = newEffect
          this.effectUsageCounts.set(newEffect, 0)
          // Apply the new effect immediately
          await this.applyChaosEffect()
          return
        } catch (e) {
          // If analysis fails, skip to next effect
          this.currentEffectIndex = (this.currentEffectIndex + 1) % this.effects.length
          return
        }
      } else {
        // Skip this effect if no new news available
        this.currentEffectIndex = (this.currentEffectIndex + 1) % this.effects.length
        return
      }
    }

    // Apply the effect
    switch (effect.type) {
      case 'piece_multiply':
        this.multiplyRandomPiece()
        break
      case 'piece_vanish':
        this.vanishRandomPiece()
        break
      case 'random_move':
        this.makeRandomMove()
        break
      case 'piece_swap':
        this.swapRandomPieces()
        break
    }

    // Update usage count
    this.effectUsageCounts.set(effect, usageCount + 1)

    this.onGameUpdate(this.game)
    this.onEffectApplied(effect)
    this.currentEffectIndex = (this.currentEffectIndex + 1) % this.effects.length
  }

  private multiplyRandomPiece() {
    const pieces = this.getAllPieces()
    if (pieces.length === 0) return

    const randomPiece = pieces[Math.floor(Math.random() * pieces.length)]
    const emptySquares = this.getEmptySquares()
    if (emptySquares.length === 0) return

    const targetSquare = emptySquares[Math.floor(Math.random() * emptySquares.length)]
    this.game.put({ type: randomPiece.type, color: randomPiece.color }, targetSquare)
  }

  private vanishRandomPiece() {
    const pieces = this.getAllPieces()
    if (pieces.length === 0) return

    const randomPiece = pieces[Math.floor(Math.random() * pieces.length)]
    this.game.remove(randomPiece.square)
  }

  private makeRandomMove() {
    // Get all legal moves for the current position
    const moves = this.game.moves({ verbose: true })
    if (moves.length === 0) return

    // Pick a random move
    const randomMove = moves[Math.floor(Math.random() * moves.length)]
    
    // Make the move
    try {
      this.game.move({
        from: randomMove.from,
        to: randomMove.to,
        promotion: randomMove.promotion
      })
    } catch (e) {
      // Invalid move
    }
  }

  private swapRandomPieces() {
    const pieces = this.getAllPieces()
    if (pieces.length < 2) return

    const piece1 = pieces[Math.floor(Math.random() * pieces.length)]
    const piece2 = pieces[Math.floor(Math.random() * pieces.length)]
    
    if (piece1.square === piece2.square) return

    const tempPiece = { type: piece1.type, color: piece1.color }
    this.game.put({ type: piece2.type, color: piece2.color }, piece1.square as Square)
    this.game.put(tempPiece, piece2.square as Square)
  }

  private getAllPieces() {
    const pieces: any[] = []
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const square = String.fromCharCode(97 + i) + (j + 1) as Square
        const piece = this.game.get(square)
        if (piece) {
          pieces.push({ ...piece, square })
        }
      }
    }
    return pieces
  }

  private getEmptySquares(): Square[] {
    const emptySquares: Square[] = []
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const square = String.fromCharCode(97 + i) + (j + 1) as Square
        if (!this.game.get(square)) {
          emptySquares.push(square)
        }
      }
    }
    return emptySquares
  }

  private async analyzeNews(news: any): Promise<NewsEffect> {
    // Reuse your existing news analysis logic here
    const text = `${news.title} ${news.description}`
    const sentiment = await analyzeSentiment(text)
    
    return {
      type: sentiment === 'positive' ? 'piece_multiply' :
            sentiment === 'negative' ? 'piece_vanish' : 'random_move',
      description: `${sentiment} news effect: "${news.title}"`
    }
  }

  onMove(newGame: Chess) {
    this.game = newGame
    this.onGameUpdate(this.game)
  }
} 