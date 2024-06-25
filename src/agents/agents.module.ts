import { Module } from '@nestjs/common';
import { AgentsService } from './agents.service';
import { AgentsController } from './agents.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ModificationsModule } from 'src/modifications/modifications.module';
import { SocketGateway } from 'src/common/socket/socket.gateway';

@Module({
  imports: [PrismaModule],
  controllers: [AgentsController],
  providers: [AgentsService, SocketGateway],
})
export class AgentsModule {}
