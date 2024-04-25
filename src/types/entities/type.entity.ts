import { ApiProperty } from '@nestjs/swagger';
import { Type } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export class TypeEntity implements Type {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  stake: Decimal;

  @ApiProperty()
  productsIds: number[];

  @ApiProperty()
  productsNumbers: number[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
