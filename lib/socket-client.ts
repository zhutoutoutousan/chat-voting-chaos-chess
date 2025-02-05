import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

class SupabaseClient {
  private supabase: any;
  private subscriptions: any[] = [];

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  async connectToLobby(userId: string, handlers: any) {
    const channel = this.supabase.channel('lobby_updates');

    channel
      .on('broadcast', { event: 'lobbies_update' }, (payload: any) => {
        handlers.onLobbiesUpdate?.(payload.lobbies);
      })
      .on('broadcast', { event: 'lobby_created' }, (payload: any) => {
        handlers.onLobbyCreated?.(payload);
      })
      .on('broadcast', { event: 'game_created' }, (payload: any) => {
        handlers.onGameCreated?.(payload.gameId);
      })
      .subscribe();

    this.subscriptions.push(channel);
  }

  async getLobbies(): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('lobbies')
      .select(`
        *
      `)
      .order('createdAt', { ascending: false })

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    // Transform the data to match expected format
    return data.map(lobby => ({
      id: lobby.id,
      hostId: lobby.hostId,
      hostName: lobby.host?.fullName || lobby.host?.username || 'Unknown',
      mode: lobby.mode,
      timeControl: lobby.timeControl,
      status: lobby.status,
      createdAt: lobby.createdAt,
      expiresAt: lobby.expiresAt,
      gameId: lobby.gameId
    }));
  }

  async createLobby(userId: string, data: any) {
    const lobbyData = {
      id: uuidv4(),
      hostId: userId,
      mode: data.mode,
      timeControl: data.timeControl,
      status: 'waiting',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 60000).toISOString(),
      gameId: null
    };

    const { data: lobby, error } = await this.supabase
      .from('lobbies')
      .insert(lobbyData)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    return lobby;
  }

  disconnect() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];
  }

  async getGame(gameId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('games')
      .select(`
        *,
        players:player(*)
      `)
      .eq('id', gameId)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    return data;
  }

  async makeMove(gameId: string, move: any) {
    const { data, error } = await this.supabase
      .from('game_moves')
      .insert([{
        game_id: gameId,
        ...move
      }])
      .single();

    if (error) throw error;
    return data;
  }

  async spectateGame(gameId: string) {
    const channel = this.supabase.channel(`game:${gameId}`);
    
    channel
      .on('broadcast', { event: 'game_update' }, (payload: any) => {
        // Handle game updates
      })
      .subscribe();

    this.subscriptions.push(channel);
    return channel;
  }

  async getOrCreateGame(gameId: string, userId: string): Promise<any> {
    // First get the lobby data
    const { data: lobby } = await this.supabase
      .from('lobbies')
      .select('*')
      .eq('id', gameId)
      .single();

    // Try to get existing game
    const { data: existingGame, error: getError } = await this.supabase
      .from('games')
      .select(`
        *,
        players:player(*)
      `)
      .eq('id', gameId)
      .single();

    if (!getError && existingGame) {
      // Check if we need to join as black
      if (!existingGame.blackId && existingGame.whiteId !== userId) {
        // Join as black player
        const { data: updatedGame, error: updateError } = await this.supabase
          .from('games')
          .update({ 
            blackId: userId,
            status: 'playing'
          })
          .eq('id', gameId)
          .select()
          .single();

        if (updateError) throw updateError;

        // Create player record for black
        await this.supabase
          .from('player')
          .insert({
            userId: userId,
            gameId: gameId,
            color: 'black'
          });

        return updatedGame;
      }
      return existingGame;
    }

    // Create new game if none exists
    const { data: newGame, error: createError } = await this.supabase
      .from('games')
      .insert({
        id: gameId,
        status: 'waiting',
        whiteId: userId,
        timeControl: lobby.timeControl,
        mode: lobby.mode,
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
      })
      .select()
      .single();

    if (createError) throw createError;

    // Create player record for white
    await this.supabase
      .from('player')
      .insert({
        userId: userId,
        gameId: gameId,
        color: 'white'
      });

    return newGame;
  }
}

export const socketClient = new SupabaseClient(); 