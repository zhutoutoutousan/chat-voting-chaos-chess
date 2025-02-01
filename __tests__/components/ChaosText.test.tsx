import { render, screen } from '@testing-library/react'
import { ChaosText } from '@/components/ChaosText'

describe('ChaosText', () => {
  it('renders text with chaotic effects', () => {
    render(<ChaosText text="Test" />)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  it('applies chaotic font classes', () => {
    render(<ChaosText text="Test" />)
    const letters = screen.getAllByRole('text-letter')
    letters.forEach(letter => {
      expect(letter).toHaveClass(/font-/)
    })
  })
}) 