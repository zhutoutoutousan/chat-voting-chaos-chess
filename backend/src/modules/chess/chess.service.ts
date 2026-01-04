import { Injectable } from '@nestjs/common';
import { Chess } from 'chess.js';

export interface MoveValidationResult {
  valid: boolean;
  move?: string;
  san?: string;
  error?: string;
}

export interface GameAnalysis {
  evaluation: number;
  bestMove: string | null;
  legalMoves: string[];
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
}

@Injectable()
export class ChessService {
  /**
   * Validate a move in a given position
   */
  validateMove(fen: string, move: string): MoveValidationResult {
    try {
      const chess = new Chess(fen);
      const moveObj = chess.move(move);

      if (!moveObj) {
        return {
          valid: false,
          error: 'Invalid move',
        };
      }

      return {
        valid: true,
        move: moveObj.from + moveObj.to,
        san: moveObj.san,
      };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Make a move and return the new position
   */
  makeMove(fen: string, move: string): { success: boolean; newFen?: string; san?: string; error?: string } {
    try {
      const chess = new Chess(fen);
      const moveObj = chess.move(move);

      if (!moveObj) {
        return {
          success: false,
          error: 'Invalid move',
        };
      }

      return {
        success: true,
        newFen: chess.fen(),
        san: moveObj.san,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get all legal moves for the current position
   */
  getLegalMoves(fen: string): string[] {
    try {
      const chess = new Chess(fen);
      return chess.moves({ verbose: false });
    } catch (error) {
      return [];
    }
  }

  /**
   * Get legal moves with verbose information
   */
  getLegalMovesVerbose(fen: string): Array<{ from: string; to: string; san: string }> {
    try {
      const chess = new Chess(fen);
      return chess.moves({ verbose: true }).map((move) => ({
        from: move.from,
        to: move.to,
        san: move.san,
      }));
    } catch (error) {
      return [];
    }
  }

  /**
   * Analyze the current position
   */
  analyzePosition(fen: string): GameAnalysis {
    try {
      const chess = new Chess(fen);
      const legalMoves = chess.moves({ verbose: false });

      return {
        evaluation: 0, // Will be calculated by engine later
        bestMove: legalMoves[0] || null,
        legalMoves,
        isCheck: chess.isCheck(),
        isCheckmate: chess.isCheckmate(),
        isStalemate: chess.isStalemate(),
        isDraw: chess.isDraw(),
      };
    } catch (error) {
      return {
        evaluation: 0,
        bestMove: null,
        legalMoves: [],
        isCheck: false,
        isCheckmate: false,
        isStalemate: false,
        isDraw: false,
      };
    }
  }

  /**
   * Check if the game is over
   */
  isGameOver(fen: string): { isOver: boolean; reason?: string } {
    try {
      const chess = new Chess(fen);

      if (chess.isCheckmate()) {
        return { isOver: true, reason: 'CHECKMATE' };
      }
      if (chess.isStalemate()) {
        return { isOver: true, reason: 'STALEMATE' };
      }
      if (chess.isDraw()) {
        return { isOver: true, reason: 'DRAW' };
      }
      if (chess.isInsufficientMaterial()) {
        return { isOver: true, reason: 'INSUFFICIENT_MATERIAL' };
      }

      return { isOver: false };
    } catch (error) {
      return { isOver: false };
    }
  }

  /**
   * Get the current turn (white or black)
   */
  getTurn(fen: string): 'white' | 'black' {
    try {
      const chess = new Chess(fen);
      return chess.turn() === 'w' ? 'white' : 'black';
    } catch (error) {
      return 'white';
    }
  }

  /**
   * Get the initial FEN position
   */
  getInitialFen(): string {
    return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  }

  /**
   * Convert move to SAN notation
   */
  moveToSan(fen: string, move: string): string | null {
    try {
      const chess = new Chess(fen);
      const moveObj = chess.move(move);
      return moveObj ? moveObj.san : null;
    } catch (error) {
      return null;
    }
  }
}
