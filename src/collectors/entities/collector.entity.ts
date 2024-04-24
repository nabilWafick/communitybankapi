import { ApiProperty } from '@nestjs/swagger';
import { Collector } from '@prisma/client';

export class CollectorEntity implements Collector {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  firstnames: string;

  @ApiProperty() phoneNumber: string;

  @ApiProperty()
  address: string;

  @ApiProperty({ required: false, nullable: true })
  profile: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
