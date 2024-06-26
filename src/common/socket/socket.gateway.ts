import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server } from 'ws';

@WebSocketGateway({ path: '/api/v1/websocket' })
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    server.setMaxListeners(20);
  }

  handleConnection(client: any, ...args: any[]) {
    // console.log('Client connected');
  }

  handleDisconnect(client: any) {
    //  console.log('Client disconnected');
  }

  emitProductEvent({ event, data }: { event: string; data: any }): void {
    const message = JSON.stringify({ event, data });
    this.server.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        // WebSocket.OPEN
        client.send(message);
      }
    });
  }
}
