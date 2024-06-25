import { Module } from '@nestjs/common';
import { ModificationsService } from './modifications.service';
import { ModificationsController } from './modifications.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SocketGateway } from 'src/common/socket/socket.gateway';

@Module({
  imports: [PrismaModule],
  controllers: [ModificationsController],
  providers: [ModificationsService, SocketGateway],
})
export class ModificationsModule {}
