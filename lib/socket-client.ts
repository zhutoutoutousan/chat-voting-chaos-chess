import * as Ably from 'ably';

class AblyClient {
  private client: Ably.Realtime | null = null;
  private channels: Map<string, Ably.RealtimeChannel> = new Map();
  private connectionPromise: Promise<void> | null = null;
  private maxRetries = 3;
  private retryDelay = 2000; // 2 seconds

  constructor() {
    this.initializeClient();
  }

  private async initializeClient() {
    const apiKey = process.env.NEXT_PUBLIC_ABLY_API_KEY;
    if (!apiKey) {
      console.error('Ably API key not configured');
      return;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        this.client = new Ably.Realtime({
          key: apiKey,
          clientId: `web-${Math.random().toString(36).substr(2, 9)}`,
          disconnectedRetryTimeout: 5000,
          autoConnect: true,
        });

        this.client.connection.on('connected', () => {
          console.log('Connected to Ably');
          resolve();
        });

        this.client.connection.on('failed', (err) => {
          console.error('Failed to connect to Ably:', err);
          reject(err);
        });

        this.client.connection.on('disconnected', () => {
          console.warn('Disconnected from Ably, attempting to reconnect...');
        });

      } catch (error) {
        console.error('Error initializing Ably client:', error);
        reject(error);
      }
    });
  }

  private async ensureConnected(retryCount = 0): Promise<void> {
    if (this.client?.connection.state === 'connected') {
      return;
    }

    if (!this.connectionPromise) {
      await this.initializeClient();
    }

    try {
      await this.connectionPromise;
    } catch (error) {
      if (retryCount < this.maxRetries) {
        console.log(`Retrying connection (${retryCount + 1}/${this.maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.ensureConnected(retryCount + 1);
      }
      throw new Error('Failed to connect to Ably after multiple attempts');
    }
  }

  private async getOrCreateChannel(channelName: string): Promise<Ably.RealtimeChannel> {
    await this.ensureConnected();
    
    let channel = this.channels.get(channelName);
    if (!channel) {
      if (!this.client) {
        throw new Error('Ably client not initialized');
      }
      channel = this.client.channels.get(channelName);
      this.channels.set(channelName, channel);
    }
    return channel;
  }

  async connectToLobby(userId: string, handlers: {
    onLobbyCreated?: (lobby: any) => void;
    onLobbyRemoved?: (lobbyId: string) => void;
    onGameCreated?: (gameId: string) => void;
    onError?: (error: any) => void;
  } = {}) {
    try {
      await this.ensureConnected();
      const channel = await this.getOrCreateChannel('lobby');

      // Clean up existing lobby subscription if any
      if (this.channels.has('lobby')) {
        await this.channels.get('lobby')?.detach();
        this.channels.delete('lobby');
      }

      // Subscribe to lobby events
      if (handlers.onLobbyCreated) {
        channel.subscribe('lobby_created', (msg) => handlers.onLobbyCreated!(msg.data));
      }
      if (handlers.onLobbyRemoved) {
        channel.subscribe('lobby_removed', (msg) => handlers.onLobbyRemoved!(msg.data.lobbyId));
      }
      if (handlers.onGameCreated) {
        channel.subscribe('game_created', (msg) => handlers.onGameCreated!(msg.data.gameId));
      }
      if (handlers.onError) {
        channel.subscribe('error', (msg) => handlers.onError!(msg.data));
      }

      // Enter presence
      await channel.presence.enter({ userId });
    } catch (error) {
      console.error('Failed to connect to lobby:', error);
      handlers.onError?.(error);
      throw error;
    }
  }

  async connectToGame(gameId: string, userId: string, role: 'player' | 'spectator' = 'player', handlers: {
    onMove?: (move: any) => void;
    onPlayerJoined?: (userId: string) => void;
    onPlayerLeft?: (userId: string) => void;
    onMessage?: (message: any) => void;
    onGameStateChange?: (state: any) => void;
  } = {}) {
    await this.ensureConnected();
    const channelName = `game:${gameId}`;
    const channel = await this.getOrCreateChannel(channelName);

    // Only detach if we're switching channels, not on initial connect
    const currentChannel = this.channels.get(channelName);
    if (currentChannel && currentChannel !== channel) {
      await currentChannel.detach();
      this.channels.delete(channelName);
    }

    // Subscribe to game events
    if (handlers.onMove) {
      channel.subscribe('move_made', (msg) => handlers.onMove!(msg.data));
    }
    if (handlers.onPlayerJoined) {
      channel.subscribe('player_joined', (msg) => handlers.onPlayerJoined!(msg.data.userId));
    }
    if (handlers.onPlayerLeft) {
      channel.subscribe('player_left', (msg) => handlers.onPlayerLeft!(msg.data.userId));
    }
    if (handlers.onMessage) {
      channel.subscribe('message_sent', (msg) => handlers.onMessage!(msg.data));
    }
    if (handlers.onGameStateChange) {
      channel.subscribe('game_state', (msg) => handlers.onGameStateChange!(msg.data));
    }

    // Update presence instead of re-entering if already present
    const presence = await channel.presence.get();
    const isPresent = presence.some(member => member.clientId === this.client?.clientId);
    if (!isPresent) {
      await channel.presence.enter({ 
        userId,
        role,
        joinedAt: Date.now()
      });
    }
  }

  async createLobby(userId: string, data: any) {
    const channel = await this.getOrCreateChannel('lobby');
    await channel.publish('create_lobby', { userId, data });
  }

  async joinLobby(userId: string, lobbyId: string) {
    const channel = await this.getOrCreateChannel('lobby');
    
    return new Promise((resolve, reject) => {
      const cleanupFunctions: (() => void)[] = [];

      const gameCreatedSubscription = channel.subscribe('game_created', (msg) => {
        cleanupFunctions.forEach(cleanup => cleanup());
        resolve(msg.data.gameId);
      });
      cleanupFunctions.push(() => channel.unsubscribe('game_created'));

      const errorSubscription = channel.subscribe('error', (msg) => {
        cleanupFunctions.forEach(cleanup => cleanup());
        reject(new Error(msg.data.message));
      });
      cleanupFunctions.push(() => channel.unsubscribe('error'));

      // Request to join lobby
      channel.publish('join_lobby', { userId, lobbyId }).catch(error => {
        cleanupFunctions.forEach(cleanup => cleanup());
        reject(error);
      });

      // Set timeout
      const timeoutId = setTimeout(() => {
        cleanupFunctions.forEach(cleanup => cleanup());
        reject(new Error('Timeout joining lobby'));
      }, 5000);
      cleanupFunctions.push(() => clearTimeout(timeoutId));
    });
  }

  async makeMove(gameId: string, userId: string, move: any) {
    const channel = await this.getOrCreateChannel(`game:${gameId}`);
    await channel.publish('move', { userId, move });
  }

  async sendGameMessage(gameId: string, userId: string, text: string) {
    const channel = await this.getOrCreateChannel(`game:${gameId}`);
    await channel.publish('message', { userId, text });
  }

  async disconnect(channelName?: string) {
    try {
      if (channelName) {
        // Disconnect from specific channel
        const channel = this.channels.get(channelName);
        if (channel) {
          await channel.detach();
          this.channels.delete(channelName);
        }
      } else {
        // Disconnect from all channels
        for (const channel of this.channels.values()) {
          await channel.detach();
        }
        this.channels.clear();
        
        if (this.client) {
          await this.client.connection.close();
          this.client = null;
        }
        this.connectionPromise = null;
      }
    } catch (error) {
      console.error('Error during disconnect:', error);
    }
  }

  async getActiveGames(): Promise<string[]> {
    try {
      await this.ensureConnected();
      const channel = await this.getOrCreateChannel('game:*');
      
      return new Promise((resolve, reject) => {
        const cleanup = channel.subscribe('active_games', (msg) => {
          cleanup();
          resolve(msg.data.games.map((game: any) => game.id));
        });

        channel.publish('get_active_games', {}).catch(reject);

        setTimeout(() => {
          cleanup();
          reject(new Error('Timeout getting active games'));
        }, 15000);
      });
    } catch (error) {
      console.error('Failed to get active games:', error);
      return [];
    }
  }

  async getGameInfo(gameId: string): Promise<{
    players: string[];
    spectators: string[];
    status: 'waiting' | 'playing' | 'finished';
  }> {
    if (!this.client) throw new Error('Ably client not initialized');

    const channel = await this.getOrCreateChannel(`game:${gameId}`);
    
    try {
      // First check presence for real-time participants
      const presence = await channel.presence.get();
      
      const players = presence
        .filter(member => member.data?.role === 'player')
        .map(member => member.data.userId);
      
      const spectators = presence
        .filter(member => member.data?.role === 'spectator')
        .map(member => member.data.userId);

      // Then get game state from server
      return new Promise((resolve, reject) => {
        channel.publish('get_game_info', { gameId }).catch(reject);
        
        const cleanup = channel.subscribe('game_info', (msg) => {
          cleanup();
          const gameInfo = msg.data;
          resolve({
            players: [...new Set([...players, ...gameInfo.players])],
            spectators: [...new Set([...spectators, ...gameInfo.spectators])],
            status: gameInfo.status
          });
        });

        setTimeout(() => {
          cleanup();
          reject(new Error('Timeout getting game info'));
        }, 15000);
      });
    } catch (error) {
      console.error(`Failed to get info for game ${gameId}:`, error);
      return {
        players: [],
        spectators: [],
        status: 'waiting'
      };
    }
  }

  async getLobbies(): Promise<any[]> {
    try {
      await this.ensureConnected();
      const channel = await this.getOrCreateChannel('lobby');
      
      return new Promise((resolve, reject) => {
        // Store cleanup functions
        const cleanupFunctions: (() => void)[] = [];

        // Subscribe to lobby updates
        const lobbiesSubscription = channel.subscribe('lobbies_update', (msg) => {
          // Clean up all subscriptions
          cleanupFunctions.forEach(cleanup => cleanup());
          resolve(msg.data.lobbies);
        });
        // Ably subscriptions need to be cleaned up using unsubscribe method on the channel
        cleanupFunctions.push(() => channel.unsubscribe('lobbies_update'));

        // Subscribe to errors
        const errorSubscription = channel.subscribe('error', (msg) => {
          // Clean up all subscriptions
          cleanupFunctions.forEach(cleanup => cleanup());
          reject(new Error(msg.data.message));
        });
        cleanupFunctions.push(() => channel.unsubscribe('error'));

        // Request lobbies
        channel.publish('get_lobbies', {}).catch(error => {
          // Clean up all subscriptions
          cleanupFunctions.forEach(cleanup => cleanup());
          reject(error);
        });

        // Set timeout
        const timeoutId = setTimeout(() => {
          // Clean up all subscriptions
          cleanupFunctions.forEach(cleanup => cleanup());
          reject(new Error('Timeout getting lobbies'));
        }, 15000);
        cleanupFunctions.push(() => clearTimeout(timeoutId));
      });
    } catch (error) {
      console.error('Failed to get lobbies:', error);
      throw error;
    }
  }

  async terminateLobby(userId: string, lobbyId: string) {
    const channel = await this.getOrCreateChannel('lobby');
    await channel.publish('terminate_lobby', { userId, lobbyId });
  }

  async initiateGame(lobbyId: string) {
    const channel = await this.getOrCreateChannel('lobby');
    await channel.publish('initiate_game', { lobbyId });
  }
}

export const socketClient = new AblyClient(); 