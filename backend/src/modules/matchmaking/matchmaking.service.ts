import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RatingsService } from '../ratings/ratings.service';
import { GamesService } from '../games/games.service';
import { RatingType } from '../../shared/types';

interface MatchmakingRequest {
  userId: string;
  ratingType: RatingType;
  timeControl: string;
  isRated: boolean;
  maxRatingDiff?: number;
}

interface QueueEntry extends MatchmakingRequest {
  queuedAt: Date;
}

@Injectable()
export class MatchmakingService {
  private queues: Map<string, QueueEntry[]> = new Map();

  constructor(
    private prisma: PrismaService,
    private ratingsService: RatingsService,
    private gamesService: GamesService
  ) {}

  /**
   * Join matchmaking queue
   */
  async joinQueue(request: MatchmakingRequest): Promise<{ matched: boolean; gameId?: string }> {
    const queueKey = this.getQueueKey(request);
    const queue = this.queues.get(queueKey) || [];

    // Get user's rating
    const userRating = await this.ratingsService.getOrCreateRating(
      request.userId,
      request.ratingType
    );

    const maxDiff = request.maxRatingDiff || 200;

    // Find compatible opponent
    const opponent = queue.find((entry) => {
      if (entry.userId === request.userId) return false;

      // Check rating difference
      // We'll need to get opponent's rating
      return true; // Simplified for now
    });

    if (opponent) {
      // Create game
      const game = await this.gamesService.createGame(
        request.userId,
        opponent.userId,
        request.timeControl,
        request.isRated,
        false // Not chaos mode by default
      );

      // Remove from queue
      this.removeFromQueue(queueKey, opponent.userId);

      return { matched: true, gameId: game.id };
    }

    // Add to queue
    queue.push({
      ...request,
      queuedAt: new Date(),
    });
    this.queues.set(queueKey, queue);

    return { matched: false };
  }

  /**
   * Leave matchmaking queue
   */
  leaveQueue(userId: string, ratingType: RatingType, timeControl: string) {
    const queueKey = this.getQueueKey({ userId, ratingType, timeControl, isRated: true });
    this.removeFromQueue(queueKey, userId);
  }

  /**
   * Get queue status
   */
  getQueueStatus(userId: string): { inQueue: boolean; queueKey?: string } {
    for (const [key, queue] of this.queues.entries()) {
      if (queue.some((entry) => entry.userId === userId)) {
        return { inQueue: true, queueKey: key };
      }
    }
    return { inQueue: false };
  }

  private getQueueKey(request: MatchmakingRequest): string {
    return `${request.ratingType}-${request.timeControl}-${request.isRated}`;
  }

  private removeFromQueue(queueKey: string, userId: string) {
    const queue = this.queues.get(queueKey);
    if (queue) {
      const filtered = queue.filter((entry) => entry.userId !== userId);
      if (filtered.length === 0) {
        this.queues.delete(queueKey);
      } else {
        this.queues.set(queueKey, filtered);
      }
    }
  }

  /**
   * Clean up old queue entries (older than 5 minutes)
   */
  cleanupQueue() {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    for (const [key, queue] of this.queues.entries()) {
      const filtered = queue.filter((entry) => entry.queuedAt > fiveMinutesAgo);
      if (filtered.length === 0) {
        this.queues.delete(key);
      } else {
        this.queues.set(key, filtered);
      }
    }
  }
}
