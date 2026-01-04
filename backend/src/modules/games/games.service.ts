import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ChessService } from '../chess/chess.service';
import { RatingsService } from '../ratings/ratings.service';
import { GamesGateway } from './games.gateway';
import { GameStatus, GameResult } from '../../shared/types';

@Injectable()
export class GamesService {
  constructor(
    private prisma: PrismaService,
    private chessService: ChessService,
    private ratingsService: RatingsService,
    @Inject(forwardRef(() => GamesGateway))
    private gamesGateway: GamesGateway
  ) {}

  async findAll() {
    return this.prisma.game.findMany({
      include: {
        whitePlayer: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        blackPlayer: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });
  }

  async findOne(id: string) {
    const game = await this.prisma.game.findUnique({
      where: { id },
      include: {
        whitePlayer: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        blackPlayer: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        moves: {
          orderBy: {
            moveNumber: 'asc',
          },
        },
      },
    });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    return game;
  }

  async createGame(
    whitePlayerId: string,
    blackPlayerId: string,
    timeControl: string,
    isRated: boolean = true,
    isChaosMode: boolean = false
  ) {
    const initialFen = this.chessService.getInitialFen();
    const [initialMinutes, increment] = timeControl.split('+').map(Number);
    const initialTime = (initialMinutes || 0) * 1000; // Convert to milliseconds

    return this.prisma.game.create({
      data: {
        whitePlayerId,
        blackPlayerId,
        timeControl,
        isRated,
        isChaosMode,
        currentFen: initialFen,
        status: GameStatus.WAITING,
        whiteTimeLeft: initialTime,
        blackTimeLeft: initialTime,
      },
      include: {
        whitePlayer: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        blackPlayer: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });
  }

  async makeMove(gameId: string, move: string, userId: string) {
    const game = await this.findOne(gameId);

    if (game.status !== GameStatus.IN_PROGRESS && game.status !== GameStatus.WAITING) {
      throw new BadRequestException('Game is not in progress');
    }

    // Check if it's the player's turn
    const turn = this.chessService.getTurn(game.currentFen);
    const isWhiteTurn = turn === 'white';
    const isPlayerTurn =
      (isWhiteTurn && game.whitePlayerId === userId) ||
      (!isWhiteTurn && game.blackPlayerId === userId);

    if (!isPlayerTurn) {
      throw new BadRequestException('Not your turn');
    }

    // Validate move
    const validation = this.chessService.makeMove(game.currentFen, move);
    if (!validation.success) {
      throw new BadRequestException(validation.error || 'Invalid move');
    }

    // Check if game is over
    const gameOver = this.chessService.isGameOver(validation.newFen!);
    const nextMoveNumber = game.moves.length + 1;

    // Create move record
    const moveRecord = await this.prisma.move.create({
      data: {
        gameId,
        moveNumber: nextMoveNumber,
        move: move,
        fen: validation.newFen!,
        san: validation.san || null,
        isWhiteMove: isWhiteTurn,
      },
    });

    // Update game state
    const updateData: any = {
      currentFen: validation.newFen!,
      status: game.status === GameStatus.WAITING ? GameStatus.IN_PROGRESS : GameStatus.IN_PROGRESS,
      startedAt: game.startedAt || new Date(),
    };

    if (gameOver.isOver) {
      updateData.status = GameStatus.FINISHED;
      updateData.finishedAt = new Date();

      // Determine result
      let result: GameResult;
      let ratingResult: 'white' | 'black' | 'draw';

      if (gameOver.reason === 'CHECKMATE') {
        result = isWhiteTurn ? GameResult.WHITE_WINS : GameResult.BLACK_WINS;
        ratingResult = isWhiteTurn ? 'white' : 'black';
      } else if (gameOver.reason === 'STALEMATE') {
        result = GameResult.STALEMATE;
        ratingResult = 'draw';
      } else {
        result = GameResult.DRAW;
        ratingResult = 'draw';
      }

      updateData.result = result;

      // Update ratings if game was rated
      if (game.isRated) {
        const ratingType = this.ratingsService.getRatingTypeFromTimeControl(game.timeControl);
        await this.ratingsService.updateRatings(
          game.whitePlayerId,
          game.blackPlayerId,
          ratingResult,
          ratingType
        );
      }
    }

    const updatedGame = await this.prisma.game.update({
      where: { id: gameId },
      data: updateData,
      include: {
        whitePlayer: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        blackPlayer: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        moves: {
          orderBy: {
            moveNumber: 'asc',
          },
        },
      },
    });

    // Broadcast move to all clients
    this.gamesGateway.broadcastMove(gameId, {
      move: moveRecord,
      gameState: {
        currentFen: updatedGame.currentFen,
        status: updatedGame.status,
        result: updatedGame.result,
      },
    });

    // Broadcast game finished if game is over
    if (gameOver.isOver) {
      this.gamesGateway.broadcastGameFinished(gameId, {
        game: updatedGame,
        result: updatedGame.result,
      });
    } else {
      // Broadcast game update
      this.gamesGateway.broadcastGameUpdate(gameId, {
        game: updatedGame,
      });
    }

    return {
      game: updatedGame,
      move: moveRecord,
      gameOver: gameOver.isOver,
      result: updatedGame.result,
    };
  }

  async resignGame(gameId: string, userId: string) {
    const game = await this.findOne(gameId);

    if (game.status !== GameStatus.IN_PROGRESS && game.status !== GameStatus.WAITING) {
      throw new BadRequestException('Game is not in progress');
    }

    const isWhite = game.whitePlayerId === userId;
    const winnerResult = isWhite ? GameResult.BLACK_WINS : GameResult.WHITE_WINS;
    const ratingResult = isWhite ? 'black' : 'white';

    const updatedGame = await this.prisma.game.update({
      where: { id: gameId },
      data: {
        status: GameStatus.FINISHED,
        result: winnerResult,
        finishedAt: new Date(),
      },
    });

    // Update ratings if game was rated
    if (game.isRated) {
      const ratingType = this.ratingsService.getRatingTypeFromTimeControl(game.timeControl);
      await this.ratingsService.updateRatings(
        game.whitePlayerId,
        game.blackPlayerId,
        ratingResult,
        ratingType
      );
    }

    return updatedGame;
  }

  async offerDraw(gameId: string, userId: string) {
    const game = await this.findOne(gameId);

    if (game.status !== GameStatus.IN_PROGRESS) {
      throw new BadRequestException('Game is not in progress');
    }

    return this.prisma.game.update({
      where: { id: gameId },
      data: {
        status: GameStatus.DRAW_OFFERED,
      },
    });
  }

  async acceptDraw(gameId: string, userId: string) {
    const game = await this.findOne(gameId);

    if (game.status !== GameStatus.DRAW_OFFERED) {
      throw new BadRequestException('No draw offer pending');
    }

    const updatedGame = await this.prisma.game.update({
      where: { id: gameId },
      data: {
        status: GameStatus.FINISHED,
        result: GameResult.DRAW_AGREED,
        finishedAt: new Date(),
      },
    });

    // Update ratings if game was rated
    if (game.isRated) {
      const ratingType = this.ratingsService.getRatingTypeFromTimeControl(game.timeControl);
      await this.ratingsService.updateRatings(
        game.whitePlayerId,
        game.blackPlayerId,
        'draw',
        ratingType
      );
    }

    return updatedGame;
  }
}
