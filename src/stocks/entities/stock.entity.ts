import { ApiProperty } from '@nestjs/swagger';
import { Stock } from '@prisma/client';

export class StockEntity implements Stock {
  @ApiProperty()
  id: number;

  @ApiProperty()
  productId: number;

  @ApiProperty()
  initialQuantity: number;

  @ApiProperty()
  stockQuantity: number;

  @ApiProperty({ nullable: true })
  inputQuantity: number | null;

  @ApiProperty({ nullable: true })
  outputQuantity: number | null;

  @ApiProperty({ nullable: true })
  movementType: string | null;

  @ApiProperty({ nullable: true })
  cardId: number | null;

  @ApiProperty()
  agentId: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
