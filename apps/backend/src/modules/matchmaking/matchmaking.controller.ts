import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MatchmakingService } from './matchmaking.service';
import { RatingType } from '@chaos-chess/shared';

@Controller('matchmaking')
export class MatchmakingController {
  constructor(private matchmakingService: MatchmakingService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('join')
  async joinQueue(
    @Request() req,
    @Body() body: { ratingType?: RatingType; timeControl: string; isRated?: boolean; maxRatingDiff?: number }
  ) {
    return this.matchmakingService.joinQueue({
      userId: req.user.userId,
      ratingType: body.ratingType || RatingType.OVERALL,
      timeControl: body.timeControl,
      isRated: body.isRated ?? true,
      maxRatingDiff: body.maxRatingDiff,
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('leave')
  async leaveQueue(
    @Request() req,
    @Body() body: { ratingType?: RatingType; timeControl: string }
  ) {
    this.matchmakingService.leaveQueue(
      req.user.userId,
      body.ratingType || RatingType.OVERALL,
      body.timeControl
    );
    return { success: true };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('status')
  async getStatus(@Request() req) {
    return this.matchmakingService.getQueueStatus(req.user.userId);
  }
}
