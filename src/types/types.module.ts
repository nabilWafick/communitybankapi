import { Module } from '@nestjs/common';
import { TypesService } from './types.service';
import { TypesController } from './types.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SocketGateway } from 'src/common/socket/socket.gateway';

@Module({
  imports: [PrismaModule],
  controllers: [TypesController],
  providers: [TypesService, SocketGateway],
})
export class TypesModule {}
