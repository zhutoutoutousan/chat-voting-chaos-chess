import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ChessService } from '../chess/chess.service';
import { GamesService } from '../games/games.service';

export interface MoveOption {
  id: number;
  move: string;
  notation: string;
  evaluation: number;
  votes: number;
}

export interface VoteRound {
  gameId: string;
  round: number;
  options: MoveOption[];
  startTime: Date;
  endTime: Date;
  isActive: boolean;
  mode: 'MAJORITY' | 'PERCENTAGE';
}

@Injectable()
export class VotingService {
  private activeVotingRounds = new Map<string, VoteRound>();
  private userVotes = new Map<string, Map<string, number>>(); // gameId -> userId -> optionId

  constructor(
    private prisma: PrismaService,
    private chessService: ChessService,
    private gamesService: GamesService
  ) {}

  /**
   * Start a new voting round for a chaos mode game
   */
  async startVotingRound(gameId: string, durationSeconds: number = 30): Promise<VoteRound> {
    // Get game
    const game = await this.gamesService.findOne(gameId);

    if (!game.isChaosMode) {
      throw new BadRequestException('Game is not in chaos mode');
    }

    if (game.status !== 'IN_PROGRESS' && game.status !== 'WAITING') {
      throw new BadRequestException('Game is not in progress');
    }

    // Get legal moves
    const legalMoves = this.chessService.getLegalMovesVerbose(game.currentFen);

    if (legalMoves.length === 0) {
      throw new BadRequestException('No legal moves available');
    }

    // Select top 4 moves (or all if less than 4)
    const topMoves = legalMoves.slice(0, 4).map((move, index) => ({
      id: index + 1,
      move: move.from + move.to,
      notation: move.san,
      evaluation: Math.random() * 200 - 100, // Placeholder - will use engine later
      votes: 0,
    }));

    // Create voting round
    const round = this.getNextRoundNumber(gameId);
    const voteRound: VoteRound = {
      gameId,
      round,
      options: topMoves,
      startTime: new Date(),
      endTime: new Date(Date.now() + durationSeconds * 1000),
      isActive: true,
      mode: 'MAJORITY', // Default to majority mode
    };

    this.activeVotingRounds.set(gameId, voteRound);
    this.userVotes.set(gameId, new Map());

    return voteRound;
  }

  /**
   * Submit a vote for a move
   */
  async submitVote(
    gameId: string,
    userId: string,
    vote: string | number
  ): Promise<{ success: boolean; optionId?: number; error?: string }> {
    const voteRound = this.activeVotingRounds.get(gameId);

    if (!voteRound) {
      throw new NotFoundException('No active voting round');
    }

    if (new Date() > voteRound.endTime) {
      throw new BadRequestException('Voting round has ended');
    }

    // Find option by notation or ID
    let optionId: number | null = null;

    if (typeof vote === 'number') {
      optionId = vote;
    } else {
      // Try to find by notation
      const option = voteRound.options.find((opt) => opt.notation.toLowerCase() === vote.toLowerCase());
      if (option) {
        optionId = option.id;
      }
    }

    if (!optionId || optionId < 1 || optionId > voteRound.options.length) {
      throw new BadRequestException('Invalid vote');
    }

    // Get user's previous vote
    const gameVotes = this.userVotes.get(gameId) || new Map();
    const previousVote = gameVotes.get(userId);

    // Update vote counts
    if (previousVote !== undefined && previousVote !== optionId) {
      // Remove previous vote
      voteRound.options[previousVote - 1].votes--;
    }

    // Add new vote
    voteRound.options[optionId - 1].votes++;
    gameVotes.set(userId, optionId);
    this.userVotes.set(gameId, gameVotes);

    // Save vote to database
    await this.prisma.vote.create({
      data: {
        gameId,
        userId,
        move: voteRound.options[optionId - 1].move,
        votingRound: voteRound.round,
        voteWeight: 1, // Default weight, premium users can have higher
      },
    });

    return {
      success: true,
      optionId,
    };
  }

  /**
   * Get current voting status
   */
  getVotingStatus(gameId: string): VoteRound | null {
    const voteRound = this.activeVotingRounds.get(gameId);

    if (!voteRound) {
      return null;
    }

    // Check if voting is still active
    if (new Date() > voteRound.endTime) {
      voteRound.isActive = false;
    }

    return voteRound;
  }

  /**
   * End voting round and get winning move
   */
  async endVotingRound(gameId: string): Promise<{ winningMove: string; notation: string }> {
    const voteRound = this.activeVotingRounds.get(gameId);

    if (!voteRound) {
      throw new NotFoundException('No active voting round');
    }

    voteRound.isActive = false;

    let winningOption: MoveOption;

    if (voteRound.mode === 'MAJORITY') {
      // Find option with most votes
      winningOption = voteRound.options.reduce((max, opt) =>
        opt.votes > max.votes ? opt : max
      );

      // Handle ties - select first option with max votes
      const maxVotes = winningOption.votes;
      const tiedOptions = voteRound.options.filter((opt) => opt.votes === maxVotes);
      if (tiedOptions.length > 1) {
        // Random selection for ties
        winningOption = tiedOptions[Math.floor(Math.random() * tiedOptions.length)];
      }
    } else {
      // Percentage mode - weighted random selection
      const totalVotes = voteRound.options.reduce((sum, opt) => sum + opt.votes, 0);

      if (totalVotes === 0) {
        // No votes - random selection
        winningOption = voteRound.options[Math.floor(Math.random() * voteRound.options.length)];
      } else {
        const random = Math.random() * totalVotes;
        let cumulative = 0;

        for (const option of voteRound.options) {
          cumulative += option.votes;
          if (random <= cumulative) {
            winningOption = option;
            break;
          }
        }

        // Fallback to first option
        if (!winningOption!) {
          winningOption = voteRound.options[0];
        }
      }
    }

    // Clean up
    this.activeVotingRounds.delete(gameId);
    this.userVotes.delete(gameId);

    return {
      winningMove: winningOption!.move,
      notation: winningOption!.notation,
    };
  }

  /**
   * Get next round number for a game
   */
  private getNextRoundNumber(gameId: string): number {
    const existing = this.activeVotingRounds.get(gameId);
    return existing ? existing.round + 1 : 1;
  }

  /**
   * Get vote counts for a voting round
   */
  async getVoteCounts(gameId: string, round: number) {
    const votes = await this.prisma.vote.findMany({
      where: {
        gameId,
        votingRound: round,
      },
    });

    const counts = new Map<string, number>();
    votes.forEach((vote) => {
      counts.set(vote.move, (counts.get(vote.move) || 0) + vote.voteWeight);
    });

    return Object.fromEntries(counts);
  }
}
