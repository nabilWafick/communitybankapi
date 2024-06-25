import { Module } from '@nestjs/common';
import { CollectorsService } from './collectors.service';
import { CollectorsController } from './collectors.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SocketGateway } from 'src/common/socket/socket.gateway';

@Module({
  imports: [PrismaModule],
  controllers: [CollectorsController],
  providers: [CollectorsService, SocketGateway],
})
export class CollectorsModule {}
