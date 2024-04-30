import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AgentsModule } from './agents/agents.module';
import { ModificationsModule } from './modifications/modifications.module';
import { CollectorsModule } from './collectors/collectors.module';
import { LocalitiesModule } from './localities/localities.module';
import { CategoriesModule } from './categories/categories.module';
import { EconomicalActivitiesModule } from './economical_activities/economical_activities.module';
import { PersonalStatusModule } from './personal_status/personal_status.module';
import { ProductsModule } from './products/products.module';
import { TypesModule } from './types/types.module';
import { CardsModule } from './cards/cards.module';
import { SettlementsModule } from './settlements/settlements.module';
import { CollectionsModule } from './collections/collections.module';
import { TransfersModule } from './transfers/transfers.module';
import { StocksModule } from './stocks/stocks.module';

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
    EconomicalActivitiesModule,
    PersonalStatusModule,
    ProductsModule,
    TypesModule,
    CardsModule,
    SettlementsModule,
    CollectionsModule,
    TransfersModule,
    StocksModule,
  ],
})
export class AppModule {}
