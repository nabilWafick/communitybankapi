import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'ws';

@WebSocketGateway({ path: '/api/v1/websocket' })
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: any, ...args: any[]) {
    // console.log('Client connected');
  }

  handleDisconnect(client: any) {
    //  console.log('Client disconnected');
  }

  emitProductEvent({ event, data }: { event: string; data: any }): void {
    const message = JSON.stringify({ event, data });
    this.server.clients.forEach((client) => {
      if (client.readyState === 1) {
        // WebSocket.OPEN
        client.send(message);
      }
    });
  }
}
