import { ApiProperty } from '@nestjs/swagger';

export class CollectorCountEntity {
  @ApiProperty()
  count: number;
}
