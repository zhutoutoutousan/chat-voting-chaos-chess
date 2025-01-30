import { createNoise2D } from 'simplex-noise'
import alea from 'alea'

type CountryStrength = {
  gdp: number
  population: number
  military: number
  technology: number
}

export type GeneratedCountry = {
  name: string
  coordinates: string[] // x_y format
  pieces: {
    type: 'p' | 'n' | 'b' | 'r' | 'q' | 'k'
    x: number
    y: number
  }[]
  strength: CountryStrength
  color: string
}

const COUNTRY_DATA: Record<string, CountryStrength> = {
  'USA': { gdp: 21.4, population: 331, military: 0.9, technology: 0.95 },
  'China': { gdp: 14.7, population: 1400, military: 0.85, technology: 0.8 },
  'Japan': { gdp: 5.1, population: 125, military: 0.5, technology: 0.9 },
  // Add more countries...
}

export function generateWorldMap(seed: string = Math.random().toString()) {
  const rng = alea(seed)
  const noise2D = createNoise2D(rng)
  const MAP_WIDTH = 200
  const MAP_HEIGHT = 150
  const COUNTRY_COUNT = 20
  const countries: GeneratedCountry[] = []

  // Generate landmasses using noise
  const heightMap: number[][] = Array(MAP_HEIGHT).fill(0)
    .map((_, y) => Array(MAP_WIDTH).fill(0)
      .map((_, x) => {
        const scale = 0.03
        return (noise2D(x * scale, y * scale) + 1) / 2
      }))

  // Generate country seeds
  const seeds = Array(COUNTRY_COUNT).fill(0).map(() => ({
    x: Math.floor(rng() * MAP_WIDTH),
    y: Math.floor(rng() * MAP_HEIGHT),
    country: Object.keys(COUNTRY_DATA)[Math.floor(rng() * Object.keys(COUNTRY_DATA).length)]
  }))

  // Grow countries using cellular automata
  const countryMap: (string | null)[][] = Array(MAP_HEIGHT).fill(null)
    .map(() => Array(MAP_WIDTH).fill(null))

  // Assign initial seeds
  seeds.forEach(seed => {
    if (heightMap[seed.y][seed.x] > 0.4) { // Only place on land
      countryMap[seed.y][seed.x] = seed.country
    }
  })

  // Grow countries
  for (let i = 0; i < 50; i++) {
    const newMap = countryMap.map(row => [...row])
    
    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        if (heightMap[y][x] <= 0.4) continue // Skip water

        const neighbors = getNeighbors(x, y, countryMap)
        if (!countryMap[y][x] && neighbors.length > 0) {
          // Expand to empty cell
          newMap[y][x] = neighbors[Math.floor(rng() * neighbors.length)]
        }
      }
    }
    
    for (let y = 0; y < MAP_HEIGHT; y++) {
      countryMap[y] = [...newMap[y]]
    }
  }

  // Generate countries with pieces
  Object.keys(COUNTRY_DATA).forEach(countryName => {
    const coordinates: string[] = []
    
    // Collect all coordinates for this country
    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        if (countryMap[y][x] === countryName) {
          coordinates.push(`${x}_${y}`)
        }
      }
    }

    if (coordinates.length === 0) return

    const strength = COUNTRY_DATA[countryName]
    countries.push({
      name: countryName,
      coordinates,
      pieces: generatePieces(strength, coordinates, rng),
      strength: COUNTRY_DATA[countryName],
      color: `hsl(${Math.floor(rng() * 360)}, 70%, 50%)`
    })
  })

  return {
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    heightMap,
    countries
  }
}

function getNeighbors(x: number, y: number, map: (string | null)[][]): string[] {
  const neighbors: string[] = []
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]]
  
  dirs.forEach(([dx, dy]) => {
    const nx = x + dx
    const ny = y + dy
    if (nx >= 0 && nx < map[0].length && ny >= 0 && ny < map.length) {
      const cell = map[ny][nx]
      if (cell) neighbors.push(cell)
    }
  })
  
  return neighbors
}

function generatePieces(
  strength: CountryStrength, 
  coordinates: string[],
  rng: () => number
): GeneratedCountry['pieces'] {
  const pieces: GeneratedCountry['pieces'] = []
  const totalStrength = strength.gdp/5 + strength.population/500 + strength.military + strength.technology
  
  // Calculate piece counts based on strength
  const pieceCount = {
    p: Math.floor(totalStrength * 2),     // Pawns
    n: Math.floor(totalStrength * 0.5),   // Knights
    b: Math.floor(totalStrength * 0.5),   // Bishops
    r: Math.floor(totalStrength * 0.3),   // Rooks
    q: Math.floor(totalStrength * 0.2),   // Queens
    k: 1                                  // One king
  }

  // Place pieces
  Object.entries(pieceCount).forEach(([type, count]) => {
    for (let i = 0; i < count; i++) {
      const coord = coordinates[Math.floor(rng() * coordinates.length)]
      const [x, y] = coord.split('_').map(Number)
      pieces.push({ 
        type: type as 'p' | 'n' | 'b' | 'r' | 'q' | 'k',
        x,
        y
      })
    }
  })

  return pieces
} 