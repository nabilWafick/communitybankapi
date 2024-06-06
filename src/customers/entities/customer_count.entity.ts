import { ApiProperty } from '@nestjs/swagger';

export class CustomerCountEntity {
  @ApiProperty()
  count: number;
}
