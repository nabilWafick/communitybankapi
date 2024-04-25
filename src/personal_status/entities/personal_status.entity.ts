import { ApiProperty } from '@nestjs/swagger';
import { PersonalStatus } from '@prisma/client';

export class PersonalStatusEntity implements PersonalStatus {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
