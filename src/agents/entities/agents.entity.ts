import { ApiProperty } from '@nestjs/swagger';
import { Agent } from '@prisma/client';
import { JsonValue } from '@prisma/client/runtime/library';

export class AgentEntity implements Agent {
  @ApiProperty()
  id: bigint;

  @ApiProperty()
  name: string;

  @ApiProperty()
  firstnames: string;

  @ApiProperty({ required: false, nullable: true })
  phoneNumber: string | null;

  @ApiProperty({ required: false, nullable: true })
  address: string | null;

  @ApiProperty({ required: false, nullable: true })
  profile: string | null;

  @ApiProperty()
  email: string;

  @ApiProperty()
  permissions: JsonValue;

  @ApiProperty()
  views: JsonValue;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
