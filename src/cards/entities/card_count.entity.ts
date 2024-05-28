import { ApiProperty } from '@nestjs/swagger';

export class CardCountEntity {
  @ApiProperty()
  count: number;
}
