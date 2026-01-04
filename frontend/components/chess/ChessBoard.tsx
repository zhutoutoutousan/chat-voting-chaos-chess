'use client';

import { useState, useEffect } from 'react';

interface ChessBoardProps {
  fen: string;
  onMove?: (from: string, to: string) => void;
  legalMoves?: Array<{ from: string; to: string }>;
  selectedSquare?: string | null;
  onSquareClick?: (square: string) => void;
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = [8, 7, 6, 5, 4, 3, 2, 1];

const PIECE_SYMBOLS: Record<string, string> = {
  'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
  'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟',
};

export function ChessBoard({
  fen,
  onMove,
  legalMoves = [],
  selectedSquare,
  onSquareClick,
}: ChessBoardProps) {
  const [internalSelected, setInternalSelected] = useState<string | null>(null);
  const [board, setBoard] = useState<Array<Array<string | null>>>([]);

  useEffect(() => {
    // Parse FEN position
    const parts = fen.split(' ');
    const position = parts[0];
    const rows = position.split('/');

    const newBoard: Array<Array<string | null>> = [];

    for (let rank = 0; rank < 8; rank++) {
      const row: Array<string | null> = [];
      let file = 0;

      for (const char of rows[rank]) {
        if (char >= '1' && char <= '8') {
          const emptySquares = parseInt(char);
          for (let i = 0; i < emptySquares; i++) {
            row.push(null);
            file++;
          }
        } else {
          row.push(char);
          file++;
        }
      }

      newBoard.push(row);
    }

    setBoard(newBoard);
  }, [fen]);

  const handleSquareClick = (rank: number, file: number) => {
    const square = `${FILES[file]}${RANKS[rank]}`;
    const currentSelected = selectedSquare ?? internalSelected;

    if (currentSelected) {
      // Try to make move
      const move = legalMoves.find(
        (m) => m.from === currentSelected && m.to === square
      );

      if (move) {
        onMove?.(move.from, move.to);
        setInternalSelected(null);
        onSquareClick?.(null as any);
      } else {
        // Select new square
        setInternalSelected(square);
        onSquareClick?.(square);
      }
    } else {
      // Select square
      setInternalSelected(square);
      onSquareClick?.(square);
    }
  };

  const isSquareLegal = (rank: number, file: number): boolean => {
    const square = `${FILES[file]}${RANKS[rank]}`;
    const currentSelected = selectedSquare ?? internalSelected;
    return legalMoves.some((m) => m.from === currentSelected && m.to === square);
  };

  const getSquareColor = (rank: number, file: number): string => {
    const isLight = (rank + file) % 2 === 0;
    const square = `${FILES[file]}${RANKS[rank]}`;
    const currentSelected = selectedSquare ?? internalSelected;

    if (currentSelected === square) {
      return 'bg-blue-400';
    }
    if (isSquareLegal(rank, file)) {
      return 'bg-green-300';
    }
    return isLight ? 'bg-amber-100' : 'bg-amber-800';
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="grid grid-cols-8 gap-0 border-4 border-gray-800">
        {RANKS.map((rank, rankIdx) =>
          FILES.map((file, fileIdx) => {
            const piece = board[rankIdx]?.[fileIdx];
            const square = `${file}${rank}`;

            return (
              <div
                key={square}
                className={`
                  aspect-square flex items-center justify-center
                  ${getSquareColor(rankIdx, fileIdx)}
                  cursor-pointer hover:opacity-80
                  text-4xl font-bold
                `}
                onClick={() => handleSquareClick(rankIdx, fileIdx)}
              >
                {piece && PIECE_SYMBOLS[piece] ? (
                  <span className={piece === piece.toUpperCase() ? 'text-white' : 'text-black'}>
                    {PIECE_SYMBOLS[piece]}
                  </span>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
