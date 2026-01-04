'use client';

import { useState } from 'react';
import { gamesApi } from '@/lib/api';

interface GameControlsProps {
  gameId: string;
  gameStatus: string;
  onGameUpdate?: () => void;
}

export function GameControls({ gameId, gameStatus, onGameUpdate }: GameControlsProps) {
  const [loading, setLoading] = useState(false);

  const handleResign = async () => {
    if (!confirm('Are you sure you want to resign?')) return;

    setLoading(true);
    try {
      await gamesApi.resign(gameId);
      onGameUpdate?.();
    } catch (error) {
      console.error('Resign failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOfferDraw = async () => {
    if (!confirm('Offer a draw to your opponent?')) return;

    setLoading(true);
    try {
      await gamesApi.offerDraw(gameId);
      onGameUpdate?.();
    } catch (error) {
      console.error('Draw offer failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptDraw = async () => {
    setLoading(true);
    try {
      await gamesApi.acceptDraw(gameId);
      onGameUpdate?.();
    } catch (error) {
      console.error('Accept draw failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (gameStatus !== 'IN_PROGRESS' && gameStatus !== 'DRAW_OFFERED') {
    return null;
  }

  return (
    <div className="flex gap-2 p-4 bg-white rounded-lg shadow">
      {gameStatus === 'DRAW_OFFERED' && (
        <button
          onClick={handleAcceptDraw}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          Accept Draw
        </button>
      )}
      {gameStatus === 'IN_PROGRESS' && (
        <>
          <button
            onClick={handleOfferDraw}
            disabled={loading}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
          >
            Offer Draw
          </button>
          <button
            onClick={handleResign}
            disabled={loading}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
          >
            Resign
          </button>
        </>
      )}
    </div>
  );
}
