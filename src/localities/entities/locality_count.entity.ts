import { ApiProperty } from '@nestjs/swagger';

export class LocalityCountEntity {
  @ApiProperty()
  count: number;
}
