import { ApiProperty } from '@nestjs/swagger';
import { EconomicalActivity } from '@prisma/client';

export class EconomicalActivityEntity implements EconomicalActivity {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
