import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { GamesModule } from './modules/games/games.module';
import { ChessModule } from './modules/chess/chess.module';
import { RatingsModule } from './modules/ratings/ratings.module';
import { VotingModule } from './modules/voting/voting.module';
import { ChatModule } from './modules/chat/chat.module';
import { MatchmakingModule } from './modules/matchmaking/matchmaking.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    GamesModule,
    ChessModule,
    RatingsModule,
    VotingModule,
    ChatModule,
    MatchmakingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
