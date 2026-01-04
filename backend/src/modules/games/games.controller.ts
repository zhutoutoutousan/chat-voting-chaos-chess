import { Controller, Get, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GamesService } from './games.service';
import { CreateGameDto } from './dto/create-game.dto';
import { MakeMoveDto } from './dto/make-move.dto';

@Controller('games')
export class GamesController {
  constructor(private gamesService: GamesService) {}

  @Get()
  findAll() {
    return this.gamesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gamesService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Request() req, @Body() createGameDto: CreateGameDto) {
    return this.gamesService.createGame(
      req.user.userId,
      createGameDto.opponentId,
      createGameDto.timeControl,
      createGameDto.isRated ?? true,
      createGameDto.isChaosMode ?? false
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/moves')
  makeMove(@Param('id') id: string, @Request() req, @Body() makeMoveDto: MakeMoveDto) {
    return this.gamesService.makeMove(id, makeMoveDto.move, req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/resign')
  resign(@Param('id') id: string, @Request() req) {
    return this.gamesService.resignGame(id, req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/draw-offer')
  offerDraw(@Param('id') id: string, @Request() req) {
    return this.gamesService.offerDraw(id, req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/draw-accept')
  acceptDraw(@Param('id') id: string, @Request() req) {
    return this.gamesService.acceptDraw(id, req.user.userId);
  }
}
