export interface User {
  id: string;
  email: string;
  emailVerified: Date | null;
  username: string;
  name: string | null;
  avatar: string | null;
  bio: string | null;
  isActive: boolean;
  isPremium: boolean;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
}

export interface UserProfile extends User {
  ratings: Rating[];
  stats: UserStats;
}

export interface UserStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  averageRating: number;
  peakRating: number;
}

export interface Rating {
  id: string;
  userId: string;
  ratingType: RatingType;
  rating: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  peakRating: number | null;
  peakRatingDate: Date | null;
}

/* eslint-disable no-unused-vars, @typescript-eslint/no-unused-vars */
export enum RatingType {
  OVERALL = 'OVERALL',
  BLITZ = 'BLITZ',
  RAPID = 'RAPID',
  CLASSICAL = 'CLASSICAL',
  CORRESPONDENCE = 'CORRESPONDENCE',
  PUZZLE = 'PUZZLE',
  CHAOS = 'CHAOS',
}
/* eslint-enable no-unused-vars, @typescript-eslint/no-unused-vars */