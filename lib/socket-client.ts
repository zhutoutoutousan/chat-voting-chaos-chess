import { io, Socket } from 'socket.io-client'
import { apiClient } from './api-client'

interface SocketOptions {
  path?: string
  query?: Record<string, string>
}

class SocketClient {
  private socket: Socket | null = null
  private baseUrl: string
  private wsUrl: string

  constructor() {
    // Use separate URLs for HTTP and WebSocket
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    this.wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'
  }

  connect(options: SocketOptions = {}) {
    console.log('Attempting socket connection with options:', {
      wsUrl: this.wsUrl,
      options
    });

    if (this.socket?.connected) {
      console.log('Reusing existing connection');
      return this.socket;
    }

    // Get auth token from Clerk
    const token = window.sessionStorage.getItem('__clerk_db_jwt');

    this.socket = io(this.wsUrl, {
      path: '/socket.io',
      query: {
        ...options.query,
        token
      },
      transports: ['websocket'], // Force WebSocket only
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      withCredentials: true,
      auth: {
        token
      }
    });

    this.socket.on('auth_error', async (error) => {
      console.error('Socket auth error:', error);
      
      if (error.type === 'TOKEN_EXPIRED') {
        // Get a new token from Clerk
        const newToken = await window.Clerk.session.getToken();
        if (newToken) {
          // Store new token
          window.sessionStorage.setItem('__clerk_db_jwt', newToken);
          
          // Reconnect with new token
          this.socket?.disconnect();
          this.socket = null;
          this.connect(options);
        } else {
          // Redirect to login if can't get new token
          window.location.href = '/login';
        }
      } else {
        // Handle other auth errors
        window.location.href = '/login';
      }
    });

    this.socket.on('connect', () => {
      console.log('Socket connected successfully', this.socket?.id);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', {
        error,
        options,
        baseUrl: this.baseUrl
      });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  // Lobby specific methods
  connectToLobby(userId: string) {
    console.log('Connecting to lobby with userId:', userId);
    return this.connect({
      query: { userId }
    });
  }

  // Game specific methods
  connectToGame(gameId: string, userId: string) {
    return this.connect({
      path: '/game',
      query: { gameId, userId }
    })
  }
}

export const socketClient = new SocketClient() 