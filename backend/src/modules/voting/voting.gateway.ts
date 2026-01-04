import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { VotingService } from './voting.service';
import { getCorsOrigins } from '../../shared/utils/cors.utils';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
}

@WebSocketGateway({
  namespace: '/voting',
  cors: {
    origin: getCorsOrigins(),
    credentials: true,
  },
})
export class VotingGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private votingService: VotingService,
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
      console.error('Voting WebSocket connection error:', error);
    }
  }

  @SubscribeMessage('join-voting')
  handleJoinVoting(
    @MessageBody() data: { gameId: string },
    @ConnectedSocket() client: AuthenticatedSocket
  ) {
    const { gameId } = data;
    client.join(`game:${gameId}`);
  }

  @SubscribeMessage('submit-vote')
  async handleSubmitVote(
    @MessageBody() data: { gameId: string; vote: string | number },
    @ConnectedSocket() client: AuthenticatedSocket
  ) {
    if (!client.userId) {
      return { error: 'Unauthorized' };
    }

    const { gameId, vote } = data;

    try {
      const result = await this.votingService.submitVote(gameId, client.userId, vote);

      if (result.success) {
        // Get updated vote status
        const status = this.votingService.getVotingStatus(gameId);

        // Broadcast vote update to all clients
        this.server.to(`game:${gameId}`).emit('vote-update', {
          votingRound: status?.round,
          voteCounts: status?.options.map((opt) => ({
            id: opt.id,
            notation: opt.notation,
            votes: opt.votes,
          })),
          timestamp: new Date(),
        });
      }

      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Broadcast voting started event
   */
  broadcastVotingStarted(gameId: string, voteRound: any) {
    this.server.to(`game:${gameId}`).emit('voting-started', {
      ...voteRound,
      timestamp: new Date(),
    });
  }

  /**
   * Broadcast voting ended event
   */
  broadcastVotingEnded(gameId: string, winningMove: string, notation: string) {
    this.server.to(`game:${gameId}`).emit('voting-ended', {
      winningMove,
      notation,
      timestamp: new Date(),
    });
  }
}
