import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RatingType } from '../../shared/types';
import { calculateEloChange } from '../../shared/utils';

interface RatingUpdateResult {
  whiteRating: {
    old: number;
    new: number;
    change: number;
  };
  blackRating: {
    old: number;
    new: number;
    change: number;
  };
}

@Injectable()
export class RatingsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get K-factor based on number of games played
   */
  private getKFactor(gamesPlayed: number): number {
    if (gamesPlayed < 30) {
      return 40; // New player
    } else if (gamesPlayed < 100) {
      return 20; // Intermediate
    } else {
      return 10; // Established player
    }
  }

  /**
   * Update ratings after a game
   */
  async updateRatings(
    whitePlayerId: string,
    blackPlayerId: string,
    result: 'white' | 'black' | 'draw',
    ratingType: RatingType
  ): Promise<RatingUpdateResult> {
    // Get current ratings
    const whiteRating = await this.getOrCreateRating(whitePlayerId, ratingType);
    const blackRating = await this.getOrCreateRating(blackPlayerId, ratingType);

    // Calculate K-factors
    const whiteK = this.getKFactor(whiteRating.gamesPlayed);
    const blackK = this.getKFactor(blackRating.gamesPlayed);

    // Determine actual scores
    let whiteScore: number;
    let blackScore: number;

    switch (result) {
      case 'white':
        whiteScore = 1;
        blackScore = 0;
        break;
      case 'black':
        whiteScore = 0;
        blackScore = 1;
        break;
      case 'draw':
        whiteScore = 0.5;
        blackScore = 0.5;
        break;
    }

    // Calculate rating changes
    const whiteChange = calculateEloChange(
      whiteRating.rating,
      blackRating.rating,
      whiteScore === 1 ? 'win' : whiteScore === 0 ? 'loss' : 'draw',
      whiteK
    );

    const blackChange = calculateEloChange(
      blackRating.rating,
      whiteRating.rating,
      blackScore === 1 ? 'win' : blackScore === 0 ? 'loss' : 'draw',
      blackK
    );

    // Update white player rating
    const newWhiteRating = whiteRating.rating + whiteChange;
    const newWhiteWins = whiteScore === 1 ? whiteRating.wins + 1 : whiteRating.wins;
    const newWhiteLosses = whiteScore === 0 ? whiteRating.losses + 1 : whiteRating.losses;
    const newWhiteDraws = whiteScore === 0.5 ? whiteRating.draws + 1 : whiteRating.draws;

    const updatedWhite = await this.prisma.rating.update({
      where: {
        userId_ratingType: {
          userId: whitePlayerId,
          ratingType,
        },
      },
      data: {
        rating: newWhiteRating,
        gamesPlayed: whiteRating.gamesPlayed + 1,
        wins: newWhiteWins,
        losses: newWhiteLosses,
        draws: newWhiteDraws,
        peakRating: newWhiteRating > (whiteRating.peakRating || 0) ? newWhiteRating : whiteRating.peakRating,
        peakRatingDate:
          newWhiteRating > (whiteRating.peakRating || 0) ? new Date() : whiteRating.peakRatingDate,
      },
    });

    // Update black player rating
    const newBlackRating = blackRating.rating + blackChange;
    const newBlackWins = blackScore === 1 ? blackRating.wins + 1 : blackRating.wins;
    const newBlackLosses = blackScore === 0 ? blackRating.losses + 1 : blackRating.losses;
    const newBlackDraws = blackScore === 0.5 ? blackRating.draws + 1 : blackRating.draws;

    const updatedBlack = await this.prisma.rating.update({
      where: {
        userId_ratingType: {
          userId: blackPlayerId,
          ratingType,
        },
      },
      data: {
        rating: newBlackRating,
        gamesPlayed: blackRating.gamesPlayed + 1,
        wins: newBlackWins,
        losses: newBlackLosses,
        draws: newBlackDraws,
        peakRating: newBlackRating > (blackRating.peakRating || 0) ? newBlackRating : blackRating.peakRating,
        peakRatingDate:
          newBlackRating > (blackRating.peakRating || 0) ? new Date() : blackRating.peakRatingDate,
      },
    });

    return {
      whiteRating: {
        old: whiteRating.rating,
        new: updatedWhite.rating,
        change: whiteChange,
      },
      blackRating: {
        old: blackRating.rating,
        new: updatedBlack.rating,
        change: blackChange,
      },
    };
  }

  /**
   * Get or create rating for a user
   */
  async getOrCreateRating(userId: string, ratingType: RatingType) {
    let rating = await this.prisma.rating.findUnique({
      where: {
        userId_ratingType: {
          userId,
          ratingType,
        },
      },
    });

    if (!rating) {
      rating = await this.prisma.rating.create({
        data: {
          userId,
          ratingType,
          rating: 1200, // Initial rating
        },
      });
    }

    return rating;
  }

  /**
   * Get all ratings for a user
   */
  async getUserRatings(userId: string) {
    return this.prisma.rating.findMany({
      where: { userId },
      orderBy: {
        ratingType: 'asc',
      },
    });
  }

  /**
   * Get leaderboard for a rating type
   */
  async getLeaderboard(ratingType: RatingType, limit: number = 100, offset: number = 0) {
    const [ratings, total] = await Promise.all([
      this.prisma.rating.findMany({
        where: {
          ratingType,
          user: {
            isActive: true,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
        orderBy: {
          rating: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      this.prisma.rating.count({
        where: {
          ratingType,
          user: {
            isActive: true,
          },
        },
      }),
    ]);

    return {
      data: ratings,
      meta: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    };
  }

  /**
   * Get rating history for a user
   */
  async getRatingHistory(userId: string, ratingType: RatingType) {
    // Note: This would require a RatingHistory model for full implementation
    // For now, return current rating info
    const rating = await this.getOrCreateRating(userId, ratingType);
    return {
      ratingType,
      currentRating: rating.rating,
      peakRating: rating.peakRating,
      peakRatingDate: rating.peakRatingDate,
      gamesPlayed: rating.gamesPlayed,
      wins: rating.wins,
      losses: rating.losses,
      draws: rating.draws,
    };
  }

  /**
   * Determine rating type from time control
   */
  getRatingTypeFromTimeControl(timeControl: string): RatingType {
    const [minutes] = timeControl.split('+').map(Number);
    const totalSeconds = (minutes || 0) * 60;

    if (totalSeconds <= 180) {
      // 3 minutes or less
      return RatingType.BLITZ;
    } else if (totalSeconds <= 600) {
      // 10 minutes or less
      return RatingType.RAPID;
    } else if (totalSeconds <= 3600) {
      // 60 minutes or less
      return RatingType.CLASSICAL;
    } else {
      // More than 60 minutes
      return RatingType.CORRESPONDENCE;
    }
  }
}
