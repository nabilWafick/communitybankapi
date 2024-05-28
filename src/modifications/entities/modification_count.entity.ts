import { ApiProperty } from '@nestjs/swagger';

export class ModificationCountEntity {
  @ApiProperty()
  count: number;
}
