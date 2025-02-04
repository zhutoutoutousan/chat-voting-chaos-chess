import { useState, useEffect } from 'react';
import { socketClient } from '@/lib/socket-client';

interface GameInfo {
  id: string;
  players: string[];
  spectators: string[];
  status: 'waiting' | 'playing' | 'finished';
}

export function useActiveGames() {
  const [games, setGames] = useState<GameInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchGames = async () => {
      try {
        setLoading(true);
        const gameIds = await socketClient.getActiveGames();
        
        const gameInfoPromises = gameIds.map(id => 
          socketClient.getGameInfo(id).then(info => ({
            id,
            ...info
          }))
        );

        const gamesInfo = await Promise.all(gameInfoPromises);
        
        if (mounted) {
          setGames(gamesInfo);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch games');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchGames();
    
    // Set up polling to refresh the list periodically
    const interval = setInterval(fetchGames, 10000); // Refresh every 10 seconds

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return {
    games,
    loading,
    error,
    refresh: async () => {
      setLoading(true);
      try {
        const gameIds = await socketClient.getActiveGames();
        const gameInfoPromises = gameIds.map(id => 
          socketClient.getGameInfo(id).then(info => ({
            id,
            ...info
          }))
        );
        const gamesInfo = await Promise.all(gameInfoPromises);
        setGames(gamesInfo);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch games');
      } finally {
        setLoading(false);
      }
    }
  };
} 