import { Controller, Get, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RatingsService } from './ratings.service';
import { RatingType } from '@chaos-chess/shared';

@Controller('ratings')
export class RatingsController {
  constructor(private ratingsService: RatingsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async getMyRatings(@Request() req) {
    return this.ratingsService.getUserRatings(req.user.userId);
  }

  @Get('leaderboard')
  async getLeaderboard(
    @Query('type') type: RatingType = RatingType.OVERALL,
    @Query('limit') limit: string = '100',
    @Query('offset') offset: string = '0'
  ) {
    return this.ratingsService.getLeaderboard(type, parseInt(limit), parseInt(offset));
  }

  @Get(':userId/history')
  async getRatingHistory(
    @Param('userId') userId: string,
    @Query('type') type: RatingType = RatingType.OVERALL
  ) {
    return this.ratingsService.getRatingHistory(userId, type);
  }
}
