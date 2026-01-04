import { Controller, Get, Post, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get('games/:gameId/messages')
  async getMessages(
    @Param('gameId') gameId: string,
    @Query('limit') limit: string = '50',
    @Query('before') before?: string
  ) {
    const beforeDate = before ? new Date(before) : undefined;
    return this.chatService.getMessages(gameId, parseInt(limit), beforeDate);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('games/:gameId/messages')
  async sendMessage(
    @Param('gameId') gameId: string,
    @Request() req,
    @Body() body: { message: string }
  ) {
    return this.chatService.createMessage(gameId, req.user.userId, body.message);
  }
}
