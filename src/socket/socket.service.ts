import { Injectable } from '@nestjs/common';
import { Client, Notification } from 'pg'; // Assuming pg-promise for notifications

import {
  WebSocketGateway,
  WsResponse,
  SubscribeMessage,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
@WebSocketGateway({ port: 7001 })
export class SocketService {
  server: Server;
  constructor(private readonly prisma: PrismaService) {}

  @SubscribeMessage('subscribeForData')
  handleSubscribe(client: Socket): WsResponse {
    // Logic to handle subscription requests (optional)
    return {
      event: 'subscribed',
      data: 'You are now subscribed for data updates.',
    };
  }

  OnGatewayDisconnect(client: Socket) {
    // Logic to handle client disconnection (optional)
  }
}
