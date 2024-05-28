import { ApiProperty } from '@nestjs/swagger';

export class TypeCountEntity {
  @ApiProperty()
  count: number;
}
