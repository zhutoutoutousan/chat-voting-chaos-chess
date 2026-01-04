import { Controller, Get, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { VotingService } from './voting.service';

@Controller('voting')
export class VotingController {
  constructor(private votingService: VotingService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('games/:gameId/start')
  async startVoting(
    @Param('gameId') gameId: string,
    @Body() body: { duration?: number }
  ) {
    return this.votingService.startVotingRound(gameId, body.duration || 30);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('games/:gameId/vote')
  async submitVote(
    @Param('gameId') gameId: string,
    @Request() req,
    @Body() body: { vote: string | number }
  ) {
    return this.votingService.submitVote(gameId, req.user.userId, body.vote);
  }

  @Get('games/:gameId/status')
  async getVotingStatus(@Param('gameId') gameId: string) {
    const status = this.votingService.getVotingStatus(gameId);
    if (!status) {
      return { active: false };
    }
    return status;
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('games/:gameId/end')
  async endVoting(@Param('gameId') gameId: string) {
    const result = await this.votingService.endVotingRound(gameId);
    return result;
  }
}
