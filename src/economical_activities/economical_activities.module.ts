import { Module } from '@nestjs/common';
import { EconomicalActivitiesService } from './economical_activities.service';
import { EconomicalActivitiesController } from './economical_activities.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EconomicalActivitiesController],
  providers: [EconomicalActivitiesService],
})
export class EconomicalActivitiesModule {}
