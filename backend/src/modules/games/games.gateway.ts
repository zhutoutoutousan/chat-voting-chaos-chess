import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, Inject, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { GamesService } from './games.service';
import { getCorsOrigins } from '../../shared/utils/cors.utils';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
}

@WebSocketGateway({
  namespace: '/games',
  cors: {
    origin: getCorsOrigins(),
    credentials: true,
  },
})
export class GamesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private gameRooms = new Map<string, Set<string>>(); // gameId -> Set of socketIds

  constructor(
    @Inject(forwardRef(() => GamesService))
    private gamesService: GamesService,
    private jwtService: JwtService
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Extract token from handshake
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (token) {
        // Verify JWT token
        const payload = this.jwtService.verify(token, {
          secret: process.env.JWT_SECRET || 'your-secret-key',
        });

        client.userId = payload.sub;
        client.username = payload.username;

        console.log(`Client connected: ${client.id} (User: ${client.username})`);
      } else {
        console.log(`Client connected without auth: ${client.id}`);
      }
    } catch (error) {
      console.error('WebSocket connection error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    console.log(`Client disconnected: ${client.id}`);

    // Clean up game rooms
    this.gameRooms.forEach((sockets, gameId) => {
      sockets.delete(client.id);
      if (sockets.size === 0) {
        this.gameRooms.delete(gameId);
      } else {
        // Notify others that user left
        this.server.to(`game:${gameId}`).emit('user-left', {
          userId: client.userId,
          socketId: client.id,
        });
      }
    });
  }

  @SubscribeMessage('join-game')
  handleJoinGame(
    @MessageBody() data: { gameId: string },
    @ConnectedSocket() client: AuthenticatedSocket
  ) {
    const { gameId } = data;
    client.join(`game:${gameId}`);

    if (!this.gameRooms.has(gameId)) {
      this.gameRooms.set(gameId, new Set());
    }
    this.gameRooms.get(gameId)!.add(client.id);

    // Notify others in the room
    client.to(`game:${gameId}`).emit('user-joined', {
      userId: client.userId,
      username: client.username,
      socketId: client.id,
    });

    console.log(`User ${client.username} joined game ${gameId}`);
  }

  @SubscribeMessage('leave-game')
  handleLeaveGame(
    @MessageBody() data: { gameId: string },
    @ConnectedSocket() client: AuthenticatedSocket
  ) {
    const { gameId } = data;
    client.leave(`game:${gameId}`);

    const sockets = this.gameRooms.get(gameId);
    if (sockets) {
      sockets.delete(client.id);
      if (sockets.size === 0) {
        this.gameRooms.delete(gameId);
      }
    }

    client.to(`game:${gameId}`).emit('user-left', {
      userId: client.userId,
      username: client.username,
      socketId: client.id,
    });
  }

  /**
   * Broadcast move to all clients in a game room
   */
  broadcastMove(gameId: string, moveData: any) {
    this.server.to(`game:${gameId}`).emit('move-made', {
      ...moveData,
      timestamp: new Date(),
    });
  }

  /**
   * Broadcast game state update
   */
  broadcastGameUpdate(gameId: string, gameData: any) {
    this.server.to(`game:${gameId}`).emit('game-update', {
      ...gameData,
      timestamp: new Date(),
    });
  }

  /**
   * Broadcast game finished
   */
  broadcastGameFinished(gameId: string, gameData: any) {
    this.server.to(`game:${gameId}`).emit('game-finished', {
      ...gameData,
      timestamp: new Date(),
    });
  }
}
