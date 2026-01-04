import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async getMessages(gameId: string, limit: number = 50, before?: Date) {
    const where: any = { gameId };

    if (before) {
      where.timestamp = { lt: before };
    }

    return this.prisma.chatMessage.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: limit,
    });
  }

  async createMessage(gameId: string, userId: string, message: string) {
    if (!message || message.trim().length === 0) {
      throw new BadRequestException('Message cannot be empty');
    }

    if (message.length > 500) {
      throw new BadRequestException('Message too long (max 500 characters)');
    }

    return this.prisma.chatMessage.create({
      data: {
        gameId,
        userId,
        message: message.trim(),
        messageType: 'TEXT',
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });
  }
}
