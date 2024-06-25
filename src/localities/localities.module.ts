import { Module } from '@nestjs/common';
import { LocalitiesService } from './localities.service';
import { LocalitiesController } from './localities.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SocketGateway } from 'src/common/socket/socket.gateway';

@Module({
  imports: [PrismaModule],
  controllers: [LocalitiesController],
  providers: [LocalitiesService, SocketGateway],
})
export class LocalitiesModule {}
