type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

interface RequestOptions {
  method?: RequestMethod
  body?: any
  headers?: Record<string, string>
}

class ApiClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  }

  private async request(endpoint: string, options: RequestOptions = {}) {
    const { method = 'GET', body, headers = {} } = options

    const url = `${this.baseUrl}${endpoint}`
    const requestHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    }

    try {
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('API Request failed:', error)
      throw error
    }
  }

  // Game endpoints
  async createGame(data: any) {
    return this.request('/game', {
      method: 'POST',
      body: data,
    })
  }

  async getGame(gameId: string) {
    return this.request(`/game/${gameId}`)
  }

  async makeMove(gameId: string, move: any) {
    return this.request(`/game/${gameId}/move`, {
      method: 'POST',
      body: move,
    })
  }

  // Lobby endpoints
  async createLobby(data: any) {
    return this.request('/lobby', {
      method: 'POST',
      body: data,
    })
  }

  async getLobbies() {
    return this.request('/lobby')
  }

  async joinLobby(lobbyId: string) {
    return this.request(`/lobby/${lobbyId}/join`, {
      method: 'POST',
    })
  }

  // WebSocket URL helper
  getWsUrl() {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'
    return wsUrl
  }
}

// Create a singleton instance
export const apiClient = new ApiClient() 