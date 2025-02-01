import { WebSocket, Server } from 'ws'
import { IncomingMessage } from 'http'

interface LobbyUser {
  id: string
  name: string
  rating: number
}

interface GameLobby {
  id: string
  host: LobbyUser
  timeControl: string
  mode: 'Casual' | 'Rated'
  createdAt: Date
}

interface WebSocketMessage {
  type: 'create_lobby' | 'join_lobby' | 'leave_lobby' | 'delete_lobby' | 'find_match' | 'cancel_matchmaking'
  payload: any
}

class LobbyServer {
  private wss: Server
  private lobbies: Map<string, GameLobby> = new Map()
  private connections: Map<string, WebSocket> = new Map()
  private matchmakingQueue: Map<string, LobbyUser> = new Map()

  constructor(port: number) {
    this.wss = new Server({ port })
    this.setupWebSocket()
  }

  private setupWebSocket() {
    this.wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
      const userId = req.headers['user-id'] as string
      this.connections.set(userId, ws)

      ws.on('message', (data: string) => {
        try {
          const message: WebSocketMessage = JSON.parse(data)
          this.handleMessage(userId, message)
        } catch (error) {
          console.error('Error handling message:', error)
        }
      })

      ws.on('close', () => {
        this.connections.delete(userId)
        this.removeUserFromLobbies(userId)
        this.matchmakingQueue.delete(userId)
      })

      // Send current lobbies to new connection
      ws.send(JSON.stringify({
        type: 'lobby_list',
        payload: Array.from(this.lobbies.values())
      }))
    })
  }

  private handleMessage(userId: string, message: WebSocketMessage) {
    switch (message.type) {
      case 'create_lobby':
        this.createLobby(userId, message.payload)
        break
      case 'join_lobby':
        this.joinLobby(userId, message.payload.lobbyId)
        break
      case 'leave_lobby':
        this.leaveLobby(userId, message.payload.lobbyId)
        break
      case 'delete_lobby':
        this.deleteLobby(userId, message.payload.lobbyId)
        break
      case 'find_match':
        this.findMatch(userId, message.payload.user)
        break
      case 'cancel_matchmaking':
        this.cancelMatchmaking(userId)
        break
    }
  }

  private broadcast(message: any) {
    const data = JSON.stringify(message)
    this.connections.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data)
      }
    })
  }

  private createLobby(userId: string, lobbyData: Partial<GameLobby>) {
    const lobby: GameLobby = {
      id: Math.random().toString(36).substr(2, 9),
      host: lobbyData.host!,
      timeControl: lobbyData.timeControl!,
      mode: lobbyData.mode!,
      createdAt: new Date()
    }

    this.lobbies.set(lobby.id, lobby)
    this.broadcast({
      type: 'lobby_created',
      payload: lobby
    })
  }

  private joinLobby(userId: string, lobbyId: string) {
    const lobby = this.lobbies.get(lobbyId)
    if (!lobby) return

    // Start game logic here
    this.broadcast({
      type: 'game_started',
      payload: {
        lobbyId,
        players: [lobby.host.id, userId]
      }
    })

    this.lobbies.delete(lobbyId)
  }

  private removeUserFromLobbies(userId: string) {
    for (const [lobbyId, lobby] of this.lobbies.entries()) {
      if (lobby.host.id === userId) {
        this.lobbies.delete(lobbyId)
        this.broadcast({
          type: 'lobby_deleted',
          payload: { lobbyId }
        })
      }
    }
  }

  private deleteLobby(userId: string, lobbyId: string) {
    const lobby = this.lobbies.get(lobbyId)
    if (lobby && lobby.host.id === userId) {
      this.lobbies.delete(lobbyId)
      this.broadcast({
        type: 'lobby_deleted',
        payload: { lobbyId }
      })
    }
  }

  private findMatch(userId: string, user: LobbyUser) {
    // Remove from any existing lobbies first
    this.removeUserFromLobbies(userId)
    
    // Add to matchmaking queue
    this.matchmakingQueue.set(userId, user)
    
    // Try to find a match
    this.tryMatchPlayers()
    
    // Notify user they're in queue
    const ws = this.connections.get(userId)
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'matchmaking_status',
        payload: { status: 'searching' }
      }))
    }
  }

  private tryMatchPlayers() {
    if (this.matchmakingQueue.size < 2) return

    const players = Array.from(this.matchmakingQueue.entries())
    
    // Simple matching for now - just match first two players
    // Could be improved with rating-based matching
    const [player1, player2] = players.slice(0, 2)
    
    // Remove matched players from queue
    this.matchmakingQueue.delete(player1[0])
    this.matchmakingQueue.delete(player2[0])

    // Create game session
    const gameId = Math.random().toString(36).substr(2, 9)
    
    // Notify matched players
    const matchData = {
      type: 'match_found',
      payload: {
        gameId,
        players: [player1[1], player2[1]],
        startTime: new Date().toISOString()
      }
    }

    ;[player1, player2].forEach(([userId]) => {
      const ws = this.connections.get(userId)
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(matchData))
      }
    })
  }

  private cancelMatchmaking(userId: string) {
    this.matchmakingQueue.delete(userId)
    const ws = this.connections.get(userId)
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'matchmaking_status',
        payload: { status: 'cancelled' }
      }))
    }
  }
}

export const lobbyServer = new LobbyServer(8080) 