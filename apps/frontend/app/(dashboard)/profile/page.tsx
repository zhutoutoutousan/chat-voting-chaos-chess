'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ratingsApi, gamesApi } from '@/lib/api';

export default function ProfilePage() {
  const { user } = useAuth();
  const [ratings, setRatings] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      Promise.all([
        ratingsApi.getMyRatings(),
        gamesApi.getGames({ limit: 100 }),
      ])
        .then(([ratingsData, gamesData]) => {
          setRatings(ratingsData);

          // Calculate stats from games
          const userGames = gamesData.filter(
            (g: any) =>
              g.whitePlayerId === user.id || g.blackPlayerId === user.id
          );
          const wins = userGames.filter(
            (g: any) =>
              (g.result === 'WHITE_WINS' && g.whitePlayerId === user.id) ||
              (g.result === 'BLACK_WINS' && g.blackPlayerId === user.id)
          ).length;
          const losses = userGames.filter(
            (g: any) =>
              (g.result === 'WHITE_WINS' && g.blackPlayerId === user.id) ||
              (g.result === 'BLACK_WINS' && g.whitePlayerId === user.id)
          ).length;
          const draws = userGames.filter((g: any) => g.result?.includes('DRAW')).length;

          setStats({
            gamesPlayed: userGames.length,
            wins,
            losses,
            draws,
            winRate: userGames.length > 0 ? (wins / userGames.length) * 100 : 0,
          });
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Info */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">User Information</h2>
          <div className="space-y-2">
            <p>
              <span className="font-semibold">Username:</span> {user?.username}
            </p>
            <p>
              <span className="font-semibold">Email:</span> {user?.email}
            </p>
            {user?.name && (
              <p>
                <span className="font-semibold">Name:</span> {user.name}
              </p>
            )}
          </div>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Statistics</h2>
            <div className="space-y-2">
              <p>
                <span className="font-semibold">Games Played:</span> {stats.gamesPlayed}
              </p>
              <p>
                <span className="font-semibold">Wins:</span> {stats.wins}
              </p>
              <p>
                <span className="font-semibold">Losses:</span> {stats.losses}
              </p>
              <p>
                <span className="font-semibold">Draws:</span> {stats.draws}
              </p>
              <p>
                <span className="font-semibold">Win Rate:</span>{' '}
                {stats.winRate.toFixed(1)}%
              </p>
            </div>
          </div>
        )}

        {/* Ratings */}
        <div className="bg-white p-6 rounded-lg shadow md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Ratings</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {ratings.map((rating) => (
              <div key={rating.id} className="p-4 bg-gray-50 rounded">
                <div className="text-sm text-gray-600 mb-1">{rating.ratingType}</div>
                <div className="text-2xl font-bold">{rating.rating}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {rating.gamesPlayed} games
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
