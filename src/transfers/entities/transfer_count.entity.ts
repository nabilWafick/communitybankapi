import { ApiProperty } from '@nestjs/swagger';

export class TransferCountEntity {
  @ApiProperty()
  count: number;
}
