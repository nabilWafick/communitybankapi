import { Module } from '@nestjs/common';
import { ModificationsService } from './modifications.service';
import { ModificationsController } from './modifications.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ModificationsController],
  providers: [ModificationsService],
})
export class ModificationsModule {}
