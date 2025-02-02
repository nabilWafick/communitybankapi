import { Module } from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { CollectionsController } from './collections.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SocketGateway } from 'src/common/socket/socket.gateway';

@Module({
  imports: [PrismaModule],
  controllers: [CollectionsController],
  providers: [CollectionsService, SocketGateway],
})
export class CollectionsModule {}
