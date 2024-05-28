import { ApiProperty } from '@nestjs/swagger';

export class AgentCountEntity {
  @ApiProperty()
  count: number;
}
