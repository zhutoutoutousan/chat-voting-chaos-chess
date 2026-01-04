'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { gamesApi } from '@/lib/api';

export default function GamesPage() {
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    gamesApi
      .getGames()
      .then((data) => {
        setGames(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading games...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Games</h1>
        <Link
          href="/games/new"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          New Game
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.map((game) => (
          <Link
            key={game.id}
            href={`/games/${game.id}`}
            className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold">
                  {game.whitePlayer?.username} vs {game.blackPlayer?.username}
                </p>
                <p className="text-sm text-gray-600">{game.timeControl}</p>
              </div>
              <span
                className={`px-2 py-1 rounded text-xs ${
                  game.status === 'IN_PROGRESS'
                    ? 'bg-green-100 text-green-800'
                    : game.status === 'FINISHED'
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {game.status}
              </span>
            </div>
            {game.isChaosMode && (
              <span className="inline-block mt-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                Chaos Mode
              </span>
            )}
          </Link>
        ))}
      </div>

      {games.length === 0 && (
        <p className="text-center text-gray-500 mt-8">No games found</p>
      )}
    </div>
  );
}
