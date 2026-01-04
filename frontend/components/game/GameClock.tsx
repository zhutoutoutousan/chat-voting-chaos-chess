'use client';

import { useEffect, useState } from 'react';
import { formatTime } from '@/lib/utils';

interface GameClockProps {
  whiteTime: number | null; // milliseconds
  blackTime: number | null; // milliseconds
  isWhiteTurn: boolean;
  isActive: boolean;
}

export function GameClock({ whiteTime, blackTime, isWhiteTurn, isActive }: GameClockProps) {
  const [whiteDisplay, setWhiteDisplay] = useState(whiteTime);
  const [blackDisplay, setBlackDisplay] = useState(blackTime);

  useEffect(() => {
    setWhiteDisplay(whiteTime);
    setBlackDisplay(blackTime);
  }, [whiteTime, blackTime]);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      if (isWhiteTurn && whiteDisplay !== null && whiteDisplay > 0) {
        setWhiteDisplay((prev) => Math.max(0, (prev || 0) - 1000));
      } else if (!isWhiteTurn && blackDisplay !== null && blackDisplay > 0) {
        setBlackDisplay((prev) => Math.max(0, (prev || 0) - 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isWhiteTurn, isActive, whiteDisplay, blackDisplay]);

  const whiteSeconds = whiteDisplay ? Math.floor(whiteDisplay / 1000) : 0;
  const blackSeconds = blackDisplay ? Math.floor(blackDisplay / 1000) : 0;

  return (
    <div className="grid grid-cols-2 gap-4">
      <div
        className={`p-4 rounded-lg ${
          isWhiteTurn && isActive ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-100'
        }`}
      >
        <div className="text-sm text-gray-600 mb-1">White</div>
        <div className="text-2xl font-mono font-bold">
          {formatTime(whiteSeconds)}
        </div>
      </div>
      <div
        className={`p-4 rounded-lg ${
          !isWhiteTurn && isActive ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-100'
        }`}
      >
        <div className="text-sm text-gray-600 mb-1">Black</div>
        <div className="text-2xl font-mono font-bold">
          {formatTime(blackSeconds)}
        </div>
      </div>
    </div>
  );
}
