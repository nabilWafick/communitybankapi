import { ApiProperty } from '@nestjs/swagger';
import { Agent } from '@prisma/client';
import { JsonValue } from '@prisma/client/runtime/library';

export class AgentEntity implements Agent {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  firstnames: string;

  @ApiProperty({ nullable: true })
  phoneNumber: string | null;

  @ApiProperty({ nullable: true })
  address: string | null;

  @ApiProperty({ nullable: true })
  profile: string | null;

  @ApiProperty()
  email: string;

  @ApiProperty()
  permissions: JsonValue;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
