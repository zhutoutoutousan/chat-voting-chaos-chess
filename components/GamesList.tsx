import { useActiveGames } from '@/hooks/useActiveGames';

export function GamesList() {
  const { games, loading, error, refresh } = useActiveGames();

  if (loading) return <div>Loading games...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <button onClick={refresh}>Refresh</button>
      <ul>
        {games.map(game => (
          <li key={game.id}>
            Game {game.id} - {game.status}
            <br />
            Players: {game.players.join(', ')}
            {game.spectators.length > 0 && (
              <>
                <br />
                Spectators: {game.spectators.join(', ')}
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
} 