import { ApiProperty } from '@nestjs/swagger';

export class SettlementCountEntity {
  @ApiProperty()
  count: number;
}
