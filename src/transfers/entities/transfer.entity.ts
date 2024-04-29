import { ApiProperty } from '@nestjs/swagger';
import { Transfer } from '@prisma/client';

export class TransferEntity implements Transfer {
  @ApiProperty()
  id: number;

  @ApiProperty()
  issuingCardId: number;

  @ApiProperty()
  receivingCardId: number;

  @ApiProperty()
  agentId: number;

  @ApiProperty({ nullable: true })
  validatedAt: Date | null;

  @ApiProperty({ nullable: true })
  rejectedAt: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
