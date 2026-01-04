// Chess utilities for frontend
// Note: For full implementation, you'd use chess.js on frontend
// This is a placeholder for basic utilities

export class ChessService {
  static getTurn(fen: string): 'white' | 'black' {
    const parts = fen.split(' ');
    return parts[1] === 'w' ? 'white' : 'black';
  }

  static isGameOver(_fen: string): boolean {
    // Simplified - full implementation would use chess.js
    return false;
  }
}
