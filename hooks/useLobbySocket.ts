import { useEffect, useState, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { socketClient } from '@/lib/socket-client'
import { Lobby } from '@/types/lobby'
import { useRouter } from 'next/navigation'

export type Lobby = {
  id: string;
  hostId: string;
  hostName: string;
  mode: string;
  timeControl: string;
  status: 'waiting' | 'active' | 'finished';
  createdAt: string;
  expiresAt: string;
  gameId?: string;
};

export function useLobbySocket() {
  const { user } = useUser()
  const router = useRouter()
  const [lobbies, setLobbies] = useState<Lobby[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return;

    const channel = socketClient.supabase
      .channel('lobby_updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'lobbies' },
        async () => {
          // Refresh lobbies on any change
          const updatedLobbies = await socketClient.getLobbies();
          setLobbies(updatedLobbies);
        }
      )
      .subscribe();

    // Initial fetch
    socketClient.getLobbies()
      .then(setLobbies)
      .catch(err => setError(err.message))
      .finally(() => setIsLoading(false));

    return () => {
      channel.unsubscribe();
    };
  }, [user?.id]);

  const createLobby = useCallback(async (data: any) => {
    if (!user?.id) {
      setError('User not authenticated');
      return;
    }

    try {
      await socketClient.createLobby(user.id, {
        hostName: user.fullName || user.username,
        ...data
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create lobby');
    }
  }, [user?.id, user?.fullName, user?.username]);

  const joinLobby = useCallback(async (lobbyId: string) => {
    if (!user?.id) {
      setError('User not authenticated')
      return
    }

    try {
      await socketClient.joinLobby(user.id, lobbyId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join lobby')
    }
  }, [user?.id])

  const findMatch = useCallback(async () => {
    if (!user?.id) {
      setError('User not authenticated')
      return
    }

    try {
      // Implement matchmaking with Ably if needed
      console.log('Matchmaking not implemented yet')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to find match')
    }
  }, [user?.id])

  const cancelMatchmaking = useCallback(async () => {
    if (!user?.id) {
      setError('User not authenticated')
      return
    }

    try {
      // Implement matchmaking cancellation with Ably if needed
      console.log('Matchmaking cancellation not implemented yet')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel matchmaking')
    }
  }, [user?.id])

  const terminateLobby = useCallback(async (lobbyId: string) => {
    if (!user?.id) {
      setError('User not authenticated');
      return;
    }

    try {
      await socketClient.terminateLobby(user.id, lobbyId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to terminate lobby');
    }
  }, [user?.id]);

  return {
    isConnected,
    isLoading,
    error,
    lobbies,
    createLobby,
    joinLobby,
    findMatch,
    cancelMatchmaking,
    refresh: socketClient.getLobbies,
    terminateLobby,
    isOwnLobby: useCallback((lobby: Lobby) => lobby.hostId === user?.id, [user?.id])
  }
} 