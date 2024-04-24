import { Module } from '@nestjs/common';
import { AgentsService } from './agents.service';
import { AgentsController } from './agents.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ModificationsModule } from 'src/modifications/modifications.module';

@Module({
  imports: [ModificationsModule, PrismaModule],
  controllers: [AgentsController],
  providers: [AgentsService],
})
export class AgentsModule {}
