import { Module } from '@nestjs/common';
import { MatchmakingController } from './matchmaking.controller';
import { MatchmakingService } from './matchmaking.service';
import { RatingsModule } from '../ratings/ratings.module';
import { GamesModule } from '../games/games.module';

@Module({
  imports: [RatingsModule, GamesModule],
  controllers: [MatchmakingController],
  providers: [MatchmakingService],
  exports: [MatchmakingService],
})
export class MatchmakingModule {}
