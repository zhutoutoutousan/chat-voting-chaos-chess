'use client';

import { useState, useEffect } from 'react';
import { useVotingWebSocket } from '@/hooks/useVotingWebSocket';

interface MoveOption {
  id: number;
  notation: string;
  votes: number;
}

interface VotingPanelProps {
  gameId: string;
  token?: string;
  isActive: boolean;
}

export function VotingPanel({ gameId, token, isActive }: VotingPanelProps) {
  const [options, setOptions] = useState<MoveOption[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [hasVoted, setHasVoted] = useState(false);

  const { submitVote, isConnected } = useVotingWebSocket({
    gameId,
    token,
    onVotingStarted: (data) => {
      setOptions(
        data.options.map((opt: any) => ({
          id: opt.id,
          notation: opt.notation,
          votes: 0,
        }))
      );
      setHasVoted(false);
      const duration = Math.floor((new Date(data.endTime).getTime() - Date.now()) / 1000);
      setTimeRemaining(duration);
    },
    onVoteUpdate: (data) => {
      setOptions(data.voteCounts);
    },
    onVotingEnded: (_data) => {
      setOptions([]);
      setTimeRemaining(0);
    },
  });

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeRemaining]);

  const handleVote = async (optionId: number) => {
    if (!hasVoted && isConnected) {
      submitVote(optionId);
      setHasVoted(true);
    }
  };

  if (!isActive || options.length === 0) {
    return (
      <div className="p-4 border border-gray-300 rounded-lg bg-gray-50">
        <p className="text-gray-500 text-center">No active voting round</p>
      </div>
    );
  }

  const totalVotes = options.reduce((sum, opt) => sum + opt.votes, 0);

  return (
    <div className="p-4 border border-gray-300 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Vote for Next Move</h3>
        <span className="text-sm text-gray-600">{timeRemaining}s remaining</span>
      </div>

      <div className="space-y-2">
        {options.map((option) => {
          const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;

          return (
            <div key={option.id} className="space-y-1">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleVote(option.id)}
                  disabled={hasVoted || !isConnected}
                  className={`
                    flex-1 text-left px-3 py-2 rounded border
                    ${hasVoted ? 'bg-gray-200 cursor-not-allowed' : 'bg-white hover:bg-gray-50 cursor-pointer'}
                    ${!isConnected ? 'opacity-50' : ''}
                  `}
                >
                  <span className="font-mono font-semibold">{option.notation}</span>
                  <span className="ml-2 text-sm text-gray-600">
                    {option.votes} vote{option.votes !== 1 ? 's' : ''}
                  </span>
                </button>
              </div>
              {totalVotes > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {hasVoted && (
        <p className="mt-2 text-sm text-green-600 text-center">✓ Vote submitted!</p>
      )}
    </div>
  );
}
