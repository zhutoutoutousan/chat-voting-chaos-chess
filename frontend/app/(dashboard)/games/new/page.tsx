'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { gamesApi } from '@/lib/api';
import { DEFAULT_TIME_CONTROLS } from '@/lib/constants';

export default function NewGamePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    opponentId: '',
    timeControl: '300+0',
    isRated: true,
    isChaosMode: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const game = await gamesApi.createGame({
        opponentId: formData.opponentId,
        timeControl: formData.timeControl,
        isRated: formData.isRated,
        isChaosMode: formData.isChaosMode,
      });
      router.push(`/games/${game.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create game');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Create New Game</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
        <div>
          <label htmlFor="opponentId" className="block text-sm font-medium mb-1">
            Opponent User ID (leave empty for matchmaking)
          </label>
          <input
            id="opponentId"
            type="text"
            value={formData.opponentId}
            onChange={(e) => setFormData({ ...formData, opponentId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded"
            placeholder="Optional: Enter opponent's user ID"
          />
        </div>

        <div>
          <label htmlFor="timeControl" className="block text-sm font-medium mb-1">
            Time Control
          </label>
          <select
            id="timeControl"
            value={formData.timeControl}
            onChange={(e) => setFormData({ ...formData, timeControl: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          >
            {DEFAULT_TIME_CONTROLS.map((tc) => (
              <option key={tc.value} value={tc.value}>
                {tc.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isRated}
              onChange={(e) => setFormData({ ...formData, isRated: e.target.checked })}
              className="mr-2"
            />
            Rated Game
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isChaosMode}
              onChange={(e) => setFormData({ ...formData, isChaosMode: e.target.checked })}
              className="mr-2"
            />
            Chaos Mode
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Game'}
        </button>
      </form>
    </div>
  );
}
