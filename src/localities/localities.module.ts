import { Module } from '@nestjs/common';
import { LocalitiesService } from './localities.service';
import { LocalitiesController } from './localities.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LocalitiesController],
  providers: [LocalitiesService],
})
export class LocalitiesModule {}
