import { ApiProperty, ApiResponse } from '@nestjs/swagger';
import { Locality } from '@prisma/client';

export class LocalityEntity implements Locality {
  @ApiProperty()
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
