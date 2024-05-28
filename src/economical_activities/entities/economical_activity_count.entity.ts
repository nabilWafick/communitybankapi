import { ApiProperty } from '@nestjs/swagger';

export class EconomicalActivityCountEntity {
  @ApiProperty()
  count: number;
}
