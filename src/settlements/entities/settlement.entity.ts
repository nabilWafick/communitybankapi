import { ApiProperty } from '@nestjs/swagger';
import { Settlement } from '@prisma/client';

export class SettlementEntity implements Settlement {
  @ApiProperty()
  id: number;

  @ApiProperty()
  number: number;

  @ApiProperty()
  agentId: number;

  @ApiProperty()
  cardId: number;

  @ApiProperty({ nullable: true })
  collectionId: number | null;

  @ApiProperty({ nullable: true })
  transferId: number | null;

  @ApiProperty()
  isValidated: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
