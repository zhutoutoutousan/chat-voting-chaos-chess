import { Module, forwardRef } from '@nestjs/common';
import { VotingController } from './voting.controller';
import { VotingService } from './voting.service';
import { VotingGateway } from './voting.gateway';
import { GamesModule } from '../games/games.module';
import { ChessModule } from '../chess/chess.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    forwardRef(() => GamesModule),
    ChessModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
    }),
  ],
  controllers: [VotingController],
  providers: [VotingService, VotingGateway],
  exports: [VotingService, VotingGateway],
})
export class VotingModule {}
