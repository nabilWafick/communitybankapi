import { Module } from '@nestjs/common';
import { StocksService } from './stocks.service';
import { StocksController } from './stocks.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { SocketGateway } from 'src/common/socket/socket.gateway';

@Module({
  imports: [PrismaModule],
  controllers: [StocksController],
  providers: [StocksService, SocketGateway],
})
export class StocksModule {}
