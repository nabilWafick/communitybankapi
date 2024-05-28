import { ApiProperty } from '@nestjs/swagger';

export class PersonalStatusCountEntity {
  @ApiProperty()
  count: number;
}
