import { ApiProperty } from '@nestjs/swagger';

export class ProductCountEntity {
  @ApiProperty()
  count: number;
}
