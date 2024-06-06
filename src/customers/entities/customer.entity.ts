import { ApiProperty } from '@nestjs/swagger';
import { Customer } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export class CustomerEntity implements Customer {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  firstnames: string;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty()
  address: string;

  @ApiProperty({ nullable: true })
  occupation: string | null;

  @ApiProperty({ nullable: true })
  nicNumber: number | null;

  @ApiProperty({ nullable: true })
  categoryId: number | null;

  @ApiProperty({ nullable: true })
  localityId: number | null;

  @ApiProperty({ nullable: true })
  economicalActivityId: number | null;

  @ApiProperty({ nullable: true })
  personalStatusId: number | null;

  @ApiProperty({ nullable: true })
  collectorId: number | null;

  @ApiProperty({ nullable: true })
  profile: string | null;

  @ApiProperty({ nullable: true })
  signature: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
