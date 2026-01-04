import { Module } from '@nestjs/common';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { GamesGateway } from './games.gateway';
import { ChessModule } from '../chess/chess.module';
import { RatingsModule } from '../ratings/ratings.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ChessModule,
    RatingsModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
    }),
  ],
  controllers: [GamesController],
  providers: [GamesService, GamesGateway],
  exports: [GamesService, GamesGateway],
})
export class GamesModule {}
