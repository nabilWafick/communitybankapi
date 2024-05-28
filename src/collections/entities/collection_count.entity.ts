import { ApiProperty } from '@nestjs/swagger';

export class CollectionCountEntity {
  @ApiProperty()
  count: number;
}
