import { ApiProperty } from '@nestjs/swagger';

export class StockCountEntity {
  @ApiProperty()
  count: number;
}
