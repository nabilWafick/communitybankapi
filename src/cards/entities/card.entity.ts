import { ApiProperty } from '@nestjs/swagger';
import { Card } from '@prisma/client';

export class CardEntity implements Card {
  @ApiProperty()
  id: number;

  @ApiProperty()
  label: string;

  @ApiProperty()
  typeId: number;

  @ApiProperty()
  customerId: number;

  @ApiProperty()
  typesNumber: number;

  @ApiProperty({ nullable: true })
  satisfiedAt: Date | null;

  @ApiProperty({ nullable: true })
  repaidAt: Date | null;

  @ApiProperty({ nullable: true })
  transferedAt: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
