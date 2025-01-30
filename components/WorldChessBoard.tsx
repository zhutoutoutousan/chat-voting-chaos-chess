"use client"

import { useEffect, useRef, useState } from 'react'
import { Chess } from 'chess.js'
import type { Square } from 'chess.js'
import { generateWorldMap, type GeneratedCountry } from '@/lib/worldMapGenerator'

// Add this at the top of the file
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) {
    if (width < 2 * radius) radius = width / 2
    if (height < 2 * radius) radius = height / 2
    this.beginPath()
    this.moveTo(x + radius, y)
    this.arcTo(x + width, y, x + width, y + height, radius)
    this.arcTo(x + width, y + height, x, y + height, radius)
    this.arcTo(x, y + height, x, y, radius)
    this.arcTo(x, y, x + width, y, radius)
    this.closePath()
    return this
  }
}

// Define regions as chess squares with detailed countries
const WORLD_REGIONS: Record<string, Square[]> = {
  // North America
  'USA': ['b7', 'c7', 'd7', 'b6', 'c6', 'd6', 'c5', 'd5'],
  'Canada': ['b8', 'c8', 'd8', 'e8', 'b7', 'c7', 'd7'],
  'Mexico': ['b5', 'c5', 'd5', 'c4'],
  
  // Europe
  'UK': ['e7', 'e8', 'f8'],
  'France': ['e7', 'f7', 'e6'],
  'Germany': ['f7', 'g7', 'f6'],
  'Italy': ['f6', 'g6', 'f5'],
  'Spain': ['e6', 'f6', 'e5'],
  'Russia': ['g8', 'h8', 'i8', 'j8', 'g7', 'h7', 'i7', 'j7', 'h6', 'i6'],
  'Nordic': ['f8', 'g8', 'f7'],
  'Ireland': ['d7', 'e7'],
  'Portugal': ['d6', 'e6'],
  
  // Asia
  'China': ['h7', 'i7', 'j7', 'h6', 'i6', 'j6', 'h5', 'i5'],
  'Japan': ['k7', 'k6', 'l6'],
  'India': ['h5', 'i5', 'j5', 'h4', 'i4'],
  'South Korea': ['k6', 'l6'],
  'Singapore': ['j4', 'k4'],
  'Vietnam': ['i5', 'j5', 'i4'],
  'Thailand': ['h5', 'i5', 'h4'],
  'Malaysia': ['i4', 'j4', 'i3'],
  'Philippines': ['k5', 'l5', 'k4'],
  
  // Middle East
  'Saudi Arabia': ['g5', 'h5', 'g4', 'h4'],
  'UAE': ['h4', 'i4', 'h3'],
  'Israel': ['g6', 'h6'],
  'Turkey': ['g6', 'h6', 'g5'],
  'Iran': ['i6', 'j6', 'i5'],
  'Iraq': ['h5', 'i5', 'h4'],
  
  // South America
  'Brazil': ['c3', 'd3', 'e3', 'c2', 'd2', 'e2'],
  'Argentina': ['c2', 'd2', 'c1', 'd1'],
  'Chile': ['b1', 'c1', 'd1'],
  'Colombia': ['c4', 'd4', 'c3'],
  'Venezuela': ['d4', 'e4', 'd3'],
  'Peru': ['c3', 'd3', 'c2'],
  'Bolivia': ['d3', 'e3', 'd2'],
  
  // Africa
  'Egypt': ['f5', 'g5', 'f4'],
  'Nigeria': ['f4', 'g4', 'f3'],
  'South Africa': ['f2', 'g2', 'f1', 'g1'],
  'Kenya': ['g3', 'h3', 'g2'],
  'Ethiopia': ['g4', 'h4', 'g3'],
  'Morocco': ['e5', 'f5', 'e4'],
  'Algeria': ['f5', 'g5', 'f4'],
  'Libya': ['g5', 'h5', 'g4'],
  'Sudan': ['g4', 'h4', 'g3'],
  
  // Oceania
  'Australia': ['j2', 'k2', 'l2', 'j1', 'k1', 'l1'],
  'New Zealand': ['m2', 'n2', 'm1'],
  'Indonesia': ['j3', 'k3', 'l3', 'j2'],
  'Papua New Guinea': ['l3', 'm3', 'l2'],
  
  // Additional regions
  'Taiwan': ['k5', 'l5'],
  'Hong Kong': ['j6', 'k6'],
  'Switzerland': ['f7', 'g7'],
  'Netherlands': ['e7', 'f7'],
  'Poland': ['g7', 'h7', 'g6'],
  'Greece': ['g6', 'h6', 'g5'],
  'Ukraine': ['h7', 'i7', 'h6'],
  'Romania': ['h6', 'i6', 'h5'],
  'Kazakhstan': ['j7', 'k7', 'j6'],
  'Pakistan': ['j5', 'k5', 'j4'],
  'Bangladesh': ['j4', 'k4', 'j3']
}

interface WorldChessBoardProps {
  game: Chess
  onSquareClick?: (square: Square) => void
}

type TooltipInfo = {
  x: number
  y: number
  country: GeneratedCountry
}

// Add more comprehensive country data
type CountryData = {
  gdp: string
  population: string
  growth: string
  exports: string[]
  companies: string[]
}

const COUNTRY_DATA: Record<string, CountryData> = {
  'USA': {
    gdp: '$21.4T',
    population: '331M',
    growth: '+5.7%',
    exports: ['Technology', 'Aircraft', 'Machinery'],
    companies: ['Apple', 'Microsoft', 'Amazon']
  },
  'China': {
    gdp: '$14.7T',
    population: '1.4B',
    growth: '+8.1%',
    exports: ['Electronics', 'Machinery', 'Textiles'],
    companies: ['Alibaba', 'Tencent', 'ICBC']
  },
  'Japan': {
    gdp: '$5.1T',
    population: '125.7M',
    growth: '+1.6%',
    exports: ['Vehicles', 'Electronics', 'Machinery'],
    companies: ['Toyota', 'Sony', 'SoftBank']
  },
  // Add more countries...
}

type Coordinate = `${number}_${number}`

interface WorldMapData {
  regions: {
    [key: string]: {
      coordinates: Coordinate[]
      countries: {
        [key: string]: {
          coordinates: Coordinate[]
          pieceType: string
          gdp: string
          population: string
        }
      }
    }
  }
}

export default function WorldChessBoard({ game, onSquareClick }: WorldChessBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [worldMap, setWorldMap] = useState<ReturnType<typeof generateWorldMap> | null>(null)
  const [tooltip, setTooltip] = useState<TooltipInfo | null>(null)
  const [zoom, setZoom] = useState({ scale: 1, offsetX: 0, offsetY: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  // Generate map on mount
  useEffect(() => {
    setWorldMap(generateWorldMap())
  }, [])

  useEffect(() => {
    if (!worldMap) return
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const updateCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      drawMap(ctx)
    }

    window.addEventListener('resize', updateCanvasSize)
    updateCanvasSize()

    return () => window.removeEventListener('resize', updateCanvasSize)
  }, [worldMap, game])

  function drawMap(ctx: CanvasRenderingContext2D) {
    if (!worldMap) return

    const { width, height, heightMap, countries } = worldMap
    
    // Clear canvas
    ctx.fillStyle = '#0c2444'
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    // Apply zoom transformation
    ctx.save()
    ctx.translate(zoom.offsetX, zoom.offsetY)
    ctx.scale(zoom.scale, zoom.scale)

    const cellWidth = ctx.canvas.width / width
    const cellHeight = ctx.canvas.height / height

    // Draw terrain
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const elevation = heightMap[y][x]
        if (elevation > 0.4) { // Land
          ctx.fillStyle = `hsl(100, 30%, ${elevation * 50}%)`
          ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight)
        }
      }
    }

    // Draw countries
    countries.forEach(country => {
      // Draw territory
      country.coordinates.forEach(coord => {
        const [x, y] = coord.split('_').map(Number)
        ctx.fillStyle = country.color + '80' // Add transparency
        ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight)
      })

      // Draw pieces
      country.pieces.forEach(piece => {
        drawPiece(ctx, {
          type: piece.type,
          color: game.turn() // Use game turn to determine piece color
        }, piece.x * cellWidth, piece.y * cellHeight, cellWidth, cellHeight)
      })
    })

    // Draw ocean effect
    drawOceanEffect(ctx)

    // Reset transformation
    ctx.restore()
  }

  function handleCanvasClick(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!worldMap || !onSquareClick) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = Math.floor((e.clientX - rect.left) / (canvas.width / worldMap.width))
    const y = Math.floor((e.clientY - rect.top) / (canvas.height / worldMap.height))

    // Find clicked country and piece
    const country = worldMap.countries.find(c => 
      c.coordinates.includes(`${x}_${y}`)
    )
    const piece = country?.pieces.find(p => p.x === x && p.y === y)

    if (piece) {
      onSquareClick(`${String.fromCharCode(97 + x)}${8 - y}` as Square)
    }
  }

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!worldMap) return

    // Handle dragging
    if (isDragging) {
      const newOffsetX = e.clientX - dragStart.x
      const newOffsetY = e.clientY - dragStart.y
      setZoom(prev => ({ ...prev, offsetX: newOffsetX, offsetY: newOffsetY }))
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = Math.floor((e.clientX - rect.left) / (canvas.width / worldMap.width))
    const y = Math.floor((e.clientY - rect.top) / (canvas.height / worldMap.height))

    const country = worldMap.countries.find(c => 
      c.coordinates.includes(`${x}_${y}`)
    )

    if (country) {
      setTooltip({
        x: e.clientX,
        y: e.clientY,
        country
      })
    } else {
      setTooltip(null)
    }
  }

  // Add the drawPiece function inside the component
  function drawPiece(
    ctx: CanvasRenderingContext2D, 
    piece: { type: string; color: string }, 
    x: number, 
    y: number, 
    width: number, 
    height: number
  ) {
    // Glow effect
    ctx.shadowColor = piece.color === 'w' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'
    ctx.shadowBlur = 15
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0

    // Background circle for the piece
    ctx.beginPath()
    ctx.arc(x + width/2, y + height/2, Math.min(width, height) * 0.4, 0, Math.PI * 2)
    ctx.fillStyle = piece.color === 'w' ? '#fff' : '#000'
    ctx.fill()
    ctx.strokeStyle = piece.color === 'w' ? '#000' : '#fff'
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw piece symbol
    ctx.fillStyle = piece.color === 'w' ? '#000' : '#fff'
    ctx.font = `bold ${height * 0.4}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(getPieceSymbol(piece.type), x + width/2, y + height/2)

    // Reset shadow
    ctx.shadowBlur = 0
  }

  // Add drawOceanEffect function
  function drawOceanEffect(ctx: CanvasRenderingContext2D) {
    const time = Date.now() * 0.001
    ctx.globalAlpha = 0.1
    
    // Multiple wave layers
    for (let layer = 0; layer < 3; layer++) {
      const scale = 0.02 + layer * 0.01
      const speed = time * (1 + layer * 0.5)
      
      for (let i = 0; i < ctx.canvas.width; i += 10) {
        for (let j = 0; j < ctx.canvas.height; j += 10) {
          const wave = Math.sin(i * scale + j * scale * 1.5 + speed) * 0.5 + 0.5
          ctx.fillStyle = `rgba(255, 255, 255, ${wave * 0.15})`
          ctx.fillRect(i, j, 2, 2)
        }
      }
    }
    ctx.globalAlpha = 1.0
  }

  // Add zoom handler
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    // Calculate new scale
    const delta = -e.deltaY * 0.001
    const newScale = Math.max(1, Math.min(5, zoom.scale + delta))
    
    // Calculate new offsets to zoom towards mouse position
    const scaleChange = newScale - zoom.scale
    const newOffsetX = zoom.offsetX - (mouseX * scaleChange)
    const newOffsetY = zoom.offsetY - (mouseY * scaleChange)

    setZoom({
      scale: newScale,
      offsetX: newOffsetX,
      offsetY: newOffsetY
    })
  }

  // Add drag handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - zoom.offsetX, y: e.clientY - zoom.offsetY })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  return (
    <div className="fixed inset-0 z-10">
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          setTooltip(null)
          setIsDragging(false)
        }}
        onWheel={handleWheel}
        className="w-full h-full"
      />
      {tooltip && (
        <div 
          className="absolute bg-black/80 backdrop-blur-sm text-white p-3 rounded-lg text-sm pointer-events-none border border-white/10"
          style={{ 
            left: tooltip.x + 10,
            top: tooltip.y,
            transform: 'translate(0, -50%)'
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: tooltip.country.color }} 
            />
            <p className="font-bold">{tooltip.country.name}</p>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <p>GDP: ${tooltip.country.strength.gdp}T</p>
            <p>Pop: {tooltip.country.strength.population}M</p>
            <p>Military: {Math.round(tooltip.country.strength.military * 100)}%</p>
            <p>Tech: {Math.round(tooltip.country.strength.technology * 100)}%</p>
          </div>
          <p className="mt-2 text-xs text-white/70">
            Pieces: {tooltip.country.pieces.length}
          </p>
        </div>
      )}
      
      {/* Add zoom controls */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        <button
          onClick={() => setZoom(prev => ({ ...prev, scale: Math.max(1, prev.scale - 0.5) }))}
          className="bg-white/10 hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center text-white"
        >
          -
        </button>
        <button
          onClick={() => setZoom(prev => ({ ...prev, scale: Math.min(5, prev.scale + 0.5) }))}
          className="bg-white/10 hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center text-white"
        >
          +
        </button>
      </div>
    </div>
  )
}

function getPieceSymbol(type: string): string {
  const symbols: Record<string, string> = {
    'p': '♟',
    'n': '♞',
    'b': '♝',
    'r': '♜',
    'q': '♛',
    'k': '♚'
  }
  return symbols[type] || '?'
}

// Helper functions for country data
function getCountryGDP(country: string): string {
  // Mock data - replace with real data
  const gdpData: Record<string, string> = {
    'USA': '$21.4T',
    'China': '$14.7T',
    'Japan': '$5.1T',
    // ... add more countries
  }
  return gdpData[country] || 'N/A'
}

function getCountryPopulation(country: string): string {
  // Mock data - replace with real data
  const popData: Record<string, string> = {
    'China': '1.4B',
    'India': '1.38B',
    'USA': '331M',
    // ... add more countries
  }
  return popData[country] || 'N/A'
} 