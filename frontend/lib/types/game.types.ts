export interface Game {
  id: string;
  whitePlayerId: string;
  blackPlayerId: string;
  status: GameStatus;
  result: GameResult | null;
  currentFen: string;
  timeControl: string;
  isRated: boolean;
  isChaosMode: boolean;
  isPublic: boolean;
  whiteTimeLeft: number | null;
  blackTimeLeft: number | null;
  startedAt: Date | null;
  finishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface GameWithPlayers extends Game {
  whitePlayer: {
    id: string;
    username: string;
    avatar: string | null;
  };
  blackPlayer: {
    id: string;
    username: string;
    avatar: string | null;
  };
  moves: Move[];
}

export interface Move {
  id: string;
  gameId: string;
  moveNumber: number;
  move: string;
  fen: string;
  san: string | null;
  isWhiteMove: boolean;
  evaluation: number | null;
  bestMove: string | null;
  timestamp: Date;
  timeSpent: number | null;
}

/* eslint-disable no-unused-vars, @typescript-eslint/no-unused-vars */
export enum GameStatus {
  WAITING = 'WAITING',
  IN_PROGRESS = 'IN_PROGRESS',
  FINISHED = 'FINISHED',
  ABANDONED = 'ABANDONED',
  DRAW_OFFERED = 'DRAW_OFFERED',
}
/* eslint-enable no-unused-vars, @typescript-eslint/no-unused-vars */

export type GameStatusType = keyof typeof GameStatus;

/* eslint-disable no-unused-vars, @typescript-eslint/no-unused-vars */
export enum GameResult {
  WHITE_WINS = 'WHITE_WINS',
  BLACK_WINS = 'BLACK_WINS',
  DRAW = 'DRAW',
  WHITE_RESIGNED = 'WHITE_RESIGNED',
  BLACK_RESIGNED = 'BLACK_RESIGNED',
  WHITE_TIMEOUT = 'WHITE_TIMEOUT',
  BLACK_TIMEOUT = 'BLACK_TIMEOUT',
  DRAW_AGREED = 'DRAW_AGREED',
  STALEMATE = 'STALEMATE',
  INSUFFICIENT_MATERIAL = 'INSUFFICIENT_MATERIAL',
  THREEFOLD_REPETITION = 'THREEFOLD_REPETITION',
  FIFTY_MOVE_RULE = 'FIFTY_MOVE_RULE',
}
/* eslint-enable no-unused-vars, @typescript-eslint/no-unused-vars */

export type GameResultType = keyof typeof GameResult;
