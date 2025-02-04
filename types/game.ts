export interface GameState {
  id: string
  fen: string
  turn: 'w' | 'b'
  status: 'active' | 'completed'
  winner?: string
  timeControl: string
  mode: string
  players: {
    white: { userId: string }
    black: { userId: string }
  }
}

export interface ChatMessage {
  text: string
  userId: string
  timestamp: number
} 