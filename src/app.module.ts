import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AgentsModule } from './agents/agents.module';
import { ModificationsModule } from './modifications/modifications.module';
import { CollectorsModule } from './collectors/collectors.module';
import { LocalitiesModule } from './localities/localities.module';
import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    PrismaModule,
    AgentsModule,
    ModificationsModule,
    CollectorsModule,
    LocalitiesModule,
    CategoriesModule,
  ],
})
export class AppModule {}
