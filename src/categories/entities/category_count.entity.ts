import { ApiProperty } from '@nestjs/swagger';

export class CategoryCountEntity {
  @ApiProperty()
  count: number;
}
