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
};

export function useLobbySocket() {
  const { user } = useUser()
  const router = useRouter()
  const [lobbies, setLobbies] = useState<Lobby[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const fetchLobbies = useCallback(async () => {
    try {
      setIsLoading(true)
      const lobbiesData = await socketClient.getLobbies()
      setLobbies(lobbiesData)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch lobbies')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!user?.id) return;

    let isSubscribed = true;

    const connectToLobby = async () => {
      try {
        await socketClient.connectToLobby(user.id, {
          onLobbyCreated: (lobby) => {
            if (!isSubscribed) return;
            setLobbies(prev => {
              const exists = prev.some(l => l.id === lobby.id);
              if (exists) return prev;
              return [lobby, ...prev];
            });
          },
          onLobbyRemoved: (lobbyId) => {
            setLobbies(prev => prev.filter(l => l.id !== lobbyId))
          },
          onGameCreated: (gameId) => {
            console.log('Game created, navigating to:', gameId);
            router.push(`/game/${gameId}`);
          },
          onError: (error) => {
            setError(error.message)
          }
        });
        setIsConnected(true);
        await fetchLobbies();
      } catch (err) {
        if (!isSubscribed) return;
        setError(err instanceof Error ? err.message : 'Failed to connect to lobby');
        setIsConnected(false);
      }
    };

    connectToLobby();

    const refreshInterval = setInterval(fetchLobbies, 30000);

    return () => {
      isSubscribed = false;
      clearInterval(refreshInterval);
      socketClient.disconnect();
    };
  }, [user?.id, fetchLobbies, router]);

  const createLobby = useCallback(async (data: any) => {
    if (!user?.id) {
      setError('User not authenticated')
      return
    }

    try {
      await socketClient.createLobby(user.id, data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create lobby')
    }
  }, [user?.id])

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
    refresh: fetchLobbies,
    terminateLobby,
    isOwnLobby: useCallback((lobby: Lobby) => lobby.hostId === user?.id, [user?.id])
  }
} 