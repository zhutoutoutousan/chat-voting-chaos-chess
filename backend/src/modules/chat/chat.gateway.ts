import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { getCorsOrigins } from '../../shared/utils/cors.utils';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
}

@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: getCorsOrigins(),
    credentials: true,
  },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private chatService: ChatService,
    private jwtService: JwtService
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (token) {
        const payload = this.jwtService.verify(token, {
          secret: process.env.JWT_SECRET || 'your-secret-key',
        });

        client.userId = payload.sub;
        client.username = payload.username;
      }
    } catch (error) {
      console.error('Chat WebSocket connection error:', error);
    }
  }

  @SubscribeMessage('join-chat')
  handleJoinChat(
    @MessageBody() data: { gameId: string },
    @ConnectedSocket() client: AuthenticatedSocket
  ) {
    const { gameId } = data;
    client.join(`game:${gameId}`);
    console.log(`User ${client.username} joined chat for game ${gameId}`);
  }

  @SubscribeMessage('send-message')
  async handleSendMessage(
    @MessageBody() data: { gameId: string; message: string },
    @ConnectedSocket() client: AuthenticatedSocket
  ) {
    if (!client.userId) {
      return { error: 'Unauthorized' };
    }

    const { gameId, message } = data;

    try {
      const chatMessage = await this.chatService.createMessage(gameId, client.userId, message);

      // Broadcast to all clients in the game room
      this.server.to(`game:${gameId}`).emit('new-message', {
        id: chatMessage.id,
        userId: chatMessage.userId,
        username: chatMessage.user.username,
        message: chatMessage.message,
        timestamp: chatMessage.timestamp,
      });

      return { success: true, message: chatMessage };
    } catch (error) {
      return { error: error.message };
    }
  }
}
