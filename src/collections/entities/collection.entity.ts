import { ApiProperty } from '@nestjs/swagger';
import { Collection } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export class CollectionEntity implements Collection {
  @ApiProperty()
  id: number;

  @ApiProperty()
  collectorId: number;

  @ApiProperty()
  amount: Decimal;

  @ApiProperty()
  rest: Decimal;

  @ApiProperty()
  agentId: number;

  @ApiProperty()
  collectedAt: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
