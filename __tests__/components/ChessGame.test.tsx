import { render, screen, fireEvent } from '@testing-library/react'
import ChessGame from '@/components/ChessGame'

describe('ChessGame', () => {
  it('renders the chess board', () => {
    render(<ChessGame />)
    expect(screen.getByTestId('chess-board')).toBeInTheDocument()
  })

  it('allows piece movement', () => {
    render(<ChessGame />)
    const piece = screen.getByTestId('piece-e2')
    const square = screen.getByTestId('square-e4')
    
    fireEvent.dragStart(piece)
    fireEvent.drop(square)
    
    expect(piece).toHaveAttribute('data-square', 'e4')
  })
}) 