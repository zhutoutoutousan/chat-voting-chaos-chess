import { useEffect, useState } from 'react'
import { socketClient } from '@/lib/socket-client'
import { Socket } from 'socket.io-client'
import { useAuth } from "@clerk/nextjs"

interface Lobby {
  id: string
  hostId: string
  timeControl: string
  mode: string
  createdAt: string
}

export function useLobbySocket(userId: string) {
  const { getToken } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null)
  const [lobbies, setLobbies] = useState<Lobby[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isCreatingLobby, setIsCreatingLobby] = useState(false)
  const [isReconnecting, setIsReconnecting] = useState(false)

  useEffect(() => {
    if (!userId) {
      console.log('No userId provided, skipping socket connection');
      return;
    }

    const connectWithToken = async () => {
      setIsReconnecting(true);
      try {
        const token = await getToken();
        if (token) {
          window.sessionStorage.setItem('__clerk_db_jwt', token);
          console.log('Setting up lobby socket connection for userId:', userId);
          const socket = socketClient.connectToLobby(userId);

          socket.on('debug', (data: { message: string; data?: any; timestamp: string }) => {
            console.log(`[Server ${data.timestamp}] ${data.message}`, data.data || '');
          });

          socket.on('connect', () => {
            console.log('Lobby socket connected');
            setError(null);
          });

          socket.on('connect_error', (error) => {
            console.error('Lobby socket connection error:', error);
            setError('Failed to connect to server');
          });

          socket.on('lobbies', (data: Lobby[]) => {
            console.log('Received lobbies update:', data);
            setLobbies(data);
          });

          socket.on('lobby_created', (lobby: Lobby) => {
            setLobbies(prev => [...prev, lobby])
          })

          socket.on('lobby_removed', (lobbyId: string) => {
            setLobbies(prev => prev.filter(l => l.id !== lobbyId))
          })

          socket.on('error', (error: { type: string; message: string }) => {
            setError(error.message)
            setIsCreatingLobby(false)
          })

          socket.on('game_created', (gameId: string) => {
            // Dispatch custom event for game creation
            window.dispatchEvent(new CustomEvent('game_created', { detail: gameId }));
          })

          socket.on('disconnect', () => {
            console.log('Disconnected from lobby socket')
          })

          setSocket(socket)
        }
      } catch (error) {
        console.error('Failed to get token:', error);
      } finally {
        setIsReconnecting(false);
      }
    };

    connectWithToken();

    return () => {
      window.sessionStorage.removeItem('__clerk_db_jwt');
      socket?.disconnect();
    }
  }, [userId, getToken])

  const createLobby = async (data: { timeControl: string; mode: string }) => {
    console.log('Creating lobby:', {
      data,
      socketConnected: socket?.connected,
      isCreatingLobby
    });

    if (!socket || isCreatingLobby) {
      console.log('Cannot create lobby:', {
        reason: !socket ? 'No socket connection' : 'Already creating lobby'
      });
      return;
    }

    setIsCreatingLobby(true)
    setError(null)

    socket.emit('create_lobby', data, (response: { success: boolean; error?: string; lobby?: any }) => {
      console.log('Create lobby response:', response)
      setIsCreatingLobby(false)
      
      if (!response.success) {
        setError(response.error || 'Failed to create lobby')
      } else if (response.lobby) {
        setLobbies(prev => [...prev, response.lobby])
      }
    })
  }

  const joinLobby = (lobbyId: string) => {
    if (!socket) return
    socket.emit('join_lobby', { lobbyId })
  }

  return {
    socket,
    lobbies,
    error,
    isCreatingLobby,
    createLobby,
    joinLobby
  }
} 