"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

type Piece = {
  type: string
  color: "white" | "black"
}

type Square = Piece | null

export default function ChessBoard() {
  const [board, setBoard] = useState<Square[][]>(initializeBoard())

  function initializeBoard(): Square[][] {
    // This is a simplified board setup
    const emptyBoard: Square[][] = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null))

    // Set up pawns
    for (let i = 0; i < 8; i++) {
      emptyBoard[1][i] = { type: "pawn", color: "white" }
      emptyBoard[6][i] = { type: "pawn", color: "black" }
    }

    // Set up other pieces (simplified)
    const backRow: Piece["type"][] = ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"]
    for (let i = 0; i < 8; i++) {
      emptyBoard[0][i] = { type: backRow[i], color: "white" }
      emptyBoard[7][i] = { type: backRow[i], color: "black" }
    }

    return emptyBoard
  }

  return (
    <div className="grid grid-cols-8 gap-1 w-[400px] h-[400px]">
      {board.flat().map((square, index) => (
        <Button key={index} variant="outline" className="w-full h-full flex items-center justify-center p-0">
          {square && (
            <span className="text-2xl">
              {square.type === "pawn" && (square.color === "white" ? "♙" : "♟")}
              {square.type === "rook" && (square.color === "white" ? "♖" : "♜")}
              {square.type === "knight" && (square.color === "white" ? "♘" : "♞")}
              {square.type === "bishop" && (square.color === "white" ? "♗" : "♝")}
              {square.type === "queen" && (square.color === "white" ? "♕" : "♛")}
              {square.type === "king" && (square.color === "white" ? "♔" : "♚")}
            </span>
          )}
        </Button>
      ))}
    </div>
  )
}

