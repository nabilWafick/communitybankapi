import { Module } from '@nestjs/common';
import { PersonalStatusService } from './personal_status.service';
import { PersonalStatusController } from './personal_status.controller';
import { Prisma } from '@prisma/client';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SocketGateway } from 'src/common/socket/socket.gateway';

@Module({
  imports: [PrismaModule],
  controllers: [PersonalStatusController],
  providers: [PersonalStatusService, SocketGateway],
})
export class PersonalStatusModule {}
