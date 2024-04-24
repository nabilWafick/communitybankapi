import { ApiProperty } from '@nestjs/swagger';
import { Modification } from '@prisma/client';

export class ModificationEntity implements Modification {
  @ApiProperty()
  id: number;

  @ApiProperty()
  agentId: number;

  @ApiProperty()
  modification: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
